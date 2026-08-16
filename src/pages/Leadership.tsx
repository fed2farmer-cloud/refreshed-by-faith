import { HeartHandshake, ShieldCheck, ClipboardCheck, Users, Activity, Stethoscope, FileCheck2, HandHeart, Route, ClipboardList } from 'lucide-react';

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

const leadershipTeam = [
  {
    name: 'Ruth E. Guerra',
    role: 'Sober Living Administrator — Operations, Intake & Compliance',
    icon: ClipboardList,
    summary: 'Ruth supports the administrative backbone of Refreshed By Faith through intake coordination, documentation, staffing workflows, compliance support, reporting and confidential records management. Her background includes leadership roles in regulated healthcare administration and financial services.',
    highlights: [
      'Healthcare intake and administrative operations',
      'Compliance, documentation and audit readiness',
      'Staff onboarding and workflow coordination',
      'Leadership reporting and client communication',
      'Bilingual English / Spanish communication',
    ],
  },
  {
    name: 'Jesus Espinal',
    role: 'Resident Reentry & Operations Coordinator',
    icon: Route,
    summary: 'Jesus supports resident reentry, transportation coordination, employment readiness, house operations and practical accountability. His lived experience with incarceration is paired with professional experience in driving, route operations, safety, documentation and customer service.',
    highlights: [
      'Resident reentry and practical peer support',
      'Transportation and route coordination',
      'Employment readiness and workplace accountability',
      'Property and house operations',
      'Safety, logs, documentation and dependable field work',
    ],
  },
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

    <section className="leadershipTeamSection">
      <div className="leadershipTeamHeading">
        <span className="eyebrow">LEADERSHIP TEAM</span>
        <h2>Experienced support for administration, reentry and daily operations.</h2>
        <p>Our leadership team combines healthcare administration, operational discipline, resident support and lived experience to help maintain a structured, respectful recovery environment.</p>
      </div>
      <div className="leadershipTeamGrid">
        {leadershipTeam.map(({name, role, icon: Icon, summary, highlights}) => <article className="leadershipTeamCard" key={name}>
          <div className="leadershipTeamIcon"><Icon size={26}/></div>
          <h3>{name}</h3>
          <p className="leadershipTeamRole">{role}</p>
          <p>{summary}</p>
          <div className="leadershipHighlights">
            {highlights.map((item)=><div key={item}><ShieldCheck size={16}/><span>{item}</span></div>)}
          </div>
        </article>)}
      </div>
    </section>

    <section className="professionalStandard">
      <ShieldCheck size={25}/><div><strong>Professional Standard</strong><p>Leadership roles at Refreshed By Faith are focused on recovery-housing operations, resident support and administrative coordination. Healthcare credentials, lived experience and operational backgrounds are not represented as authorization to provide licensed substance-use-disorder treatment or other services requiring separate professional licensure.</p></div>
    </section>
  </div>
}
