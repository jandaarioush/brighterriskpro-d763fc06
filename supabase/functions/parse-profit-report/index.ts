import { z } from "https://esm.sh/zod@3.23.8";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  filename: z.string().min(1).max(300),
  contentBase64: z.string().min(10).max(20_000_000),
});

interface ParsedTrade {
  trade_date: string;
  asset_type: "indice" | "dolar";
  result_reais: number;
  result_points: number;
  contracts: number;
}

interface SkippedRow {
  raw: string;
  reason: string;
}

const normalize = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const parseBRNumber = (val: unknown): number | null => {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number" && isFinite(val)) return val;
  let s = String(val).trim();
  if (!s) return null;
  // remove R$ e espaços
  s = s.replace(/r\$/i, "").replace(/\s/g, "");
  // negativo entre parênteses
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith("-")) {
    neg = true;
    s = s.slice(1);
  }
  // formato BR: 1.234,56 -> 1234.56 ; formato US: 1,234.56 -> 1234.56
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // assume último separador é decimal
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(/\./g, "").replace(",", ".");
  }
  const n = parseFloat(s);
  if (!isFinite(n)) return null;
  return neg ? -n : n;
};

const parseDateBR = (val: unknown): string | null => {
  if (val === null || val === undefined || val === "") return null;
  // Excel serial number
  if (typeof val === "number") {
    // Excel epoch: 1899-12-30
    const ms = Math.round((val - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  // dd/mm/yyyy ou dd/mm/yy
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    let [, dd, mm, yyyy] = m;
    if (yyyy.length === 2) yyyy = "20" + yyyy;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  // yyyy-mm-dd
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
  return null;
};

const mapAsset = (raw: string): "indice" | "dolar" | null => {
  const n = normalize(raw);
  if (n.startsWith("win") || n === "indice" || n.includes("indice")) return "indice";
  if (n.startsWith("wdo") || n === "dolar" || n.includes("dolar")) return "dolar";
  return null;
};

const base64ToBytes = (b64: string): Uint8Array => {
  // remove possível data URL prefix
  const clean = b64.includes(",") ? b64.split(",")[1] : b64;
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const detectKind = (filename: string, bytes: Uint8Array): "pdf" | "xlsx" => {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "pdf";
  }
  if (filename.toLowerCase().endsWith(".pdf")) return "pdf";
  return "xlsx";
};

const findHeaderRow = (rows: any[][]): { idx: number; cols: Record<string, number> } | null => {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const row = rows[i] || [];
    const norm = row.map((c) => normalize(String(c ?? "")));
    const cols: Record<string, number> = {};
    norm.forEach((n, idx) => {
      if (!cols.data && (n === "data" || n === "data abertura" || n === "data fechamento" || n === "data operacao")) cols.data = idx;
      if (!cols.ativo && (n === "ativo" || n === "papel" || n === "instrumento" || n === "simbolo")) cols.ativo = idx;
      if (!cols.resultado && (n === "resultado" || n === "resultado liquido" || n === "liquido" || n === "resultado r$" || n === "resultado financeiro" || n.startsWith("resultado"))) cols.resultado = idx;
      if (!cols.pontos && (n === "pontos" || n === "resultado pontos" || n === "result pts")) cols.pontos = idx;
      if (!cols.qtde && (n === "qtde" || n === "quantidade" || n === "qtd" || n === "contratos")) cols.qtde = idx;
    });
    if (cols.data !== undefined && cols.ativo !== undefined && cols.resultado !== undefined) {
      return { idx: i, cols };
    }
  }
  return null;
};

const parseExcel = (bytes: Uint8Array): { entries: ParsedTrade[]; skipped: SkippedRow[] } => {
  const wb = XLSX.read(bytes, { type: "array", cellDates: false });
  const entries: ParsedTrade[] = [];
  const skipped: SkippedRow[] = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "" });
    const header = findHeaderRow(rows);
    if (!header) continue;

    for (let i = header.idx + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      if (row.every((c) => c === "" || c === null || c === undefined)) continue;

      const rawAsset = String(row[header.cols.ativo] ?? "").trim();
      const rawDate = row[header.cols.data];
      const rawResult = row[header.cols.resultado];

      if (!rawAsset || !rawDate) continue;

      const asset = mapAsset(rawAsset);
      const date = parseDateBR(rawDate);
      const result = parseBRNumber(rawResult);

      const rawText = `${rawDate} | ${rawAsset} | ${rawResult}`;

      if (!date) {
        skipped.push({ raw: rawText, reason: "Data inválida" });
        continue;
      }
      if (!asset) {
        skipped.push({ raw: rawText, reason: `Ativo "${rawAsset}" não suportado (apenas WIN/WDO)` });
        continue;
      }
      if (result === null) {
        skipped.push({ raw: rawText, reason: "Resultado inválido" });
        continue;
      }

      const points = header.cols.pontos !== undefined ? parseBRNumber(row[header.cols.pontos]) ?? 0 : 0;
      const qtd = header.cols.qtde !== undefined ? parseBRNumber(row[header.cols.qtde]) ?? 1 : 1;

      entries.push({
        trade_date: date,
        asset_type: asset,
        result_reais: result,
        result_points: points,
        contracts: Math.max(1, Math.round(qtd)),
      });
    }
    if (entries.length > 0) break; // primeira sheet com dados
  }

  return { entries, skipped };
};

const parsePdf = async (bytes: Uint8Array): Promise<{ entries: ParsedTrade[]; skipped: SkippedRow[] }> => {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  const fullText = Array.isArray(text) ? text.join("\n") : String(text);
  const lines = fullText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const entries: ParsedTrade[] = [];
  const skipped: SkippedRow[] = [];
  const dateRe = /(\d{2}\/\d{2}\/\d{4})/;
  const assetRe = /\b(WIN[A-Z]?\d{0,4}|WDO[A-Z]?\d{0,4}|WINFUT|WDOFUT)\b/i;

  for (const line of lines) {
    const dm = line.match(dateRe);
    const am = line.match(assetRe);
    if (!dm || !am) continue;
    const date = parseDateBR(dm[1]);
    const asset = mapAsset(am[1]);
    if (!date || !asset) {
      if (!asset) skipped.push({ raw: line, reason: "Ativo não suportado" });
      continue;
    }
    // pega último número da linha como resultado em R$
    const nums = line.match(/-?\(?[\d.]+,\d{2}\)?/g);
    if (!nums || nums.length === 0) {
      skipped.push({ raw: line, reason: "Sem valor numérico" });
      continue;
    }
    const result = parseBRNumber(nums[nums.length - 1]);
    if (result === null) {
      skipped.push({ raw: line, reason: "Resultado ilegível" });
      continue;
    }
    // tenta ponto: penúltimo número se houver mais de 1
    let points = 0;
    if (nums.length >= 2) {
      points = parseBRNumber(nums[nums.length - 2]) ?? 0;
    }
    entries.push({
      trade_date: date,
      asset_type: asset,
      result_reais: result,
      result_points: points,
      contracts: 1,
    });
  }
  return { entries, skipped };
};

const aggregate = (entries: ParsedTrade[]): ParsedTrade[] => {
  const map = new Map<string, ParsedTrade>();
  for (const e of entries) {
    const k = `${e.trade_date}|${e.asset_type}`;
    const cur = map.get(k);
    if (cur) {
      cur.result_reais += e.result_reais;
      cur.result_points += e.result_points;
      cur.contracts += e.contracts;
    } else {
      map.set(k, { ...e });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.trade_date.localeCompare(b.trade_date));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Payload inválido", details: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { filename, contentBase64 } = parsed.data;

    const bytes = base64ToBytes(contentBase64);
    if (bytes.length === 0) {
      return new Response(JSON.stringify({ error: "Arquivo vazio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const kind = detectKind(filename, bytes);
    const { entries, skipped } =
      kind === "pdf" ? await parsePdf(bytes) : parseExcel(bytes);

    const trades = aggregate(entries);
    const sumReais = trades.reduce((a, b) => a + b.result_reais, 0);
    const dates = trades.map((t) => t.trade_date).sort();
    const totals = {
      count: trades.length,
      sumReais,
      firstDate: dates[0] ?? null,
      lastDate: dates[dates.length - 1] ?? null,
    };

    return new Response(JSON.stringify({ trades, skipped, totals }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("parse-profit-report error:", err);
    return new Response(
      JSON.stringify({ error: "Erro ao processar arquivo", message: String(err?.message ?? err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
