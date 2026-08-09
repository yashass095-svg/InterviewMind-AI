from __future__ import annotations

from pydantic import BaseModel, Field


class CandidateMember(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    jobRole: str = Field(..., min_length=1)
    yearsExperience: int = Field(..., ge=0)
    education: str = Field(..., min_length=1)
    status: str = Field(..., min_length=1)


class CandidateMission(BaseModel):
    day: int | None = None
    title: str | None = None
    passed: bool | None = None
    skipped: bool | None = None
    attempts: int | None = None


class CandidateSignals(BaseModel):
    commitDays: int | None = None
    missionsCompleted: int | None = None
    missionsFirstTry: int | None = None


class CandidateProfile(BaseModel):
    member: CandidateMember
    missions: list[CandidateMission] = Field(default_factory=list)
    signals: CandidateSignals | None = None


class CandidateDataset(BaseModel):
    candidates: list[CandidateProfile] = Field(default_factory=list)
