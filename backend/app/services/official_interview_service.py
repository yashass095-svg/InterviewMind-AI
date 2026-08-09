from __future__ import annotations

from fastapi import HTTPException

from app.services.candidate_service import CandidateService
from app.services.curriculum_service import CurriculumService
from app.services.session_manager import InterviewSessionManager

MAX_INTERVIEW_QUESTIONS = 8


class OfficialInterviewService:
    """Service for the official InterviewMind hackathon interview API."""

    def __init__(
        self,
        session_manager: InterviewSessionManager | None = None,
        candidate_service: CandidateService | None = None,
        curriculum_service: CurriculumService | None = None,
    ) -> None:
        self.session_manager = session_manager or InterviewSessionManager()
        self.candidate_service = candidate_service or CandidateService()
        self.curriculum_service = curriculum_service or CurriculumService()
        self.curriculum_days = self.curriculum_service.get_curriculum_days()

    def handle_request(self, payload) -> dict:
        """Entry point for the /api/interview contract."""
        if payload.sessionId:
            return self.continue_interview(payload.sessionId, payload.answer)

        if not payload.candidateId:
            raise HTTPException(status_code=422, detail="candidateId is required")

        return self.start_interview(payload.candidateId)

    def start_interview(self, candidate_id: str) -> dict:
        candidate = self.candidate_service.get_candidate_by_id(candidate_id)
        curriculum = self.curriculum_service.get_curriculum_days()

        # Build a stable 8-question curriculum-driven interview plan.
        question = self._generate_question(
            candidate= candidate,
            curriculum_days=curriculum,
            question_number=1,
        )

        session = self.session_manager.create_official_session(
            candidate_id=candidate_id,
            candidate=candidate.model_dump(mode="json") if hasattr(candidate, "model_dump") else candidate,
            question_number=1,
            current_question=question,
        )

        return {
            "reply": session.current_question,
            "done": False,
        }

    def continue_interview(self, session_id: str, answer: str | None) -> dict:
        session = self.session_manager.get_session(session_id)
        if session is None:
            raise HTTPException(status_code=404, detail="Interview session not found")

        if answer is not None:
            session.answers.append(answer)

        current_answer_count = len(session.answers)
        if current_answer_count >= MAX_INTERVIEW_QUESTIONS:
            feedback = self._build_feedback(session)
            session.status = "completed"
            return {
                "reply": "Interview completed.",
                "done": True,
                "feedback": feedback,
            }

        next_question_number = current_answer_count + 1
        next_question = self._generate_question(
            candidate=self.candidate_service.get_candidate_by_id(session.candidate_id),
            curriculum_days=self.curriculum_days,
            question_number=next_question_number,
        )
        session.question_number = next_question_number
        session.current_question = next_question

        return {
            "reply": next_question,
            "done": False,
        }

    def _generate_question(self, candidate, curriculum_days: list, question_number: int) -> str:
        member = candidate.member if hasattr(candidate, "member") else None
        candidate_name = member.name if member else candidate.get("member", {}).get("name", "candidate")
        job_role = member.jobRole if member else candidate.get("member", {}).get("jobRole", "role")

        curriculum_day = curriculum_days[(question_number - 1) % len(curriculum_days)]
        day_title = getattr(curriculum_day, "title", getattr(curriculum_day, "topic", "the curriculum topic"))
        return (
            f"Question {question_number}: {candidate_name} ({job_role}), explain how you would apply "
            f"{day_title} to a production interview or enterprise AI workflow."
        )

    def _build_feedback(self, session) -> dict:
        candidate = self.candidate_service.get_candidate_by_id(session.candidate_id)
        member = candidate.member if hasattr(candidate, "member") else None
        candidate_name = member.name if member else "candidate"

        curriculum_topics = [day.title if hasattr(day, "title") else day.topic for day in self.curriculum_days]
        strongest_topics = curriculum_topics[:2]
        gap_topics = curriculum_topics[-2:]
        next_topics = curriculum_topics[2:4]

        return {
            "summary": f"{candidate_name} completed the InterviewMind AI hackathon interview with structured discussion across {len(curriculum_topics)} curriculum topics.",
            "strengths": strongest_topics,
            "gaps": gap_topics,
            "next": next_topics,
        }
