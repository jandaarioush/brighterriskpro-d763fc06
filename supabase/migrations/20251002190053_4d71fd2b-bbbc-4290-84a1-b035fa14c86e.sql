-- Create storage bucket for trade screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', true);

-- Create policies for trade screenshots
CREATE POLICY "Users can view their own screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own screenshots"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own screenshots"
ON storage.objects
FOR DELETE
USING (bucket_id = 'trade-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);