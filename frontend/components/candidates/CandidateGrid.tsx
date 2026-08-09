import { Candidate, CandidateCard } from "./CandidateCard";

type CandidateGridProps = {
  candidates: Candidate[];
};

export function CandidateGrid({ candidates }: CandidateGridProps) {
  if (candidates.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
        <h2 className="text-2xl font-black text-white">No candidates found</h2>
        <p className="mt-3 text-sm text-slate-400">
          Adjust your search or status filter to bring profiles back into view.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.member.id} candidate={candidate} />
      ))}
    </section>
  );
}
