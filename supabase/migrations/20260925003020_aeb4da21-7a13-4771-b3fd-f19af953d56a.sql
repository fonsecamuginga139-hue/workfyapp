DROP POLICY IF EXISTS biosite_images_read ON storage.objects;
CREATE POLICY biosite_images_read_own ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'biosite-images' AND (storage.foldername(name))[1] = auth.uid()::text);
REVOKE ALL ON FUNCTION public.get_biosite_analytics(uuid) FROM anon;
REVOKE UPDATE (views_count, user_id) ON public.biosites FROM authenticated;