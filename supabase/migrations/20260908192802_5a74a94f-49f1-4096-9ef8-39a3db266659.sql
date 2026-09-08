DROP POLICY IF EXISTS "workspace_team_manage_document_requests" ON public.document_requests;

CREATE POLICY "workspace_team_create_document_requests"
ON public.document_requests FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[])
);

CREATE POLICY "workspace_team_update_document_requests"
ON public.document_requests FOR UPDATE TO authenticated
USING (
  workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[])
)
WITH CHECK (
  workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[])
);

CREATE POLICY "workspace_managers_delete_document_requests"
ON public.document_requests FOR DELETE TO authenticated
USING (
  workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])
);

CREATE OR REPLACE FUNCTION public.preserve_document_request_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'Document request creator cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER preserve_document_request_creator_trigger
BEFORE UPDATE OF owner_id ON public.document_requests
FOR EACH ROW EXECUTE FUNCTION public.preserve_document_request_creator();