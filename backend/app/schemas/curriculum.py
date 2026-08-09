from __future__ import annotations

from pydantic import BaseModel, Field


class CurriculumDay(BaseModel):
    day: int = Field(..., ge=1)
    title: str = Field(..., min_length=1)
    type: str | None = None
    objectives: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)

    @property
    def topic(self) -> str:
        return self.title


class CurriculumPayload(BaseModel):
    cohort: str | None = None
    modules: list[dict[str, object]] = Field(default_factory=list)
    days: list[CurriculumDay] = Field(default_factory=list)
