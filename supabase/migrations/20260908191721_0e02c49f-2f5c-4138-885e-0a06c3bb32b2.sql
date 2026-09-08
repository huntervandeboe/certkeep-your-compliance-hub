CREATE POLICY "owners_view_compliance_files" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'compliance-docs' AND EXISTS (
    SELECT 1 FROM public.document_requests dr
    WHERE dr.owner_id = auth.uid() AND dr.id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "owners_upload_compliance_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'compliance-docs' AND EXISTS (
    SELECT 1 FROM public.document_requests dr
    WHERE dr.owner_id = auth.uid() AND dr.id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "owners_update_compliance_files" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'compliance-docs' AND EXISTS (
    SELECT 1 FROM public.document_requests dr
    WHERE dr.owner_id = auth.uid() AND dr.id::text = (storage.foldername(name))[1]
  )
) WITH CHECK (
  bucket_id = 'compliance-docs' AND EXISTS (
    SELECT 1 FROM public.document_requests dr
    WHERE dr.owner_id = auth.uid() AND dr.id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "owners_delete_compliance_files" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'compliance-docs' AND EXISTS (
    SELECT 1 FROM public.document_requests dr
    WHERE dr.owner_id = auth.uid() AND dr.id::text = (storage.foldername(name))[1]
  )
);