import {useEffect,useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Building2,LogOut,Plus,Search,Users,X} from 'lucide-react';
import {supabase} from '../lib/supabase';

type Application={id:string;legal_name:string|null;preferred_name:string|null;phone:string|null;date_of_birth:string|null;current_city:string|null;emergency_contact:string|null;emergency_phone:string|null;sobriety_date:string|null;referral_source:string|null;referring_party_name:string|null;referring_party_relationship:string|null;referring_party_phone:string|null;referring_party_email:string|null;employment_income:string|null;recovery_support:string|null;medications:string|null;accommodations:string|null;why_housing:string|null;status:string;created_at:string;updated_at?:string};

type Agency={id:string;name:string};
const blank={legal_name:'',preferred_name:'',phone:'',date_of_birth:'',current_city:'',emergency_contact:'',emergency_phone:'',sobriety_date:'',referral_source:'',referring_party_name:'',referring_party_relationship:'',referring_party_phone:'',referring_party_email:'',employment_income:'',recovery_support:'',medications:'',accommodations:'',why_housing:''};
type FormData=typeof blank;
const statuses=['draft','submitted','under_review','interview','approved','waitlisted','denied','withdrawn'];

export default function AgencyDashboard(){
  const nav=useNavigate();
  const [agency,setAgency]=useState<Agency|null>(null);const [apps,setApps]=useState<Application[]>([]);const [loading,setLoading]=useState(true);const [msg,setMsg]=useState('');
  const [search,setSearch]=useState('');const [filter,setFilter]=useState('all');const [editing,setEditing]=useState<Application|null>(null);const [form,setForm]=useState<FormData>(blank);const [saving,setSaving]=useState(false);

  async function load(){
    if(!supabase){setMsg('Supabase is not configured.');setLoading(false);return}
    setLoading(true);setMsg('');
    const {data:{session}}=await supabase.auth.getSession();if(!session){nav('/agency/login');return}
    const {data:agencyRow,error:agencyError}=await supabase.from('agency_accounts').select('id,name').eq('owner_user_id',session.user.id).maybeSingle();
    if(agencyError){setMsg(agencyError.message);setLoading(false);return}
    if(!agencyRow){setMsg('This login does not have an agency account. Create an agency account from the Agency Portal.');setLoading(false);return}
    setAgency(agencyRow);
    const {data,error}=await supabase.from('applications').select('*').eq('agency_id',agencyRow.id).order('created_at',{ascending:false});
    if(error)setMsg(error.message);else setApps((data||[]) as Application[]);setLoading(false);
  }
  useEffect(()=>{void load()},[]);

  const visible=useMemo(()=>apps.filter(a=>{const q=search.toLowerCase();const matches=!q||[a.legal_name,a.preferred_name,a.phone,a.current_city,a.referring_party_name].some(v=>(v||'').toLowerCase().includes(q));return matches&&(filter==='all'||a.status===filter)}),[apps,search,filter]);
  const counts=useMemo(()=>({total:apps.length,draft:apps.filter(a=>a.status==='draft').length,review:apps.filter(a=>['submitted','under_review','interview'].includes(a.status)).length,approved:apps.filter(a=>a.status==='approved').length}),[apps]);

  function openNew(){setEditing(null);setForm({...blank,referral_source:agency?.name||''})}
  function openEdit(a:Application){setEditing(a);const next={...blank};(Object.keys(next) as (keyof FormData)[]).forEach(k=>next[k]=(a[k] as string|null)||'');setForm(next)}
  function closeEditor(){setEditing(null);setForm(blank);const d=document.getElementById('agencyEditor') as HTMLDialogElement|null;if(d?.open)d.close()}
  function showEditor(){const d=document.getElementById('agencyEditor') as HTMLDialogElement|null;if(d&&!d.open)d.showModal()}
  useEffect(()=>{if(editing!==null||Object.values(form).some(Boolean))showEditor()},[editing,form.legal_name]);

  async function saveClient(submit=false){
    if(!supabase||!agency)return;if(!form.legal_name.trim()){setMsg('Client legal name is required.');return}setSaving(true);setMsg('');
    const {data:{session}}=await supabase.auth.getSession();if(!session){nav('/agency/login');return}
    const payload={...form,agency_id:agency.id,created_by_agency_user_id:session.user.id,user_id:null,status:submit?'submitted':editing?.status||'draft',payment_status:'waived',application_fee_cents:0,certification_accepted:submit,submitted_at:submit?new Date().toISOString():editing?.status==='submitted'?editing.created_at:null};
    const result=editing?await supabase.from('applications').update(payload).eq('id',editing.id).eq('agency_id',agency.id).select('id').single():await supabase.from('applications').insert(payload).select('id').single();
    if(result.error){setMsg(result.error.message);setSaving(false);return}setSaving(false);closeEditor();await load();setMsg(submit?'Client application submitted for review.':'Client application saved.');
  }
  async function updateStatus(a:Application,status:string){if(!supabase||!agency)return;const {error}=await supabase.from('applications').update({status}).eq('id',a.id).eq('agency_id',agency.id);if(error)setMsg(error.message);else await load()}
  async function signOut(){if(supabase)await supabase.auth.signOut();nav('/agency/login')}

  return <section className="page agencyDashboard"><div className="agencyHeader"><div><span className="eyebrow">AGENCY CLIENT MANAGEMENT</span><h1>{agency?.name||'Agency Dashboard'}</h1><p className="lead">Create, submit, track, and update housing applications for your clients.</p></div><div className="agencyHeaderActions"><button className="btn ghost" onClick={()=>void signOut()}><LogOut size={16}/> Sign Out</button><button className="btn" onClick={openNew}><Plus size={17}/> New Client</button></div></div>
    {msg&&<div className="agencyMessage">{msg}</div>}
    <div className="agencyStats"><article><Users/><div><b>{counts.total}</b><span>Total Clients</span></div></article><article><div><b>{counts.draft}</b><span>Drafts</span></div></article><article><div><b>{counts.review}</b><span>In Review</span></div></article><article><div><b>{counts.approved}</b><span>Approved</span></div></article></div>
    <div className="agencyToolbar"><label className="agencySearch"><Search size={17}/><input placeholder="Search client name, phone, city..." value={search} onChange={e=>setSearch(e.target.value)}/></label><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></div>
    <div className="agencyTableWrap">{loading?<p>Loading agency clients...</p>:visible.length===0?<div className="agencyEmpty"><Building2 size={38}/><h3>No client applications found</h3><p>Create your first client application to begin.</p><button className="btn" onClick={openNew}>Add Client</button></div>:<table className="agencyTable"><thead><tr><th>Client</th><th>Contact</th><th>City</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>{visible.map(a=><tr key={a.id}><td><b>{a.legal_name||'Unnamed client'}</b>{a.preferred_name&&<small>Preferred: {a.preferred_name}</small>}</td><td>{a.phone||'—'}</td><td>{a.current_city||'—'}</td><td><select className={`statusSelect status-${a.status}`} value={a.status} onChange={e=>void updateStatus(a,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}</select></td><td>{new Date(a.created_at).toLocaleDateString()}</td><td><button className="textAction" onClick={()=>openEdit(a)}>View / Edit</button></td></tr>)}</tbody></table>}</div>
    <dialog id="agencyEditor" className="agencyDialog" onClose={()=>{setEditing(null);setForm(blank)}}><div className="agencyDialogHead"><div><span className="eyebrow">{editing?'CLIENT APPLICATION':'NEW CLIENT'}</span><h2>{editing?editing.legal_name:'Create Client Application'}</h2></div><button className="iconBtn" onClick={closeEditor}><X/></button></div><div className="formGrid">
      {([['legal_name','Legal name'],['preferred_name','Preferred name'],['phone','Phone'],['date_of_birth','Date of birth'],['current_city','Current city'],['emergency_contact','Emergency contact'],['emergency_phone','Emergency phone'],['sobriety_date','Sobriety date'],['referral_source','Referral source / agency'],['referring_party_name','Case manager / referring party'],['referring_party_relationship','Relationship / role'],['referring_party_phone','Referring party phone'],['referring_party_email','Referring party email'],['employment_income','Employment / income plan'],['recovery_support','Recovery support / meetings'],['medications','Current medications'],['accommodations','Accommodation needs'],['why_housing','Why is the client seeking sober living housing?']] as [keyof FormData,string][]).map(([key,label])=><label key={key}>{label}{['recovery_support','medications','accommodations','why_housing'].includes(key)?<textarea value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input type={key.includes('date')?'date':key.includes('email')?'email':key.includes('phone')?'tel':'text'} required={key==='legal_name'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>)}
    </div><div className="agencyDialogActions"><button className="btn ghost" disabled={saving} onClick={()=>void saveClient(false)}>{saving?'Saving...':'Save Draft'}</button><button className="btn" disabled={saving} onClick={()=>void saveClient(true)}>{saving?'Saving...':'Submit for Review'}</button></div></dialog>
  </section>
}
