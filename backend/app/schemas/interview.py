from typing import Any

from pydantic import BaseModel


# ---------------------------------------------------------
# START INTERVIEW
# ---------------------------------------------------------

class InterviewStartRequest(BaseModel):
    candidate_id: str
    candidate: dict[str, Any] | None = None

    category: str = "AI/ML"
    difficulty: str = "Medium"


class InterviewStartResponse(BaseModel):
    session_id: str
    question_number: int
    question: str

    category: str | None = None
    difficulty: str | None = None
    total_questions: int | None = None


# ---------------------------------------------------------
# ANSWER INTERVIEW QUESTION
# ---------------------------------------------------------

class InterviewAnswerRequest(BaseModel):
    session_id: str
    answer: str


class InterviewAnswerResponse(BaseModel):
    question_number: int
    question: str | None
    done: bool = False
    total_questions: int | None = None


# ---------------------------------------------------------
# FINISH INTERVIEW
# ---------------------------------------------------------

class InterviewFinishRequest(BaseModel):
    session_id: str


class InterviewFinishResponse(BaseModel):
    session_id: str
    candidate_id: str
    status: str
    answers_count: int
    completed_topics: list[str]


# ---------------------------------------------------------
# REPORT
# ---------------------------------------------------------

class InterviewReportRequest(BaseModel):
    session_id: str


class InterviewReportResponse(BaseModel):
    overall_score: int
    strengths: list[str]
    improvements: list[str]


# ---------------------------------------------------------
# OFFICIAL INTERVIEW
# ---------------------------------------------------------

class OfficialInterviewRequest(BaseModel):
    sessionId: str | None = None
    candidateId: str | None = None
    answer: str | None = None


class OfficialInterviewFeedback(BaseModel):
    summary: str
    strengths: list[str]
    gaps: list[str]
    next: list[str]


class OfficialInterviewResponse(BaseModel):
    reply: str
    done: bool
    feedback: OfficialInterviewFeedback | None = None
