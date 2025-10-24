-- Criar política temporária para permitir upload público no bucket videos
CREATE POLICY "Temporary public upload for videos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'videos');