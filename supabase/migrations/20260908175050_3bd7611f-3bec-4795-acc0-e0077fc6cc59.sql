CREATE TABLE public.pilot_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT,
  company TEXT NOT NULL,
  state TEXT,
  job_title TEXT,
  subcontractor_count TEXT,
  tracking_method TEXT,
  biggest_problem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.pilot_applications TO service_role;

ALTER TABLE public.pilot_applications ENABLE ROW LEVEL SECURITY;