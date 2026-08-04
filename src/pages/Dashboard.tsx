import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const fields = [
  ['legal_name','Legal name'],['preferred_name','Preferred name'],['phone','Phone'],['date_of_birth','Date of birth'],
  ['current_city','Current city'],['emergency_contact','Emergency contact name'],['emergency_phone','Emergency contact phone'],
  ['sobriety_date','Sobriety date'],['referral_source','Referral source / organization'],['referring_party_name','Referring party name'],
  ['referring_party_relationship','Referring party relationship / role'],['referring_party_phone','Referring party phone'],
  ['referring_party_email','Referring party email'],['employment_income','Employment / income plan'],['recovery_support','Recovery support / meetings'],
  ['medications','Current medications (if any)'],['accommodations','Relevant accommodation needs'],['why_housing','Why are you seeking sober living housing?']
] as const;

export default function Dashboard() {
  const nav = useNavigate();
  const [data,setData] = useState<Record<string,string>>({});
  const [msg,setMsg] = useState('');
  const [appId,setAppId] = useState<string|null>(null);
  const [session,setSession] = useState<Session|null>(null);
  const [authLoading,setAuthLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [paying,setPaying] = useState(false);
  const [consent,setConsent] = useState(false);

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
    let mounted = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;
      const current = sessionData.session;
      setSession(current);
      setAuthLoading(false);
      if (!current?.user) return;
      const { data: a, error } = await supabase.from('applications').select('*').eq('user_id',current.user.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
      if (!mounted) return;
      if (error) setMsg(error.message);
      if (a) { setAppId(a.id); setData(a as Record<string,string>); }
    };
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((_event,nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function save() {
    if (!supabase) { setMsg('Supabase is not configured.'); return null; }
    if (authLoading) { setMsg('Checking your sign-in session...'); return null; }
    const user = session?.user;
    if (!user) { setMsg('Your session has expired. Please sign in again.'); nav('/login'); return null; }
    setSaving(true); setMsg('');
    try {
      const payload = {...data,user_id:user.id,status:'draft'};
      const r = appId
        ? await supabase.from('applications').update(payload).eq('id',appId).eq('user_id',user.id).select().single()
        : await supabase.from('applications').insert(payload).select().single();
      if (r.error) { setMsg(r.error.message); return null; }
      setAppId(r.data.id); setMsg('Draft saved.'); return r.data.id as string;
    } finally { setSaving(false); }
  }

  async function checkout() {
    if (!consent) { setMsg('Please check the certification box before paying and submitting.'); return; }
    setPaying(true); setMsg('Saving your application...');
    try {
      const savedId = await save();
      if (!savedId || !supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { setMsg('Your session has expired. Please sign in again.'); nav('/login'); return; }
      setMsg('Opening secure payment...');
      const res = await fetch('/api/create-checkout-session',{
        method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({applicationId:savedId})
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(j.error || `Payment setup failed (${res.status}).`); return; }
      if (j.url) window.location.assign(j.url); else setMsg(j.error || 'Unable to start payment.');
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Unable to start payment.'); }
    finally { setPaying(false); }
  }

  if (authLoading) return <section className="page dashboard"><h1>Your Housing Application</h1><p>Checking your secure session...</p></section>;
  if (!session) return <section className="page dashboard"><h1>Your Housing Application</h1><p>Please sign in to save or submit an application.</p><button className="btn" onClick={()=>nav('/login')}>Sign In</button></section>;

  return <section className="page dashboard"><span className="eyebrow">APPLICANT PORTAL</span><h1>Your Housing Application</h1>
    <div className="statusbar"><b>Status: Draft</b><span>Complete intake → Pay $35 → Submit → Review → Interview</span></div>
    <div className="formGrid">{fields.map(([k,l])=><label key={k}>{l}{['why_housing','recovery_support','medications','accommodations'].includes(k)?
      <textarea value={data[k]||''} onChange={e=>setData({...data,[k]:e.target.value})}/>:
      <input type={k.includes('date')?'date':k.includes('email')?'email':k.includes('phone')?'tel':'text'} value={data[k]||''} onChange={e=>setData({...data,[k]:e.target.value})}/>}</label>)}</div>
    <label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I certify that the information provided is accurate and understand that payment of the application fee does not guarantee admission.</label>
    {msg&&<p>{msg}</p>}
    <div className="actions"><button className="btn ghost" disabled={saving||paying} onClick={save}>{saving?'Saving...':'Save Draft'}</button><button className="btn" disabled={saving||paying} onClick={checkout}>{paying?'Opening Payment...':'Pay $35 & Submit'}</button></div>
  </section>;
}
