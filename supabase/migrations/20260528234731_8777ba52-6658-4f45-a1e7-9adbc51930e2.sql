
-- Extend can_access_condominio to include residents
CREATE OR REPLACE FUNCTION public.can_access_condominio(_condo_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _condo_id IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin')
    OR EXISTS (SELECT 1 FROM public.condominios c WHERE c.id = _condo_id AND c.admin_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.condominio_members m WHERE m.condominio_id = _condo_id AND m.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.residentes r WHERE r.condominio_id = _condo_id AND r.user_id = auth.uid())
    OR (has_role(auth.uid(), 'guardia') AND EXISTS (
      SELECT 1 FROM public.condominio_members m WHERE m.condominio_id = _condo_id AND m.user_id = auth.uid()
    ))
  )
$$;

-- Link residente to user_id on signup by email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'admin_condominio'));
  -- Auto-link residente by email if exists
  UPDATE public.residentes SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;

-- Make sure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
