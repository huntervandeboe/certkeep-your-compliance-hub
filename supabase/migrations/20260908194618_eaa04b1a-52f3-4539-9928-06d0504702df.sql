CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can see their own row"
ON public.platform_admins FOR SELECT TO authenticated
USING (user_id = auth.uid());

INSERT INTO public.platform_admins (user_id)
VALUES ('98a416a9-fde5-4525-a3a7-dc32d677c54f')
ON CONFLICT DO NOTHING;

ALTER TABLE public.pilot_applications
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS contacted_at timestamptz;