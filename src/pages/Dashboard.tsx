import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const fields = [
  ['legal_name', 'Legal name'],
  ['preferred_name', 'Preferred name'],
  ['phone', 'Phone'],
  ['date_of_birth', 'Date of birth'],
  ['current_city', 'Current city'],
  ['emergency_contact', 'Emergency contact name'],
  ['emergency_phone', 'Emergency contact phone'],
  ['sobriety_date', 'Sobriety date'],
  ['referral_source', 'Referral source / organization'],
  ['referring_party_name', 'Referring party name'],
  ['referring_party_relationship', 'Referring party relationship / role'],
  ['referring_party_phone', 'Referring party phone'],
  ['referring_party_email', 'Referring party email'],
  ['employment_income', 'Employment / income plan'],
  ['recovery_support', 'Recovery support / meetings'],
  ['medications', 'Current medications (if any)'],
  ['accommodations', 'Relevant accommodation needs'],
  ['why_housing', 'Why are you seeking sober living housing?'],
] as const;

export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [appId, setAppId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setMsg('Supabase is not configured.');
      setAuthLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    const load = async () => {
      try {
        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (!mounted) return;

        if (sessionError) {
          setMsg(sessionError.message);
          setAuthLoading(false);
          return;
        }

        const current = sessionData.session;
        setSession(current);
        setAuthLoading(false);
        if (!current?.user) return;

        const { data: application, error } = await client
          .from('applications')
          .select('*')
          .eq('user_id', current.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!mounted) return;
        if (error) {
          setMsg(error.message);
          return;
        }

        if (application) {
          setAppId(application.id);
          const loaded: Record<string, string> = {};
          for (const [key] of fields) {
            const value = application[key];
            if (value !== null && value !== undefined) loaded[key] = String(value);
          }
          setData(loaded);
          if (application.certification_accepted === true) setConsent(true);
        }
      } catch (error) {
        if (!mounted) return;
        setMsg(error instanceof Error ? error.message : 'Unable to load your application.');
        setAuthLoading(false);
      }
    };

    void load();

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function save(): Promise<string | null> {
    if (!supabase) {
      setMsg('Supabase is not configured.');
      return null;
    }
    if (authLoading) {
      setMsg('Checking your sign-in session...');
      return null;
    }

    const user = session?.user;
    if (!user) {
      setMsg('Your session has expired. Please sign in again.');
      nav('/login');
      return null;
    }

    const client = supabase;
    setSaving(true);
    setMsg('');

    try {
      const formPayload: Record<string, string | boolean> = {};
      for (const [key] of fields) formPayload[key] = data[key] || '';

      const payload = {
        ...formPayload,
        user_id: user.id,
        status: 'draft',
        certification_accepted: consent,
      };

      if (appId) {
        const { data: updated, error } = await client
          .from('applications')
          .update(payload)
          .eq('id', appId)
          .eq('user_id', user.id)
          .select('id')
          .single();

        if (error) {
          setMsg(error.message);
          return null;
        }
        setAppId(updated.id);
        setMsg('Draft saved.');
        return updated.id as string;
      }

      const { data: created, error } = await client
        .from('applications')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        setMsg(error.message);
        return null;
      }

      setAppId(created.id);
      setMsg('Draft saved.');
      return created.id as string;
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Unable to save your application.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function checkout() {
    if (!consent) {
      setMsg('Please check the certification box before paying and submitting.');
      return;
    }
    if (!supabase) {
      setMsg('Supabase is not configured.');
      return;
    }

    setPaying(true);
    setMsg('Saving your application...');

    try {
      const savedId = await save();
      if (!savedId) return;

      const client = supabase;
      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (sessionError) {
        setMsg(sessionError.message);
        return;
      }

      const token = sessionData.session?.access_token;
      if (!token) {
        setMsg('Your session has expired. Please sign in again.');
        nav('/login');
        return;
      }

      const { error: statusError } = await client
        .from('applications')
        .update({ status: 'pending_payment', certification_accepted: true })
        .eq('id', savedId)
        .eq('user_id', sessionData.session?.user.id);

      if (statusError) {
        setMsg(statusError.message);
        return;
      }

      setMsg('Opening secure payment...');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId: savedId }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMsg(result.error || `Payment setup failed (${response.status}).`);
        return;
      }
      if (!result.url) {
        setMsg(result.error || 'Stripe did not return a checkout URL.');
        return;
      }

      window.location.assign(result.url);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Unable to start payment.');
    } finally {
      setPaying(false);
    }
  }

  if (authLoading) {
    return (
      <section className="page dashboard">
        <h1>Your Housing Application</h1>
        <p>Checking your secure session...</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="page dashboard">
        <h1>Your Housing Application</h1>
        <p>Please sign in to save or submit an application.</p>
        {msg && <p>{msg}</p>}
        <button className="btn" onClick={() => nav('/login')}>Sign In</button>
      </section>
    );
  }

  return (
    <section className="page dashboard">
      <span className="eyebrow">APPLICANT PORTAL</span>
      <h1>Your Housing Application</h1>

      <div className="statusbar">
        <b>Status: Draft</b>
        <span>Complete intake → Pay $35 → Submit → Review → Interview</span>
      </div>

      <div className="formGrid">
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            {['why_housing', 'recovery_support', 'medications', 'accommodations'].includes(key) ? (
              <textarea
                value={data[key] || ''}
                onChange={(event) => setData((current) => ({ ...current, [key]: event.target.value }))}
              />
            ) : (
              <input
                type={
                  key.includes('date') ? 'date' :
                  key.includes('email') ? 'email' :
                  key.includes('phone') ? 'tel' : 'text'
                }
                value={data[key] || ''}
                onChange={(event) => setData((current) => ({ ...current, [key]: event.target.value }))}
              />
            )}
          </label>
        ))}
      </div>

      <label className="consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />{' '}
        I certify that the information provided is accurate and understand that payment of the application fee does not guarantee admission.
      </label>

      {msg && <p>{msg}</p>}

      <div className="actions">
        <button
          className="btn ghost"
          disabled={saving || paying}
          onClick={() => { void save(); }}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>

        <button
          className="btn"
          disabled={saving || paying}
          onClick={() => { void checkout(); }}
        >
          {paying ? 'Opening Payment...' : 'Pay $35 & Submit'}
        </button>
      </div>
    </section>
  );
}
