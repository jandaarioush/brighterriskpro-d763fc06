export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  } catch {
    return "America/Sao_Paulo";
  }
}

export function getGreeting(date: Date): "Bom dia" | "Boa tarde" | "Boa noite" {
  const h = date.getHours();

  // Bom dia: 05:00–11:59
  if (h >= 5 && h < 12) return "Bom dia";

  // Boa tarde: 12:00–17:59
  if (h >= 12 && h < 18) return "Boa tarde";

  // Boa noite: 18:00–04:59
  return "Boa noite";
}

export function firstNameFrom(user?: { name?: string; email?: string } | null): string | null {
  if (!user || !user.name?.trim()) return null;
  
  const raw = user.name.trim().split(/\s+/)[0];
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatDateTimePtBR(date: Date) {
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
  // Ex.: "terça-feira, 21 de outubro • 10:42"
  return `${capitalize(weekday)}, ${day} de ${month} • ${time}`;
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
