CREATE OR REPLACE FUNCTION public.get_public_biosite(p_slug text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT to_jsonb(x) FROM (
  SELECT b.id,b.slug,b.name,b.category,b.short_description,b.logo_url,b.cover_url,b.status,b.views_count,
   b.appearance,b.sections,b.whatsapp_config,b.action_buttons_data,b.catalog_categories,b.catalog_items,b.social_links_data,b.seo,b.branding,b.created_at,b.updated_at,
   COALESCE((SELECT jsonb_agg(jsonb_build_object('id',bl.id,'type',bl.type,'position',bl.position,'enabled',bl.enabled,'size',bl.size,'content',bl.content,'appearance',bl.appearance) ORDER BY bl.position) FROM public.biosite_blocks bl WHERE bl.biosite_id=b.id AND bl.enabled=true),'[]'::jsonb) AS blocks,
   COALESCE((SELECT jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'description',s.description,'price',s.price,'promotional_price',s.promotional_price,'duration_minutes',s.duration_minutes,'media_type',s.media_type,'media_url',s.media_url,'cta_type',s.cta_type,'cta_label',s.cta_label,'featured',s.featured,'available',s.available,'position',s.position) ORDER BY s.position) FROM public.biosite_services s WHERE s.biosite_id=b.id AND s.available=true),'[]'::jsonb) AS services_data,
   COALESCE((SELECT jsonb_agg(jsonb_build_object('id',f.id,'title',f.title,'description',f.description,'submit_label',f.submit_label,'fields',f.fields,'enabled',f.enabled,'position',f.position) ORDER BY f.position) FROM public.biosite_forms f WHERE f.biosite_id=b.id AND f.enabled=true),'[]'::jsonb) AS forms_data
  FROM public.biosites b WHERE lower(b.slug)=lower(trim(p_slug)) AND b.status='published' LIMIT 1
 ) x;
$$;
REVOKE ALL ON FUNCTION public.get_public_biosite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_biosite(text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.get_client_biosite(p_slug text,p_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_delivery public.biosite_deliveries; v_result jsonb;
BEGIN
 IF length(trim(coalesce(p_key,''))) <> 16 THEN RETURN NULL; END IF;
 SELECT d.* INTO v_delivery FROM public.biosite_deliveries d JOIN public.biosites b ON b.id=d.biosite_id WHERE lower(b.slug)=lower(trim(p_slug)) AND d.status='active' AND d.access_key_hash=encode(digest(upper(trim(p_key)),'sha256'),'hex');
 IF v_delivery.id IS NULL THEN RETURN NULL; END IF;
 UPDATE public.biosite_deliveries SET last_accessed_at=now() WHERE id=v_delivery.id;
 SELECT public.get_public_biosite(b.slug) || jsonb_build_object('permissions',v_delivery.permissions) INTO v_result FROM public.biosites b WHERE b.id=v_delivery.biosite_id;
 RETURN v_result;
END; $$;
REVOKE ALL ON FUNCTION public.get_client_biosite(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_client_biosite(text,text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.rotate_biosite_access_key(p_biosite_id uuid,p_client_id uuid,p_client_name text,p_client_phone text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_key text; v_delivery_id uuid;
BEGIN
 IF auth.uid() IS NULL OR length(trim(coalesce(p_client_name,'')))<2 OR NOT EXISTS(SELECT 1 FROM public.biosites WHERE id=p_biosite_id AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
 IF p_client_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.clients WHERE id=p_client_id AND owner_id=auth.uid()) THEN RAISE EXCEPTION 'Invalid client'; END IF;
 v_key:=upper(substr(encode(gen_random_bytes(12),'hex'),1,16));
 INSERT INTO public.biosite_deliveries(biosite_id,owner_id,client_id,client_name,client_phone,access_key_hash,key_hint)
 VALUES(p_biosite_id,auth.uid(),p_client_id,left(trim(p_client_name),120),NULLIF(left(trim(p_client_phone),40),''),encode(digest(v_key,'sha256'),'hex'),right(v_key,4))
 ON CONFLICT(biosite_id) DO UPDATE SET client_id=excluded.client_id,client_name=excluded.client_name,client_phone=excluded.client_phone,access_key_hash=excluded.access_key_hash,key_hint=excluded.key_hint,status='active',key_rotated_at=now(),updated_at=now()
 RETURNING id INTO v_delivery_id;
 INSERT INTO public.biosite_delivery_history(delivery_id,owner_id,event_type) VALUES(v_delivery_id,auth.uid(),'key_rotated');
 RETURN v_key;
END; $$;
REVOKE ALL ON FUNCTION public.rotate_biosite_access_key(uuid,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rotate_biosite_access_key(uuid,uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_biosite_form(p_slug text,p_form_id uuid,p_payload jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_biosite public.biosites; v_form public.biosite_forms; v_id uuid; v_field text;
BEGIN
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>8192 THEN RAISE EXCEPTION 'Invalid submission'; END IF;
 SELECT * INTO v_biosite FROM public.biosites WHERE lower(slug)=lower(trim(p_slug)) AND status='published';
 IF v_biosite.id IS NULL THEN RAISE EXCEPTION 'Biosite unavailable'; END IF;
 SELECT * INTO v_form FROM public.biosite_forms WHERE id=p_form_id AND biosite_id=v_biosite.id AND enabled=true;
 IF v_form.id IS NULL THEN RAISE EXCEPTION 'Form unavailable'; END IF;
 FOR v_field IN SELECT jsonb_object_keys(p_payload) LOOP
  IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(v_form.fields) f WHERE f->>'id'=v_field) THEN RAISE EXCEPTION 'Invalid field'; END IF;
 END LOOP;
 IF length(trim(coalesce(p_payload->>'name','')))<2 AND length(trim(coalesce(p_payload->>'phone','')))<7 AND length(trim(coalesce(p_payload->>'email','')))<5 THEN RAISE EXCEPTION 'Contact required'; END IF;
 INSERT INTO public.biosite_leads(biosite_id,form_id,owner_id,name,phone,email,message,answers)
 VALUES(v_biosite.id,v_form.id,v_biosite.user_id,NULLIF(left(trim(p_payload->>'name'),120),''),NULLIF(left(trim(p_payload->>'phone'),40),''),NULLIF(left(trim(p_payload->>'email'),160),''),NULLIF(left(trim(p_payload->>'message'),2000),''),p_payload-ARRAY['name','phone','email','message']) RETURNING id INTO v_id;
 INSERT INTO public.biosite_events(biosite_id,type,label) VALUES(v_biosite.id,'form_submit',left(v_form.title,160));
 RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_biosite_form(text,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_biosite_form(text,uuid,jsonb) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.submit_biosite_booking(p_slug text,p_service_id uuid,p_name text,p_phone text,p_email text,p_date date,p_time time,p_notes text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_biosite public.biosites; v_service public.biosite_services; v_id uuid;
BEGIN
 IF p_date IS NULL OR p_time IS NULL OR p_date<current_date OR p_date>current_date+365 OR length(trim(coalesce(p_name,'')))<2 OR length(regexp_replace(coalesce(p_phone,''),'[^0-9]','','g'))<7 THEN RAISE EXCEPTION 'Invalid booking'; END IF;
 SELECT * INTO v_biosite FROM public.biosites WHERE lower(slug)=lower(trim(p_slug)) AND status='published';
 IF v_biosite.id IS NULL THEN RAISE EXCEPTION 'Biosite unavailable'; END IF;
 SELECT * INTO v_service FROM public.biosite_services WHERE id=p_service_id AND biosite_id=v_biosite.id AND available=true;
 IF v_service.id IS NULL THEN RAISE EXCEPTION 'Service unavailable'; END IF;
 IF EXISTS(SELECT 1 FROM public.biosite_bookings WHERE service_id=p_service_id AND scheduled_date=p_date AND scheduled_time=p_time AND status IN ('pending','confirmed')) THEN RAISE EXCEPTION 'Time unavailable'; END IF;
 INSERT INTO public.biosite_bookings(biosite_id,service_id,owner_id,customer_name,customer_phone,customer_email,scheduled_date,scheduled_time,notes)
 VALUES(v_biosite.id,v_service.id,v_biosite.user_id,left(trim(p_name),120),left(trim(p_phone),40),NULLIF(left(trim(p_email),160),''),p_date,p_time,NULLIF(left(trim(p_notes),1000),'')) RETURNING id INTO v_id;
 INSERT INTO public.biosite_events(biosite_id,type,label) VALUES(v_biosite.id,'booking_click',left(v_service.name,160));
 RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_biosite_booking(text,uuid,text,text,text,date,time,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_biosite_booking(text,uuid,text,text,text,date,time,text) TO anon,authenticated;