type Metric = {
  label: string;
  value: string;
  tone: string;
};

type TimelineItem = {
  step: string;
  title: string;
  detail: string;
  tone: string;
};

const metrics: Metric[] = [
  { label: "Cohort fit", value: "94%", tone: "text-emerald-200" },
  { label: "Skill signals", value: "128", tone: "text-cyan-200" },
  { label: "Risk flags", value: "03", tone: "text-amber-200" },
];

const timeline: TimelineItem[] = [
  {
    step: "01",
    title: "Profile sync",
    detail: "Reads candidate history, cohort pace, and completed missions.",
    tone: "border-emerald-300/35 bg-emerald-300/10",
  },
  {
    step: "02",
    title: "Adaptive interview",
    detail: "Moves from fundamentals into deeper system thinking.",
    tone: "border-cyan-300/35 bg-cyan-300/10",
  },
  {
    step: "03",
    title: "Evaluation report",
    detail: "Scores clarity, correctness, examples, and readiness gaps.",
    tone: "border-amber-300/35 bg-amber-300/10",
  },
];

function MetricPill({ label, value, tone }: Metric) {
  return (
    <div className="border-l border-white/10 px-5 first:border-l-0">
      <div className={`text-3xl font-black ${tone}`}>{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
    </div>
  );
}

function SignalRail() {
  return (
    <div className="grid gap-3">
      {["Prompt design", "Retrieval strategy", "Vector reasoning", "Agent planning"].map(
        (item, index) => (
          <div
            key={item}
            className="grid grid-cols-[120px_1fr_52px] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3"
          >
            <span className="text-xs font-semibold text-slate-300">{item}</span>
            <span className="h-2 overflow-hidden rounded-full bg-slate-800">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200"
                style={{ width: `${86 - index * 9}%` }}
              />
            </span>
            <span className="font-mono text-xs font-bold text-slate-400">
              {86 - index * 9}%
            </span>
          </div>
        ),
      )}
    </div>
  );
}

export function HeroSection() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#07110f]">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(16,185,129,0.16),transparent_35%),linear-gradient(300deg,rgba(34,211,238,0.13),transparent_38%),linear-gradient(180deg,transparent,rgba(15,23,42,0.7))]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

        <div className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-3 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_5px_rgba(52,211,153,0.14)]" />
              Enterprise AI interviewer
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl lg:text-[5.6rem]">
              InterviewMind AI
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              A sharper technical interview workspace that turns candidate history,
              curriculum progress, and live answers into structured hiring signal.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="/candidate-selection"
                className="inline-flex h-13 items-center justify-center rounded-lg bg-emerald-300 px-7 text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.26)] transition hover:bg-emerald-200"
              >
                Start interview
              </a>
              <a
                href="#platform"
                className="inline-flex h-13 items-center justify-center rounded-lg border border-white/15 px-7 text-sm font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:bg-white/8"
              >
                View system
              </a>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-3 rounded-xl border border-white/10 bg-black/18 py-5 shadow-2xl shadow-black/20">
              {metrics.map((metric) => (
                <MetricPill key={metric.label} {...metric} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/12 bg-[#0b1715]/90 p-5 shadow-2xl shadow-black/35">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Live console
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      Systems Design Interview
                    </div>
                  </div>
                  <span className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-100">
                    Active
                  </span>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_180px]">
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 p-5">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                      Current question
                    </div>
                    <p className="mt-4 text-lg font-semibold leading-8 text-white">
                      Design a retrieval pipeline that stays reliable when source
                      documents change every day.
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {["Depth", "Evidence", "Tradeoffs"].map((item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-xs font-bold text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-5">
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-amber-100">
                      Confidence
                    </div>
                    <div className="mt-4 text-5xl font-black text-amber-100">87</div>
                    <div className="mt-2 text-sm text-amber-50/70">Ready for deep follow-up</div>
                  </div>
                </div>

                <div className="mt-5">
                  <SignalRail />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {timeline.map((item) => (
                  <div
                    key={item.step}
                    className={`rounded-xl border p-4 ${item.tone}`}
                  >
                    <div className="font-mono text-xs font-black text-white/70">
                      {item.step}
                    </div>
                    <div className="mt-3 text-base font-bold text-white">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-[#0b1210] px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
              Built for repeat interviews
            </div>
            <h2 className="mt-4 max-w-xl text-3xl font-black text-white md:text-5xl">
              More signal, less manual scoring.
            </h2>
          </div>

          <div id="signals" className="grid gap-4 md:grid-cols-3">
            {[
              ["Adaptive depth", "Question flow responds to prior mission outcomes."],
              ["Scored reports", "Each response is evaluated for clarity and correctness."],
              ["Team ready", "Candidate states, session progress, and reports stay organized."],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
                <div className="text-lg font-bold text-white">{title}</div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
