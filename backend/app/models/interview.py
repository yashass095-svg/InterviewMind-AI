from dataclasses import dataclass, field
from typing import Any


@dataclass
class InterviewSession:
    """In-memory interview session domain model."""

    session_id: str
    candidate_id: str
    current_question: str | None
    answers: list[Any] = field(default_factory=list)
    covered_topics: list[str] = field(default_factory=list)
    candidate: dict[str, Any] | None = None
    question_number: int = 1
    total_questions: int = 0
    status: str = "active"

    @property
    def answers_count(self) -> int:
        return len(self.answers)

    @property
    def completed_topics(self) -> list[str]:
        return self.covered_topics

    @property
    def as_dict(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "candidate_id": self.candidate_id,
            "candidate": self.candidate,
            "current_question": self.current_question,
            "answers": self.answers,
            "covered_topics": self.covered_topics,
            "question_number": self.question_number,
            "total_questions": self.total_questions,
            "status": self.status,
        }
