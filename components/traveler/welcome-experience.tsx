import Link from "next/link";

export function WelcomeExperience() {
  return (
    <main className="welcome-stage relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-500 text-white">
      <div
        aria-hidden="true"
        className="welcome-glow absolute -left-24 -top-24 size-96 rounded-full bg-lime-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[38%] bg-[linear-gradient(165deg,transparent_0_26%,rgba(255,255,255,.12)_27_42%,rgba(3,70,54,.5)_43%)]"
      />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[1fr_.9fr] lg:px-12">
        <section className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-100">
            AI Travel Companion Thailand
          </p>
          <h1 className="mt-5 text-5xl font-black leading-[.95] tracking-tight sm:text-7xl">
            Thailand feels closer with a trusted companion.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-emerald-50 sm:text-xl">
            Discover local culture, shape a thoughtful trip and keep verified help
            within reach—free for travelers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center rounded-2xl bg-white px-6 font-bold text-emerald-950 shadow-xl"
              href="/"
            >
              Start exploring
            </Link>
            <span className="inline-flex min-h-12 items-center rounded-2xl border border-white/30 px-5 text-sm font-semibold">
              English · ภาษาไทย
            </span>
          </div>
          <p className="mt-5 text-xs text-emerald-100">
            Development preview · synthetic content only
          </p>
        </section>
        <section
          aria-label="Official ATC mascot placement"
          className="relative mx-auto grid w-full max-w-lg place-items-center"
        >
          <div
            aria-hidden="true"
            className="absolute size-[85%] rounded-full bg-white/15 blur-2xl"
          />
          <div className="welcome-mascot relative grid aspect-square w-full place-items-center rounded-[42%] border border-white/25 bg-white/95 p-8 text-center text-emerald-950 shadow-2xl">
            <div>
              <span className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-emerald-900 text-2xl font-black text-white">
                ATC
              </span>
              <p className="mt-5 text-lg font-black">Approved mascot direction</p>
              <p className="mt-2 text-sm text-slate-600">
                Official artwork slot—asset rights confirmation required
              </p>
            </div>
          </div>
          <span className="absolute -bottom-3 rounded-full bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-950">
            Ready for future motion layers
          </span>
        </section>
      </div>
    </main>
  );
}
