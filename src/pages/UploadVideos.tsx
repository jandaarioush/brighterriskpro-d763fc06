import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle2, AlertCircle, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const expectedVideos = [
  "tutorial-01-configuracoes-risco.mp4",
  "tutorial-02-dashboard-parte1.mp4",
  "tutorial-03-dashboard-parte2.mp4",
  "tutorial-04-calendario.mp4",
  "tutorial-05-trades-simulador.mp4",
];

interface VideoUploadStatus {
  file: File;
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const selectedVideos: VideoUploadStatus[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file name
      if (!expectedVideos.includes(file.name)) {
        errors.push(`Arquivo ${file.name} não está na lista esperada`);
        return;
      }

      // Validate extension
      if (!file.name.endsWith('.mp4')) {
        errors.push(`Arquivo ${file.name} não é MP4`);
        return;
      }

      // Validate size (150MB max)
      const maxSize = 150 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`Arquivo ${file.name} é muito grande (máx: 150MB)`);
        return;
      }

      // Check for duplicates
      if (selectedVideos.some(v => v.fileName === file.name)) {
        errors.push(`Arquivo ${file.name} duplicado`);
        return;
      }

      selectedVideos.push({
        file,
        fileName: file.name,
        status: 'pending',
        progress: 0,
      });
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (selectedVideos.length > 0) {
      setVideos(selectedVideos);
      toast.success(`${selectedVideos.length} vídeo(s) selecionado(s)`);
    }
  };

  const uploadVideo = async (video: VideoUploadStatus, index: number) => {
    try {
      // Update status to uploading
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'uploading', progress: 0 } : v
      ));

      const formData = new FormData();
      formData.append('file', video.file);
      formData.append('fileName', video.fileName);

      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const functionUrl = `https://${projectId}.supabase.co/functions/v1/upload-video`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update status to success
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'success', progress: 100 } : v
      ));

      toast.success(`${video.fileName} enviado com sucesso!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'error', progress: 0, error: error.message } : v
      ));

      toast.error(`Erro ao enviar ${video.fileName}: ${error.message}`);
    }
  };

  const handleStartUpload = async () => {
    if (videos.length === 0) {
      toast.error('Selecione pelo menos um vídeo');
      return;
    }

    setIsUploading(true);

    // Upload videos sequentially
    for (let i = 0; i < videos.length; i++) {
      await uploadVideo(videos[i], i);
    }

    setIsUploading(false);
    toast.success('Upload concluído!');
  };

  const allSuccess = videos.length > 0 && videos.every(v => v.status === 'success');
  const uploadCount = videos.filter(v => v.status === 'success').length;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Upload className="w-8 h-8" />
              Upload de Vídeos Tutoriais
            </CardTitle>
            <CardDescription>
              Envie os vídeos para o storage do Lovable Cloud
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>IMPORTANTE:</strong> Os arquivos devem ter exatamente estes nomes:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {expectedVideos.map((name) => (
                    <li key={name} className="text-sm font-mono">{name}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            {/* File input */}
            <div className="space-y-4">
              <label htmlFor="video-input" className="block">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-1">Selecionar Vídeos</p>
                  <p className="text-sm text-muted-foreground">Clique ou arraste os arquivos MP4</p>
                </div>
                <input
                  id="video-input"
                  type="file"
                  accept="video/mp4"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {/* Selected videos list */}
              {videos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Vídeos Selecionados ({uploadCount}/{videos.length})</h3>
                  
                  {videos.map((video, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-mono text-sm mb-1">{video.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {(video.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          
                          <div>
                            {video.status === 'pending' && (
                              <span className="text-muted-foreground text-sm">Aguardando</span>
                            )}
                            {video.status === 'uploading' && (
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            )}
                            {video.status === 'success' && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {video.status === 'error' && (
                              <AlertCircle className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                        </div>
                        
                        {video.status === 'uploading' && (
                          <Progress value={video.progress} className="h-2" />
                        )}
                        
                        {video.status === 'error' && video.error && (
                          <p className="text-xs text-destructive mt-2">{video.error}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  onClick={handleStartUpload}
                  disabled={videos.length === 0 || isUploading || allSuccess}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Iniciar Upload
                    </>
                  )}
                </Button>

                {allSuccess && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/demo')}
                    className="flex-1"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Ver Página Demo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
