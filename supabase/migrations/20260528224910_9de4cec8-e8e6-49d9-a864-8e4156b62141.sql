REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_condominio() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_condominio_owner_member() FROM PUBLIC, anon, authenticated;