ALTER TABLE public.subcontractors
  ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

UPDATE public.subcontractors s
SET workspace_id = w.id
FROM public.workspaces w
WHERE w.owner_user_id = s.owner_id
  AND s.workspace_id IS NULL;

CREATE INDEX subcontractors_workspace_idx
  ON public.subcontractors(workspace_id, created_at DESC);

CREATE POLICY "workspace_members_view_subcontractors"
ON public.subcontractors FOR SELECT TO authenticated
USING (workspace_id IS NOT NULL AND private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_managers_manage_subcontractors"
ON public.subcontractors FOR ALL TO authenticated
USING (
  workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])
)
WITH CHECK (
  owner_id = auth.uid()
  AND workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])
);

ALTER TABLE public.project_subcontractors
  ADD COLUMN planned_start_date DATE;

CREATE INDEX project_subs_start_idx
  ON public.project_subcontractors(workspace_id, planned_start_date);

ALTER TABLE public.document_requests
  ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN requirement_id UUID REFERENCES public.compliance_requirements(id) ON DELETE SET NULL,
  ADD COLUMN assigned_to_user_id UUID,
  ADD COLUMN due_date DATE,
  ADD COLUMN last_requested_at TIMESTAMPTZ,
  ADD COLUMN next_reminder_at TIMESTAMPTZ;

UPDATE public.document_requests d
SET workspace_id = s.workspace_id
FROM public.subcontractors s
WHERE s.id = d.subcontractor_id
  AND d.workspace_id IS NULL;

CREATE INDEX docreq_workspace_queue_idx
  ON public.document_requests(workspace_id, status, due_date, created_at DESC);
CREATE INDEX docreq_project_idx
  ON public.document_requests(project_id, subcontractor_id);
CREATE INDEX docreq_assignee_idx
  ON public.document_requests(workspace_id, assigned_to_user_id, due_date);

CREATE POLICY "workspace_members_view_document_requests"
ON public.document_requests FOR SELECT TO authenticated
USING (workspace_id IS NOT NULL AND private.is_workspace_member(workspace_id));

CREATE POLICY "workspace_team_manage_document_requests"
ON public.document_requests FOR ALL TO authenticated
USING (
  workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[])
)
WITH CHECK (
  owner_id = auth.uid()
  AND workspace_id IS NOT NULL
  AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[])
);

CREATE OR REPLACE FUNCTION public.validate_document_request_links()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.project_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = NEW.project_id AND p.workspace_id = NEW.workspace_id
  ) THEN
    RAISE EXCEPTION 'Project must belong to the request workspace';
  END IF;
  IF NEW.requirement_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.compliance_requirements r
    WHERE r.id = NEW.requirement_id
      AND r.workspace_id = NEW.workspace_id
      AND (r.project_id IS NULL OR r.project_id = NEW.project_id)
  ) THEN
    RAISE EXCEPTION 'Requirement must belong to the request workspace and project';
  END IF;
  IF NEW.assigned_to_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.workspace_members m
    WHERE m.workspace_id = NEW.workspace_id
      AND m.user_id = NEW.assigned_to_user_id
      AND m.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Task owner must be an active workspace member';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_document_request_links_trigger
BEFORE INSERT OR UPDATE OF workspace_id, project_id, requirement_id, assigned_to_user_id
ON public.document_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_document_request_links();