CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'project_manager', 'reviewer', 'read_only');
CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'on_hold', 'complete');
CREATE TYPE public.requirement_status AS ENUM ('required', 'waived');

CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT,
  display_name TEXT,
  role public.workspace_role NOT NULL DEFAULT 'read_only',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.workspace_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(_workspace_id UUID, _roles public.workspace_role[], _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE workspace_id = _workspace_id AND user_id = _user_id AND role = ANY(_roles)
  )
$$;

CREATE POLICY "workspace_members_can_view" ON public.workspaces FOR SELECT TO authenticated USING (public.is_workspace_member(id));
CREATE POLICY "workspace_owner_can_create" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "workspace_admins_can_update" ON public.workspaces FOR UPDATE TO authenticated USING (public.has_workspace_role(id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(id, ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "workspace_owners_can_delete" ON public.workspaces FOR DELETE TO authenticated USING (owner_user_id = auth.uid());

CREATE POLICY "members_can_view_members" ON public.workspace_members FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id) OR user_id = auth.uid());
CREATE POLICY "owners_can_bootstrap_membership" ON public.workspace_members FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_user_id = auth.uid())) OR public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "admins_can_update_members" ON public.workspace_members FOR UPDATE TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "admins_can_remove_members" ON public.workspace_members FOR DELETE TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));

CREATE POLICY "members_can_view_roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "owners_can_bootstrap_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid() AND role = 'owner' AND EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_user_id = auth.uid())) OR public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "admins_can_update_roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
CREATE POLICY "admins_can_remove_roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  location TEXT,
  status public.project_status NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_view_projects" ON public.projects FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "managers_create_projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]) AND created_by = auth.uid());
CREATE POLICY "managers_update_projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]));
CREATE POLICY "admins_delete_projects" ON public.projects FOR DELETE TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));

CREATE TABLE public.project_subcontractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES public.subcontractors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, subcontractor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_subcontractors TO authenticated;
GRANT ALL ON public.project_subcontractors TO service_role;
ALTER TABLE public.project_subcontractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_view_project_subs" ON public.project_subcontractors FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "managers_manage_project_subs" ON public.project_subcontractors FOR ALL TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]));

CREATE TABLE public.compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  trade TEXT,
  minimum_limit NUMERIC(14,2),
  endorsements TEXT[] NOT NULL DEFAULT '{}',
  expiration_warning_days INTEGER NOT NULL DEFAULT 30 CHECK (expiration_warning_days BETWEEN 0 AND 365),
  status public.requirement_status NOT NULL DEFAULT 'required',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_requirements TO authenticated;
GRANT ALL ON public.compliance_requirements TO service_role;
ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_view_requirements" ON public.compliance_requirements FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "managers_manage_requirements" ON public.compliance_requirements FOR ALL TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]));

CREATE TABLE public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_user_id UUID,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  title TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_view_activity" ON public.activity_events FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "members_create_activity" ON public.activity_events FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id) AND (actor_user_id IS NULL OR actor_user_id = auth.uid()));

CREATE TABLE public.reminder_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  document_request_id UUID REFERENCES public.document_requests(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','delivered','failed','cancelled')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_events TO authenticated;
GRANT ALL ON public.reminder_events TO service_role;
ALTER TABLE public.reminder_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_view_reminders" ON public.reminder_events FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "managers_manage_reminders" ON public.reminder_events FOR ALL TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[]));

CREATE TABLE public.integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','connected','attention')),
  connected_by UUID,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, provider)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_connections TO authenticated;
GRANT ALL ON public.integration_connections TO service_role;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_view_integrations" ON public.integration_connections FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id));
CREATE POLICY "admins_manage_integrations" ON public.integration_connections FOR ALL TO authenticated USING (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));

CREATE INDEX projects_workspace_idx ON public.projects(workspace_id, status, created_at DESC);
CREATE INDEX project_subs_workspace_idx ON public.project_subcontractors(workspace_id, project_id);
CREATE INDEX requirements_workspace_idx ON public.compliance_requirements(workspace_id, project_id);
CREATE INDEX activity_workspace_idx ON public.activity_events(workspace_id, created_at DESC);
CREATE INDEX reminders_workspace_idx ON public.reminder_events(workspace_id, scheduled_for);

CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER workspace_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER requirements_updated_at BEFORE UPDATE ON public.compliance_requirements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER integrations_updated_at BEFORE UPDATE ON public.integration_connections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();