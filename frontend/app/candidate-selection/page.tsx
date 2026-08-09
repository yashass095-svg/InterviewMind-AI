import CandidateData from "@/data/candidates.json";
import { CandidateSelectionPage } from "@/components/candidates/CandidateSelectionPage";
import type { Candidate } from "@/components/candidates/CandidateCard";

export default function CandidateSelectionRoute() {
  const candidates = (CandidateData as { candidates: Candidate[] }).candidates;

  return <CandidateSelectionPage candidates={candidates} />;
}
