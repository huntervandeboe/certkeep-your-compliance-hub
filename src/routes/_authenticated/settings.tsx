import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Save } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/app/AppShell";
import { SettingsNav } from "@/components/app/SettingsNav";
import { Field, Panel, btn, inputClass } from "@/components/app/ui";
import { getWorkspace, saveProfile } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  component: AccountPage,
  head: () => ({ meta: [
    { title: "Account settings | CertKeep" },
    { name: "description", content: "Manage your CertKeep account and workspace details." },
    { property: "og:title", content: "Account settings | CertKeep" },
    { property: "og:description", content: "Manage your CertKeep account and workspace details." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
});

function AccountPage() {
  const load = useServerFn(getWorkspace); const save = useServerFn(saveProfile); const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["workspace"], queryFn: () => load() });
  const [saved, setSaved] = useState(false);
  const mutation = useMutation({ mutationFn: (input:{fullName:string;companyName:string})=>save({data:input}), onSuccess:()=>{setSaved(true); qc.invalidateQueries({queryKey:["workspace"]});}, onError:()=>setSaved(false) });
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault(); const f=new FormData(e.currentTarget); mutation.mutate({fullName:String(f.get("fullName")??""),companyName:String(f.get("companyName")??"")});}
  return <AppShell title="Settings" subtitle="Manage your account and workspace"><Panel className="overflow-hidden"><SettingsNav />{isLoading?<p className="p-6 text-[12px] text-muted-foreground">Loading account…</p>:<form onSubmit={submit} className="max-w-[720px] space-y-5 p-6"><div><h2 className="text-[17px]">Account details</h2><p className="mt-1 text-[11px] text-muted-foreground">These details identify you and your company inside CertKeep.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" htmlFor="fullName"><input id="fullName" name="fullName" defaultValue={data?.profile.full_name??""} className={inputClass}/></Field><Field label="Company name" htmlFor="companyName"><input id="companyName" name="companyName" defaultValue={data?.profile.company_name??""} className={inputClass}/></Field></div><Field label="Sign-in email" htmlFor="email"><input id="email" value={data?.email??""} readOnly className={inputClass}/></Field><div className="flex flex-wrap items-center gap-3"><button className={btn.primary} disabled={mutation.isPending}><Save className="h-4 w-4" />{mutation.isPending?"Saving…":"Save changes"}</button>{saved?<span className="flex items-center gap-1.5 text-[11px] font-semibold text-success"><CheckCircle2 className="h-4 w-4"/>Saved</span>:null}{mutation.isError?<span className="text-[11px] text-destructive">Could not save changes.</span>:null}</div></form>}</Panel></AppShell>;
}