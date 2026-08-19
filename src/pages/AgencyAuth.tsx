import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {Building2} from 'lucide-react';
import {supabase,supabaseConfig} from '../lib/supabase';

export default function AgencyAuth(){
  const nav=useNavigate();
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [agencyName,setAgencyName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');
  const [busy,setBusy]=useState(false);

  async function go(e:React.FormEvent){
    e.preventDefault();
    if(!supabase){setMsg(`Supabase configuration missing: ${!supabaseConfig.hasUrl?'VITE_SUPABASE_URL':''}${!supabaseConfig.hasUrl&&!supabaseConfig.hasKey?' and ':''}${!supabaseConfig.hasKey?'VITE_SUPABASE_ANON_KEY':''}.`);return}
    setBusy(true);setMsg('');
    try{
      if(mode==='signup'){
        const result=await supabase.auth.signUp({email,password});
        if(result.error){setMsg(result.error.message);return}
        if(result.data.user){
          const {error}=await supabase.from('agency_accounts').insert({owner_user_id:result.data.user.id,name:agencyName.trim()});
          if(error){setMsg(`Account created, but agency setup needs attention: ${error.message}`);return}
        }
        if(!result.data.session){setMsg('Agency account created. Check your email to verify the account, then sign in.');setMode('login');return}
        nav('/agency/dashboard');return;
      }
      const result=await supabase.auth.signInWithPassword({email,password});
      if(result.error){setMsg(result.error.message);return}
      nav('/agency/dashboard');
    }finally{setBusy(false)}
  }

  return <section className="auth"><form onSubmit={go} className="panel form agencyAuth">
    <Building2 size={34}/><span className="eyebrow">AGENCY PORTAL</span><h2>{mode==='login'?'Agency Sign In':'Create Agency Account'}</h2>
    <p>Manage multiple client housing applications from one secure dashboard.</p>
    {mode==='signup'&&<label>Agency / organization name<input required value={agencyName} onChange={e=>setAgencyName(e.target.value)}/></label>}
    <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label>Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    {msg&&<p className={msg.toLowerCase().includes('created')?'success':'error'}>{msg}</p>}
    <button className="btn wide" disabled={busy}>{busy?'Working...':mode==='login'?'Sign In to Agency Dashboard':'Create Agency Account'}</button>
    <button type="button" className="textbtn" onClick={()=>{setMode(mode==='login'?'signup':'login');setMsg('')}}>{mode==='login'?'New agency? Create an account':'Already have an agency account? Sign in'}</button>
    <Link to="/login">Individual applicant sign in</Link>
  </form></section>
}
