-- Update handle_new_user trigger to handle profiles created by webhook
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  -- Check if profile already exists with this email
  SELECT id INTO existing_profile_id 
  FROM public.profiles 
  WHERE email = NEW.email;
  
  IF existing_profile_id IS NOT NULL AND existing_profile_id != NEW.id THEN
    -- Profile exists but with different id (created by webhook)
    -- Update the existing profile to use the auth user id
    UPDATE public.profiles 
    SET id = NEW.id, updated_at = now()
    WHERE email = NEW.email;
  ELSIF existing_profile_id IS NULL THEN
    -- No profile exists, create new one
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  -- If existing_profile_id = NEW.id, profile already correct, do nothing
  
  RETURN NEW;
END;
$$;