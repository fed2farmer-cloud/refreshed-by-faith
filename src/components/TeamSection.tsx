import { renewedByFaithTeam } from "../data/team";

export default function TeamSection() {
  return (
    <section id="leadership" className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Our Team</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Renewed By Faith Leadership</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {renewedByFaithTeam.map((member) => (
            <article key={member.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900">{member.name}</h3>
              <p className="mt-1 font-semibold text-emerald-700">{member.title}</p>
              <p className="mt-4 leading-7 text-slate-600">{member.summary}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {member.strengths.map((strength) => <li key={strength}>• {strength}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
