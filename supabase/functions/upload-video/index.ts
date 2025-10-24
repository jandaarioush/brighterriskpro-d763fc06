import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    console.log('Upload request received:', { fileName, fileSize: file?.size });

    if (!file) {
      throw new Error('No file provided');
    }

    if (!fileName) {
      throw new Error('No fileName provided');
    }

    // Validate extension
    if (!fileName.endsWith('.mp4')) {
      throw new Error('Only MP4 files are allowed');
    }

    // Validate size (150MB max)
    const maxSize = 150 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Max size: 150MB`);
    }

    console.log(`Uploading: ${fileName}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, arrayBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.error('Storage error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    console.log(`Upload successful: ${fileName}`);

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        publicUrl,
        size: file.size,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
