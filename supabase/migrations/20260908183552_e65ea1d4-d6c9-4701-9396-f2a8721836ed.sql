CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.subcontractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company TEXT NOT NULL,
  trade TEXT,
  project TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX subcontractors_owner_idx ON public.subcontractors (owner_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subcontractors TO authenticated;
GRANT ALL ON public.subcontractors TO service_role;
ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_all_own" ON public.subcontractors FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TYPE public.doc_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');

CREATE TABLE public.document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES public.subcontractors ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  notes TEXT,
  status public.doc_status NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL UNIQUE,
  token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  file_path TEXT,
  file_name TEXT,
  expiration_date DATE,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX docreq_owner_idx ON public.document_requests (owner_id, created_at DESC);
CREATE INDEX docreq_sub_idx ON public.document_requests (subcontractor_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_requests TO authenticated;
GRANT ALL ON public.document_requests TO service_role;
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docreq_all_own" ON public.document_requests FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER subs_updated_at BEFORE UPDATE ON public.subcontractors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER docreq_updated_at BEFORE UPDATE ON public.document_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();