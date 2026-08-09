from __future__ import annotations

import json
from pathlib import Path

from app.schemas.candidate import CandidateDataset, CandidateProfile


class CandidateService:
    """Reusable service for loading and validating candidate profiles from the official dataset."""

    def __init__(self, data_file: Path | str | None = None) -> None:
        if data_file is None:
            data_file = Path(__file__).resolve().parents[2] / "data" / "candidates.json"
        self.data_file = Path(data_file)
        self._profiles: list[CandidateProfile] | None = None

    def load_profiles(self) -> list[CandidateProfile]:
        if not self.data_file.exists():
            raise FileNotFoundError(f"Candidate profile file not found: {self.data_file}")

        with self.data_file.open("r", encoding="utf-8") as source:
            payload = json.load(source)

        if isinstance(payload, dict):
            if "candidates" not in payload:
                raise ValueError("Candidate data must provide a 'candidates' collection")
            dataset = CandidateDataset.model_validate(payload)
            self._profiles = dataset.candidates
        elif isinstance(payload, list):
            self._profiles = [CandidateProfile.model_validate(item) for item in payload]
        else:
            raise ValueError("Candidate profile data must be a JSON object or array")

        return self._profiles or []

    def get_candidate_by_id(self, candidate_id: str) -> CandidateProfile:
        if not candidate_id or not candidate_id.strip():
            raise ValueError("candidate_id is required")

        if self._profiles is None:
            self.load_profiles()

        for profile in self._profiles or []:
            if profile.member.id == candidate_id:
                return profile

        raise KeyError(f"Candidate '{candidate_id}' was not found")

    def get_all_candidates(self) -> list[CandidateProfile]:
        if self._profiles is None:
            self.load_profiles()

        return list(self._profiles or [])
