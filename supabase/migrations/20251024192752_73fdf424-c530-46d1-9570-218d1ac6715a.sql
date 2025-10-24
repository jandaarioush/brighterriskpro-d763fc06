-- Criar bucket público para vídeos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access to videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Política para permitir upload apenas para usuários autenticados (admin)
CREATE POLICY "Allow authenticated users to upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir delete apenas para usuários autenticados (admin)
CREATE POLICY "Allow authenticated users to delete videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);