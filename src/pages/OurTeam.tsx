import TeamSection from "../components/TeamSection";

export default function OurTeam() {
  return (
    <main>
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">Renewed By Faith</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">Leadership</h1>
          <p className="mt-5 max-w-2xl text-slate-300">Meet the people helping Renewed By Faith provide structure, accountability, practical support, and a path forward.</p>
        </div>
      </section>
      <TeamSection />
    </main>
  );
}
