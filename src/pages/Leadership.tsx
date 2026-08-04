import { HeartHandshake, ShieldCheck, ClipboardCheck, Users, Activity, Stethoscope, FileCheck2, HandHeart } from 'lucide-react';

const strengths = [
  [HandHeart, 'Resident Support & Safety'],
  [ClipboardCheck, 'Healthcare Documentation'],
  [ShieldCheck, 'HIPAA & Confidentiality'],
  [Stethoscope, 'Infection Control & PPE'],
  [Activity, 'Rehabilitation Support'],
  [Users, 'Interdisciplinary Communication'],
  [HeartHandshake, 'ADL & Mobility Support'],
  [FileCheck2, 'Operational Accountability'],
] as const;

export default function Leadership(){
  return <div className="page leadershipPage">
    <section className="leadershipHero">
      <div>
        <span className="eyebrow">EXECUTIVE LEADERSHIP</span>
        <h1>Acamie Salter</h1>
        <p className="leadershipRole">Managing Director — Resident Care & Operations</p>
        <p className="lead">Acamie Salter serves as Managing Director of Refreshed By Faith, bringing more than a decade of hands-on experience across healthcare, rehabilitation, acute care, direct patient support and surgical services.</p>
      </div>
      <aside className="credentialCard">
        <ShieldCheck size={34}/>
        <span>CALIFORNIA CREDENTIAL</span>
        <h3>Certified Nursing Assistant</h3>
        <p><strong>CDPH CNA No. 01100945</strong><br/>Active status shown in the credential verification supplied to Refreshed By Faith.</p>
        <p>IHSS provider experience is also reflected in the supplied provider account information.</p>
      </aside>
    </section>

    <section className="leadershipContent">
      <article>
        <span className="eyebrow">PROFESSIONAL BACKGROUND</span>
        <h2>Healthcare experience grounded in safety and dignity.</h2>
        <p>Her professional background includes service as a Certified Nursing Assistant, Rehabilitation Technician and Surgical Scrub Technician. Her résumé documents healthcare work dating to 2013, including Ohio Health Rehab, IHSS/Acute Care, Kindred Hospital Los Angeles, Providence Health & Services and Mercy Southwest in Bakersfield.</p>
        <p>Her responsibilities have included activities-of-daily-living support, patient mobility and transfers, vital-sign monitoring, healthcare documentation, HIPAA confidentiality, infection-control practices, PPE use, recognition and reporting of changes in patient condition, rehabilitation support and coordination with interdisciplinary healthcare teams.</p>
      </article>
      <article className="rolePanel">
        <span className="eyebrow">ROLE AT REFRESHED BY FAITH</span>
        <h2>Resident Care & Operations</h2>
        <p>As Managing Director, Ms. Salter provides leadership for day-to-day resident-support and operational standards. Her background is well aligned with resident intake and documentation, safety practices, confidentiality, referral coordination, policy implementation, recognition of circumstances requiring outside professional care, and communication with healthcare, behavioral-health, social-service and referring organizations.</p>
      </article>
    </section>

    <section className="strengthSection">
      <span className="eyebrow">CORE LEADERSHIP STRENGTHS</span>
      <div className="strengthGrid">{strengths.map(([Icon,label])=><div className="strengthCard" key={label}><Icon size={22}/><strong>{label}</strong></div>)}</div>
    </section>

    <section className="professionalStandard">
      <ShieldCheck size={25}/><div><strong>Professional Standard</strong><p>Ms. Salter’s leadership role is focused on recovery-housing operations and resident support. Her CNA credential and healthcare experience are not represented as authorization to provide licensed substance-use-disorder treatment or other services requiring separate professional licensure.</p></div>
    </section>
  </div>
}
