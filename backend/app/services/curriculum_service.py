from __future__ import annotations

import json
from pathlib import Path

from app.schemas.curriculum import CurriculumDay, CurriculumPayload


class CurriculumService:
    """Reusable service for loading and validating curriculum content from the official dataset."""

    def __init__(self, data_file: Path | str | None = None) -> None:
        if data_file is None:
            data_file = Path(__file__).resolve().parents[2] / "data" / "curriculum.json"
        self.data_file = Path(data_file)
        self._curriculum: list[CurriculumDay] | None = None

    def load_curriculum(self) -> list[CurriculumDay]:
        if not self.data_file.exists():
            raise FileNotFoundError(f"Curriculum file not found: {self.data_file}")

        with self.data_file.open("r", encoding="utf-8") as source:
            payload = json.load(source)

        if isinstance(payload, dict):
            if "days" not in payload:
                raise ValueError("Curriculum dataset must provide a 'days' collection")
            parsed = CurriculumPayload.model_validate(payload)
            self._curriculum = parsed.days
        elif isinstance(payload, list):
            self._curriculum = [CurriculumDay.model_validate(item) for item in payload]
        else:
            raise ValueError("Curriculum data must be a JSON object or array")

        return self._curriculum or []

    def get_curriculum_days(self) -> list[CurriculumDay]:
        if self._curriculum is None:
            self.load_curriculum()

        return list(self._curriculum or [])

    def get_day(self, day: int) -> CurriculumDay:
        if day < 1:
            raise ValueError("day must be >= 1")

        if self._curriculum is None:
            self.load_curriculum()

        for curriculum_day in self._curriculum or []:
            if curriculum_day.day == day:
                return curriculum_day

        raise KeyError(f"Curriculum day {day} was not found")
