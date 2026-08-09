export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07110f]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="/" className="flex items-center gap-3" aria-label="InterviewMind AI">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-300 text-sm font-black text-slate-950 shadow-[0_0_26px_rgba(52,211,153,0.28)]">
            IM
          </span>
          <span className="text-base font-semibold text-white md:text-lg">InterviewMind AI</span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <a className="transition hover:text-emerald-300" href="#platform">
            Platform
          </a>
          <a className="transition hover:text-emerald-300" href="/candidate-selection">
            AI Interviews
          </a>
          <a className="transition hover:text-emerald-300" href="#signals">
            Cohort Intelligence
          </a>
          <a className="transition hover:text-emerald-300" href="#platform">
            Security
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/candidate-selection" className="hidden text-sm font-medium text-slate-300 transition hover:text-white md:inline-flex">
            Log in
          </a>
          <a
            href="/candidate-selection"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-300/40 bg-emerald-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
          >
            Open workspace
          </a>
        </div>
      </nav>
    </header>
  );
}
