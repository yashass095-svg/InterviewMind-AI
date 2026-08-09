"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/landing/Header";
import { CandidateGrid } from "./CandidateGrid";
import type { Candidate } from "./CandidateCard";

type CandidateSelectionPageProps = {
  candidates: Candidate[];
};

const readinessFilters = ["All", "Prime", "Rising", "Coach"];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function getReadiness(candidate: Candidate) {
  const missions = candidate.missions || [];
  const completed = missions.filter((mission) => mission.passed === true).length;
  const rate = missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0;

  if (rate >= 75) {
    return "Prime";
  }

  if (rate >= 45) {
    return "Rising";
  }

  return "Coach";
}

export function CandidateSelectionPage({ candidates }: CandidateSelectionPageProps) {
  const [query, setQuery] = useState("");
  const [readiness, setReadiness] = useState("All");

  const stats = useMemo(() => {
    const totalMissions = candidates.reduce(
      (sum, candidate) => sum + candidate.missions.length,
      0,
    );
    const completedMissions = candidates.reduce(
      (sum, candidate) =>
        sum + candidate.missions.filter((mission) => mission.passed).length,
      0,
    );
    const avgExperience =
      candidates.reduce(
        (sum, candidate) => sum + candidate.member.yearsExperience,
        0,
      ) / Math.max(candidates.length, 1);

    return {
      total: candidates.length,
      completion:
        totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0,
      avgExperience: avgExperience.toFixed(1),
    };
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const normalizedQuery = normalize(query);

    return candidates.filter((candidate) => {
      const member = candidate.member;
      const matchesQuery =
        normalize(member.name).includes(normalizedQuery) ||
        normalize(member.jobRole).includes(normalizedQuery) ||
        normalize(member.education).includes(normalizedQuery);
      const matchesReadiness =
        readiness === "All" || normalize(getReadiness(candidate)) === normalize(readiness);

      return matchesQuery && matchesReadiness;
    });
  }, [candidates, query, readiness]);

  return (
    <div className="min-h-screen bg-[#07110f] text-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-emerald-300/35 bg-emerald-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.20em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Candidate command center
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
              Interview pipeline
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Select a learner, review readiness signals, and launch an adaptive
              technical interview from the same workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Candidates", String(stats.total), "Profiles loaded"],
              ["Mission pass", `${stats.completion}%`, "Across cohort"],
              ["Avg exp.", `${stats.avgExperience}y`, "Engineering depth"],
            ].map(([label, value, caption]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  {label}
                </div>
                <div className="mt-4 text-4xl font-black text-white">{value}</div>
                <div className="mt-2 text-sm text-slate-400">{caption}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-white/10 bg-[#0b1715] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block flex-1">
              <span className="sr-only">Search candidates</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, role, or education"
                className="h-12 w-full rounded-lg border border-white/10 bg-slate-950 px-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300/55"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {readinessFilters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReadiness(item)}
                  className={`h-11 rounded-lg border px-4 text-sm font-bold transition ${
                    readiness === item
                      ? "border-emerald-300 bg-emerald-300 text-slate-950"
                      : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-emerald-300/45"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8">
          <CandidateGrid candidates={filteredCandidates} />
        </div>
      </main>
    </div>
  );
}
