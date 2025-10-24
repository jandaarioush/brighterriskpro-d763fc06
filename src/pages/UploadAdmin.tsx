import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Upload, AlertCircle, Loader2 } from "lucide-react";

interface VideoUpload {
  id: string;
  title: string;
  filename: string;
  file: File | null;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const EXPECTED_VIDEOS = [
  { id: "1", title: "Vídeo 1 - Introdução", filename: "video-1-introducao.mp4" },
  { id: "2", title: "Vídeo 2 - Dashboard", filename: "video-2-dashboard.mp4" },
  { id: "3", title: "Vídeo 3 - Calendário", filename: "video-3-calendario.mp4" },
  { id: "4", title: "Vídeo 4 - Trades", filename: "video-4-trades.mp4" },
  { id: "5", title: "Vídeo 5 - Simulador", filename: "video-5-simulador.mp4" },
];

export default function UploadAdmin() {
  const [videos, setVideos] = useState<VideoUpload[]>(
    EXPECTED_VIDEOS.map((v) => ({
      ...v,
      file: null,
      status: "pending" as const,
      progress: 0,
    }))
  );

  const handleFileSelect = (videoId: string, file: File | null) => {
    if (!file) return;

    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    // Validar extensão
    if (!file.name.endsWith(".mp4")) {
      toast.error("Apenas arquivos .mp4 são permitidos");
      return;
    }

    // Validar tamanho (200MB max)
    if (file.size > 200 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 200MB");
      return;
    }

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? { ...v, file, status: "pending" as const, progress: 0, error: undefined }
          : v
      )
    );

    toast.success(`Arquivo selecionado: ${file.name}`);
  };

  const uploadVideo = async (video: VideoUpload) => {
    if (!video.file) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }

    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id ? { ...v, status: "uploading" as const, progress: 0 } : v
      )
    );

    try {
      const filePath = video.filename;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, video.file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, status: "success" as const, progress: 100 } : v
        )
      );

      toast.success(`${video.title} enviado com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id
            ? {
                ...v,
                status: "error" as const,
                error: error.message || "Erro desconhecido",
              }
            : v
        )
      );
      toast.error(`Erro ao enviar ${video.title}: ${error.message}`);
    }
  };

  const successCount = videos.filter((v) => v.status === "success").length;
  const allUploaded = successCount === videos.length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload de Vídeos Administrativo</CardTitle>
            <CardDescription>
              Envie os 5 vídeos tutoriais para o bucket 'videos'. Progresso: {successCount}/5
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Nome esperado: <code className="text-xs">{video.filename}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {video.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {video.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    {video.status === "uploading" && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".mp4"
                    disabled={video.status === "success" || video.status === "uploading"}
                    onChange={(e) => handleFileSelect(video.id, e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => uploadVideo(video)}
                    disabled={
                      !video.file ||
                      video.status === "success" ||
                      video.status === "uploading"
                    }
                    size="sm"
                  >
                    {video.status === "uploading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : video.status === "success" ? (
                      "Enviado"
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>

                {video.status === "uploading" && (
                  <Progress value={video.progress} className="h-2" />
                )}

                {video.status === "error" && video.error && (
                  <p className="text-sm text-destructive">Erro: {video.error}</p>
                )}

                {video.file && video.status === "pending" && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {video.file.name} ({(video.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            ))}

            {allUploaded && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">
                    Todos os vídeos foram enviados com sucesso!
                  </p>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Os vídeos estão disponíveis no bucket 'videos' e podem ser visualizados na página de demonstração.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
