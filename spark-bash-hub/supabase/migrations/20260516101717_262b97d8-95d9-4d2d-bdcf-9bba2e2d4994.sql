
-- Fix set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Restrict has_role execution to internal use only (RLS policies still work because they run as definer)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

-- Remove broad listing policy on storage; public bucket files are still served via CDN URL
DROP POLICY IF EXISTS "Posters are publicly readable" ON storage.objects;
