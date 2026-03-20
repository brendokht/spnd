set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_email_provider()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
if (new.raw_app_meta_data ->> 'provider') IS DISTINCT FROM 'email' THEN
  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    new.id, 
    new.id,   
    jsonb_build_object(
      'sub', new.id::text,
      'email', new.email,
      'email_verified', false,
      'phone_verified', false
    ),
    'email',
    new.created_at,
    new.created_at,
    new.created_at
  );
end if;

return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_provider()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
if (new.raw_app_meta_data ->> 'provider') IS DISTINCT FROM 'email' THEN
  new.raw_app_meta_data := jsonb_set(
    coalesce(new.raw_app_meta_data::jsonb, '{}'::jsonb),
    '{provider}',
    '"google"',
    true
);
  end if;

  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created_email_provider AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_email_provider();

CREATE TRIGGER on_auth_user_created_provider BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_provider();


