"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type CandidateMember = {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
};

export type CandidateMission = {
  day?: number;
  title?: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
};

export type Candidate = {
  member: CandidateMember;
  missions: CandidateMission[];
  signals?: {
    commitDays?: number;
    missionsCompleted?: number;
    missionsFirstTry?: number;
  };
};

type CandidateCardProps = {
  candidate: Candidate;
};

export function CandidateCard({ candidate }: CandidateCardProps) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const member = candidate.member;

  const { completedMissions, missionRate, readinessLabel, readinessTone } =
    useMemo(() => {
      const missions = candidate.missions || [];
      const completed = missions.filter((mission) => mission.passed === true).length;
      const rate = missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0;

      if (rate >= 75) {
        return {
          completedMissions: completed,
          missionRate: rate,
          readinessLabel: "Prime",
          readinessTone: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
        };
      }

      if (rate >= 45) {
        return {
          completedMissions: completed,
          missionRate: rate,
          readinessLabel: "Rising",
          readinessTone: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
        };
      }

      return {
        completedMissions: completed,
        missionRate: rate,
        readinessLabel: "Coach",
        readinessTone: "border-amber-300/35 bg-amber-300/10 text-amber-100",
      };
    }, [candidate.missions]);

  async function handleStartInterview() {
    setStarting(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidate_id: member.id,
          candidate,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend interview service is not ready.");
      }

      router.push(`/interview/${member.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start the interview session.",
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <article className="group rounded-xl border border-white/10 bg-[#0b1715] p-6 shadow-2xl shadow-black/25 transition hover:-translate-y-1 hover:border-emerald-300/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-emerald-300/40 bg-emerald-300 text-sm font-black text-slate-950">
            {member.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {member.name}
            </h3>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {member.jobRole}
            </div>
          </div>
        </div>

        <span className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${readinessTone}`}>
          {readinessLabel}
        </span>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          <span>Mission readiness</span>
          <span>{missionRate}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-200"
            style={{ width: `${Math.max(6, missionRate)}%` }}
          />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
            Experience
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {member.yearsExperience} yrs
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
            Education
          </div>
          <div className="mt-2 text-sm font-semibold text-white">
            {member.education}
          </div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
            Completed Missions
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {completedMissions}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
            Status
          </div>
          <div className="mt-2 text-sm font-semibold text-emerald-200">
            {member.status}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-7">
        <button
          type="button"
          onClick={handleStartInterview}
          disabled={starting}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-emerald-300 px-6 text-sm font-black uppercase tracking-[0.13em] text-slate-950 transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-70"
        >
          {starting ? "Starting..." : "Start interview"}
        </button>
      </div>
    </article>
  );
}

