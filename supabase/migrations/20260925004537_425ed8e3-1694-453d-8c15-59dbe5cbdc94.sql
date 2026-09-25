CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.biosites
  ADD COLUMN IF NOT EXISTS showcase_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS showcased_at timestamptz,
  ADD COLUMN IF NOT EXISTS seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS branding jsonb NOT NULL DEFAULT '{"enabled":true,"text":"Criado com Workfy"}'::jsonb,
  ADD COLUMN IF NOT EXISTS content_version integer NOT NULL DEFAULT 1;

CREATE TABLE public.biosite_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  biosite_id uuid NOT NULL REFERENCES public.biosites(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  size text NOT NULL DEFAULT 'standard',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  appearance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biosite_blocks TO authenticated;
GRANT ALL ON public.biosite_blocks TO service_role;
ALTER TABLE public.biosite_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY biosite_blocks_owner_select ON public.biosite_blocks FOR SELECT TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid()));
CREATE POLICY biosite_blocks_owner_insert ON public.biosite_blocks FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid()));
CREATE POLICY biosite_blocks_owner_update ON public.biosite_blocks FOR UPDATE TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid())) WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid()));
CREATE POLICY biosite_blocks_owner_delete ON public.biosite_blocks FOR DELETE TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid()));
CREATE INDEX biosite_blocks_biosite_position_idx ON public.biosite_blocks(biosite_id, position);
CREATE TRIGGER biosite_blocks_updated_at BEFORE UPDATE ON public.biosite_blocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.biosite_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  biosite_id uuid NOT NULL REFERENCES public.biosites(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  category_id text,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric,
  promotional_price numeric,
  duration_minutes integer,
  media_type text NOT NULL DEFAULT 'image',
  media_url text,
  cta_type text NOT NULL DEFAULT 'booking',
  cta_label text NOT NULL DEFAULT 'Agendar',
  featured boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biosite_services TO authenticated;
GRANT ALL ON public.biosite_services TO service_role;
ALTER TABLE public.biosite_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY biosite_services_owner_select ON public.biosite_services FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY biosite_services_owner_insert ON public.biosite_services FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid()));
CREATE POLICY biosite_services_owner_update ON public.biosite_services FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY biosite_services_owner_delete ON public.biosite_services FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX biosite_services_biosite_position_idx ON public.biosite_services(biosite_id, position);
CREATE TRIGGER biosite_services_updated_at BEFORE UPDATE ON public.biosite_services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.biosite_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  biosite_id uuid NOT NULL REFERENCES public.biosites(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  submit_label text NOT NULL DEFAULT 'Enviar',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  appearance jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biosite_forms TO authenticated;
GRANT ALL ON public.biosite_forms TO service_role;
ALTER TABLE public.biosite_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY biosite_forms_owner_select ON public.biosite_forms FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY biosite_forms_owner_insert ON public.biosite_forms FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid()));
CREATE POLICY biosite_forms_owner_update ON public.biosite_forms FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY biosite_forms_owner_delete ON public.biosite_forms FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE TRIGGER biosite_forms_updated_at BEFORE UPDATE ON public.biosite_forms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.biosite_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  biosite_id uuid NOT NULL REFERENCES public.biosites(id) ON DELETE CASCADE,
  form_id uuid REFERENCES public.biosite_forms(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL,
  name text,
  phone text,
  email text,
  message text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.biosite_leads TO authenticated;
GRANT ALL ON public.biosite_leads TO service_role;
ALTER TABLE public.biosite_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY biosite_leads_owner_select ON public.biosite_leads FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY biosite_leads_owner_update ON public.biosite_leads FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY biosite_leads_owner_delete ON public.biosite_leads FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX biosite_leads_owner_created_idx ON public.biosite_leads(owner_id, created_at DESC);
CREATE TRIGGER biosite_leads_updated_at BEFORE UPDATE ON public.biosite_leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.biosite_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  biosite_id uuid NOT NULL REFERENCES public.biosites(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.biosite_services(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.biosite_bookings TO authenticated;
GRANT ALL ON public.biosite_bookings TO service_role;
ALTER TABLE public.biosite_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY biosite_bookings_owner_select ON public.biosite_bookings FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY biosite_bookings_owner_update ON public.biosite_bookings FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY biosite_bookings_owner_delete ON public.biosite_bookings FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX biosite_bookings_owner_date_idx ON public.biosite_bookings(owner_id, scheduled_date, scheduled_time);
CREATE TRIGGER biosite_bookings_updated_at BEFORE UPDATE ON public.biosite_bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY clients_owner_all ON public.clients FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.biosite_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  biosite_id uuid NOT NULL UNIQUE REFERENCES public.biosites(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text,
  access_key_hash text NOT NULL,
  key_hint text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{"edit":true,"analytics":true,"leads":true,"bookings":true}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  delivered_at timestamptz NOT NULL DEFAULT now(),
  key_rotated_at timestamptz NOT NULL DEFAULT now(),
  last_accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biosite_deliveries TO authenticated;
GRANT ALL ON public.biosite_deliveries TO service_role;
ALTER TABLE public.biosite_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY biosite_deliveries_owner_all ON public.biosite_deliveries FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.biosites b WHERE b.id = biosite_id AND b.user_id = auth.uid()));
CREATE TRIGGER biosite_deliveries_updated_at BEFORE UPDATE ON public.biosite_deliveries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.biosite_delivery_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES public.biosite_deliveries(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.biosite_delivery_history TO authenticated;
GRANT ALL ON public.biosite_delivery_history TO service_role;
ALTER TABLE public.biosite_delivery_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY delivery_history_owner_select ON public.biosite_delivery_history FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.submit_biosite_form(p_slug text, p_form_id uuid, p_payload jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_biosite public.biosites; v_form public.biosite_forms; v_id uuid;
BEGIN
  SELECT * INTO v_biosite FROM public.biosites WHERE lower(slug)=lower(trim(p_slug)) AND status='published';
  IF v_biosite.id IS NULL THEN RAISE EXCEPTION 'Biosite unavailable'; END IF;
  SELECT * INTO v_form FROM public.biosite_forms WHERE id=p_form_id AND biosite_id=v_biosite.id AND enabled=true;
  IF v_form.id IS NULL THEN RAISE EXCEPTION 'Form unavailable'; END IF;
  INSERT INTO public.biosite_leads(biosite_id,form_id,owner_id,name,phone,email,message,answers)
  VALUES(v_biosite.id,v_form.id,v_biosite.user_id,NULLIF(left(trim(p_payload->>'name'),120),''),NULLIF(left(trim(p_payload->>'phone'),40),''),NULLIF(left(trim(p_payload->>'email'),160),''),NULLIF(left(trim(p_payload->>'message'),2000),''),p_payload - ARRAY['name','phone','email','message']) RETURNING id INTO v_id;
  INSERT INTO public.biosite_events(biosite_id,type,label) VALUES(v_biosite.id,'form_submit',left(v_form.title,160));
  RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_biosite_form(text,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_biosite_form(text,uuid,jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_biosite_booking(p_slug text, p_service_id uuid, p_name text, p_phone text, p_email text, p_date date, p_time time, p_notes text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_biosite public.biosites; v_service public.biosite_services; v_id uuid;
BEGIN
  IF p_date < current_date OR length(trim(p_name)) < 2 OR length(regexp_replace(p_phone,'[^0-9]','','g')) < 7 THEN RAISE EXCEPTION 'Invalid booking'; END IF;
  SELECT * INTO v_biosite FROM public.biosites WHERE lower(slug)=lower(trim(p_slug)) AND status='published';
  IF v_biosite.id IS NULL THEN RAISE EXCEPTION 'Biosite unavailable'; END IF;
  SELECT * INTO v_service FROM public.biosite_services WHERE id=p_service_id AND biosite_id=v_biosite.id AND available=true;
  IF v_service.id IS NULL THEN RAISE EXCEPTION 'Service unavailable'; END IF;
  INSERT INTO public.biosite_bookings(biosite_id,service_id,owner_id,customer_name,customer_phone,customer_email,scheduled_date,scheduled_time,notes)
  VALUES(v_biosite.id,v_service.id,v_biosite.user_id,left(trim(p_name),120),left(trim(p_phone),40),NULLIF(left(trim(p_email),160),''),p_date,p_time,NULLIF(left(trim(p_notes),1000),'')) RETURNING id INTO v_id;
  INSERT INTO public.biosite_events(biosite_id,type,label) VALUES(v_biosite.id,'booking_click',left(v_service.name,160));
  RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_biosite_booking(text,uuid,text,text,text,date,time,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_biosite_booking(text,uuid,text,text,text,date,time,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.rotate_biosite_access_key(p_biosite_id uuid, p_client_id uuid, p_client_name text, p_client_phone text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_key text; v_delivery_id uuid;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.biosites WHERE id=p_biosite_id AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  v_key := upper(substr(encode(gen_random_bytes(12),'hex'),1,16));
  INSERT INTO public.biosite_deliveries(biosite_id,owner_id,client_id,client_name,client_phone,access_key_hash,key_hint)
  VALUES(p_biosite_id,auth.uid(),p_client_id,left(trim(p_client_name),120),NULLIF(left(trim(p_client_phone),40),''),encode(digest(v_key,'sha256'),'hex'),right(v_key,4))
  ON CONFLICT(biosite_id) DO UPDATE SET client_id=excluded.client_id,client_name=excluded.client_name,client_phone=excluded.client_phone,access_key_hash=excluded.access_key_hash,key_hint=excluded.key_hint,status='active',key_rotated_at=now(),updated_at=now()
  RETURNING id INTO v_delivery_id;
  INSERT INTO public.biosite_delivery_history(delivery_id,owner_id,event_type) VALUES(v_delivery_id,auth.uid(),'key_rotated');
  RETURN v_key;
END; $$;
REVOKE ALL ON FUNCTION public.rotate_biosite_access_key(uuid,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rotate_biosite_access_key(uuid,uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_client_biosite(p_slug text, p_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_delivery public.biosite_deliveries; v_result jsonb;
BEGIN
  SELECT d.* INTO v_delivery FROM public.biosite_deliveries d JOIN public.biosites b ON b.id=d.biosite_id WHERE lower(b.slug)=lower(trim(p_slug)) AND d.status='active' AND d.access_key_hash=encode(digest(upper(trim(p_key)),'sha256'),'hex');
  IF v_delivery.id IS NULL THEN RETURN NULL; END IF;
  UPDATE public.biosite_deliveries SET last_accessed_at=now() WHERE id=v_delivery.id;
  SELECT to_jsonb(b) || jsonb_build_object('permissions',v_delivery.permissions,'client_name',v_delivery.client_name) INTO v_result FROM public.biosites b WHERE b.id=v_delivery.biosite_id;
  RETURN v_result;
END; $$;
REVOKE ALL ON FUNCTION public.get_client_biosite(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_client_biosite(text,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.list_showcase_biosites(p_limit integer DEFAULT 8)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(to_jsonb(x)),'[]'::jsonb) FROM (
    SELECT b.id,b.slug,b.name,b.category,b.short_description,b.logo_url,b.cover_url,b.status,b.views_count,b.appearance,b.sections,b.whatsapp_config,b.action_buttons_data,b.catalog_categories,b.catalog_items,b.social_links_data,b.seo,b.branding,b.created_at,b.updated_at
    FROM public.biosites b WHERE b.status='published' AND b.showcase_opt_in=true
    ORDER BY COALESCE(b.showcased_at,b.updated_at) DESC LIMIT LEAST(GREATEST(COALESCE(p_limit,8),1),20)
  ) x;
$$;
REVOKE ALL ON FUNCTION public.list_showcase_biosites(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_showcase_biosites(integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_biosite(p_slug text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT to_jsonb(b) || jsonb_build_object(
    'blocks',COALESCE((SELECT jsonb_agg(to_jsonb(bl) ORDER BY bl.position) FROM public.biosite_blocks bl WHERE bl.biosite_id=b.id AND bl.enabled=true),'[]'::jsonb),
    'services_data',COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.position) FROM public.biosite_services s WHERE s.biosite_id=b.id AND s.available=true),'[]'::jsonb),
    'forms_data',COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY f.position) FROM public.biosite_forms f WHERE f.biosite_id=b.id AND f.enabled=true),'[]'::jsonb)
  ) FROM public.biosites b WHERE lower(b.slug)=lower(trim(p_slug)) AND b.status='published' LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_biosite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_biosite(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_biosite_event(p_slug text,p_type text,p_label text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF p_type NOT IN ('page_view','view','whatsapp_click','whatsapp','phone_click','call','social_click','product_click','product','service_click','booking_click','appointment','form_submit','location_click','location','button_click') THEN RETURN; END IF;
  SELECT id INTO v_id FROM public.biosites WHERE lower(slug)=lower(trim(p_slug)) AND status='published' LIMIT 1;
  IF v_id IS NULL THEN RETURN; END IF;
  INSERT INTO public.biosite_events(biosite_id,type,label) VALUES(v_id,p_type,NULLIF(left(COALESCE(p_label,''),160),''));
  IF p_type IN ('page_view','view') THEN UPDATE public.biosites SET views_count=views_count+1 WHERE id=v_id; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.track_biosite_event(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_biosite_event(text,text,text) TO anon, authenticated;

DROP POLICY IF EXISTS biosite_images_insert_own ON storage.objects;
DROP POLICY IF EXISTS biosite_images_update_own ON storage.objects;
DROP POLICY IF EXISTS biosite_images_delete_own ON storage.objects;
CREATE POLICY biosite_images_insert_own ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='biosite-images' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','mp4','webm'));
CREATE POLICY biosite_images_update_own ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='biosite-images' AND owner_id=auth.uid()::text) WITH CHECK (bucket_id='biosite-images' AND owner_id=auth.uid()::text);
CREATE POLICY biosite_images_delete_own ON storage.objects FOR DELETE TO authenticated USING (bucket_id='biosite-images' AND owner_id=auth.uid()::text);