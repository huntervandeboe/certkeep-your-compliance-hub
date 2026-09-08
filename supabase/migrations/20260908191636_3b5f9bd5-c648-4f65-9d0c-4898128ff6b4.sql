CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_workspace_member(_workspace_id UUID, _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION private.has_workspace_role(_workspace_id UUID, _roles public.workspace_role[], _user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE workspace_id = _workspace_id AND user_id = _user_id AND role = ANY(_roles)
  )
$$;

REVOKE ALL ON FUNCTION private.is_workspace_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_workspace_role(UUID, public.workspace_role[], UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_workspace_member(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_workspace_role(UUID, public.workspace_role[], UUID) TO authenticated, service_role;

ALTER POLICY "workspace_members_can_view" ON public.workspaces USING (private.is_workspace_member(id));
ALTER POLICY "workspace_admins_can_update" ON public.workspaces USING (private.has_workspace_role(id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "members_can_view_members" ON public.workspace_members USING (private.is_workspace_member(workspace_id) OR user_id = auth.uid());
ALTER POLICY "owners_can_bootstrap_membership" ON public.workspace_members WITH CHECK ((user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_user_id = auth.uid())) OR private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "admins_can_update_members" ON public.workspace_members USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "admins_can_remove_members" ON public.workspace_members USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "members_can_view_roles" ON public.user_roles USING (private.is_workspace_member(workspace_id));
ALTER POLICY "owners_can_bootstrap_roles" ON public.user_roles WITH CHECK ((user_id = auth.uid() AND role = 'owner' AND EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_user_id = auth.uid())) OR private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "admins_can_update_roles" ON public.user_roles USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "admins_can_remove_roles" ON public.user_roles USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "members_view_projects" ON public.projects USING (private.is_workspace_member(workspace_id));
ALTER POLICY "managers_create_projects" ON public.projects WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]) AND created_by = auth.uid());
ALTER POLICY "managers_update_projects" ON public.projects USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]));
ALTER POLICY "admins_delete_projects" ON public.projects USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));
ALTER POLICY "members_view_project_subs" ON public.project_subcontractors USING (private.is_workspace_member(workspace_id));
ALTER POLICY "managers_manage_project_subs" ON public.project_subcontractors USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]));
ALTER POLICY "members_view_requirements" ON public.compliance_requirements USING (private.is_workspace_member(workspace_id));
ALTER POLICY "managers_manage_requirements" ON public.compliance_requirements USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager']::public.workspace_role[]));
ALTER POLICY "members_view_activity" ON public.activity_events USING (private.is_workspace_member(workspace_id));
ALTER POLICY "members_create_activity" ON public.activity_events WITH CHECK (private.is_workspace_member(workspace_id) AND (actor_user_id IS NULL OR actor_user_id = auth.uid()));
ALTER POLICY "members_view_reminders" ON public.reminder_events USING (private.is_workspace_member(workspace_id));
ALTER POLICY "managers_manage_reminders" ON public.reminder_events USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin','project_manager','reviewer']::public.workspace_role[]));
ALTER POLICY "members_view_integrations" ON public.integration_connections USING (private.is_workspace_member(workspace_id));
ALTER POLICY "admins_manage_integrations" ON public.integration_connections USING (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[])) WITH CHECK (private.has_workspace_role(workspace_id, ARRAY['owner','admin']::public.workspace_role[]));

DROP FUNCTION public.is_workspace_member(UUID, UUID);
DROP FUNCTION public.has_workspace_role(UUID, public.workspace_role[], UUID);