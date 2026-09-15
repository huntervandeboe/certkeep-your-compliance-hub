
-- ============ workspaces / projects / assignments ============
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/New_York';
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS manager_user_id uuid;

ALTER TABLE public.project_subcontractors ADD COLUMN IF NOT EXISTS scheduled_end_date date;

ALTER TABLE public.document_requests ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'all';
ALTER TABLE public.document_requests ADD COLUMN IF NOT EXISTS revoked_at timestamptz;
ALTER TABLE public.document_requests ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE public.document_requests ADD COLUMN IF NOT EXISTS current_version integer NOT NULL DEFAULT 0;

-- ============ document_versions ============
CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  document_request_id uuid NOT NULL REFERENCES public.document_requests(id) ON DELETE CASCADE,
  version integer NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  content_type text,
  expiration_date date,
  status doc_status NOT NULL DEFAULT 'submitted',
  uploaded_via text NOT NULL DEFAULT 'link',
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_request_id, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_versions TO authenticated;
GRANT ALL ON public.document_versions TO service_role;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read document versions" ON public.document_versions
  FOR SELECT TO authenticated USING (private.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "staff write document versions" ON public.document_versions
  FOR ALL TO authenticated
  USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()))
  WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()));
CREATE INDEX IF NOT EXISTS document_versions_request_idx ON public.document_versions(document_request_id);
CREATE INDEX IF NOT EXISTS document_versions_workspace_idx ON public.document_versions(workspace_id);

-- ============ document_reviews (append-only) ============
CREATE TABLE IF NOT EXISTS public.document_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  document_version_id uuid NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
  document_request_id uuid NOT NULL REFERENCES public.document_requests(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES public.compliance_requirements(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  reviewer_user_id uuid NOT NULL,
  decision text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.document_reviews TO authenticated;
GRANT ALL ON public.document_reviews TO service_role;
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read document reviews" ON public.document_reviews
  FOR SELECT TO authenticated USING (private.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "reviewers add document reviews" ON public.document_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_user_id = auth.uid()
    AND private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid())
  );
CREATE INDEX IF NOT EXISTS document_reviews_request_idx ON public.document_reviews(document_request_id);

-- ============ upload links ============
CREATE TABLE IF NOT EXISTS public.upload_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  subcontractor_id uuid NOT NULL REFERENCES public.subcontractors(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  token_hash text NOT NULL UNIQUE,
  audience text NOT NULL DEFAULT 'subcontractor',
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_by uuid NOT NULL,
  last_opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upload_links TO authenticated;
GRANT ALL ON public.upload_links TO service_role;
ALTER TABLE public.upload_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read upload links" ON public.upload_links
  FOR SELECT TO authenticated USING (private.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "staff write upload links" ON public.upload_links
  FOR ALL TO authenticated
  USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()))
  WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()));

CREATE TABLE IF NOT EXISTS public.upload_link_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  upload_link_id uuid NOT NULL REFERENCES public.upload_links(id) ON DELETE CASCADE,
  document_request_id uuid NOT NULL REFERENCES public.document_requests(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (upload_link_id, document_request_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upload_link_items TO authenticated;
GRANT ALL ON public.upload_link_items TO service_role;
ALTER TABLE public.upload_link_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read upload link items" ON public.upload_link_items
  FOR SELECT TO authenticated USING (private.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "staff write upload link items" ON public.upload_link_items
  FOR ALL TO authenticated
  USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()))
  WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()));

-- ============ notification jobs ============
CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  document_request_id uuid REFERENCES public.document_requests(id) ON DELETE CASCADE,
  upload_link_id uuid REFERENCES public.upload_links(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'reminder',
  recipient_email text,
  status text NOT NULL DEFAULT 'scheduled',
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  canceled_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  dedupe_key text NOT NULL UNIQUE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_jobs TO authenticated;
GRANT ALL ON public.notification_jobs TO service_role;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read notification jobs" ON public.notification_jobs
  FOR SELECT TO authenticated USING (private.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "staff write notification jobs" ON public.notification_jobs
  FOR ALL TO authenticated
  USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()))
  WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::workspace_role[], auth.uid()));
CREATE TRIGGER notification_jobs_updated_at BEFORE UPDATE ON public.notification_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS notification_jobs_due_idx ON public.notification_jobs(workspace_id, status, scheduled_for);
