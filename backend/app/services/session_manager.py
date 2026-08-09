from __future__ import annotations

from typing import Any
from uuid import uuid4

from app.models.interview import InterviewSession
from app.services.ai_evaluator import AIInterviewEvaluator


# 8 interview questions
INTERVIEW_QUESTIONS = [
    "Explain Prompt Engineering and why it is important.",
    "Explain Retrieval Augmented Generation (RAG) and how it works.",
    "What is a Vector Database and why is it useful for AI applications?",
    "What are AI Agents and how are they different from traditional chatbots?",
    "How would you design a secure authentication flow for an API?",
    "Compare synchronous and asynchronous processing in a distributed system.",
    "Explain the tradeoffs between relational databases and vector databases.",
    "How would you design a scalable AI-powered application?",
]


class InterviewSessionManager:
    def __init__(self):
        self.sessions: dict[str, InterviewSession] = {}
        self.ai_evaluator = AIInterviewEvaluator()

    def create_session(
        self,
        candidate_id: str,
        candidate: Any = None,
        category: str = "AI/ML",
        difficulty: str = "Medium",
    ) -> InterviewSession:
        """
        Create a new interview session.

        category and difficulty are accepted here because
        the API sends them when starting an interview.
        """

        session_id = str(uuid4())

        session = InterviewSession(
            session_id=session_id,
            candidate_id=candidate_id,
            candidate=candidate,
            current_question=INTERVIEW_QUESTIONS[0],
            question_number=1,
            total_questions=len(INTERVIEW_QUESTIONS),
            covered_topics=[],
            answers=[],
            status="active",
        )

        # Store additional information if the model supports it.
        # We keep these as normal Python attributes so the API
        # can use them without passing unsupported fields to Pydantic.
        try:
            session.category = category
        except Exception:
            pass

        try:
            session.difficulty = difficulty
        except Exception:
            pass

        self.sessions[session_id] = session

        return session

    def create_official_session(
        self,
        candidate_id: str,
        candidate: Any = None,
        category: str = "AI/ML",
        difficulty: str = "Medium",
        question_number: int = 1,
        current_question: str | None = None,
    ) -> InterviewSession:
        """
        Create an official interview session.
        """

        session = self.create_session(
            candidate_id=candidate_id,
            candidate=candidate,
            category=category,
            difficulty=difficulty,
        )
        session.question_number = question_number

        if current_question is not None:
            session.current_question = current_question

        return session

    def get_session(self, session_id: str) -> InterviewSession | None:
        """
        Get an existing interview session.
        """

        return self.sessions.get(session_id)

    def answer_question(
        self,
        session_id: str,
        answer: str,
    ) -> dict | None:
        """
        Save the candidate's answer and move to the next question.
        """

        session = self.get_session(session_id)

        if session is None:
            return None

        if getattr(session, "status", "active") != "active":
            raise ValueError("Interview session is already completed.")

        question_number = getattr(session, "question_number", 1)

        current_question = getattr(
            session,
            "current_question",
            INTERVIEW_QUESTIONS[question_number - 1],
        )

        # Store answer
        if not hasattr(session, "answers") or session.answers is None:
            session.answers = []

        session.answers.append(
            {
                "question_number": question_number,
                "question": current_question,
                "answer": answer,
            }
        )

        # Check if this was the final question
        if question_number >= len(INTERVIEW_QUESTIONS):
            session.status = "completed"
            session.current_question = None

            return {
                "done": True,
                "question_number": question_number,
                "total_questions": len(INTERVIEW_QUESTIONS),
                "question": None,
            }

        # Move to next question
        next_question_number = question_number + 1
        next_question = INTERVIEW_QUESTIONS[next_question_number - 1]

        session.question_number = next_question_number
        session.current_question = next_question

        return {
            "done": False,
            "question_number": next_question_number,
            "total_questions": len(INTERVIEW_QUESTIONS),
            "question": next_question,
        }

    def finish_session(self, session_id: str) -> InterviewSession | None:
        """
        Mark the interview as completed.
        """

        session = self.get_session(session_id)

        if session is None:
            return None

        session.status = "completed"

        return session

    def generate_report(self, session_id: str) -> dict | None:
        """
        Evaluate all submitted answers and generate the final report.
        """

        session = self.get_session(session_id)

        if session is None:
            return None

        answers = getattr(session, "answers", []) or []

        if not answers:
            return {
                "overall_score": 0,
                "strengths": [
                    "Attempted the interview questions"
                ],
                "improvements": [
                    "Provide technical answers",
                    "Include practical examples",
                ],
            }

        scores = []
        strengths: list[str] = []
        improvements: list[str] = []

        for item in answers:
            question = item.get("question", "")
            answer = item.get("answer", "")

            if not answer.strip():
                continue

            try:
                result = self.ai_evaluator.evaluate_answer(
                    question=question,
                    answer=answer,
                )

                scores.append(result.get("score", 0))

                strengths.extend(
                    result.get("strengths", [])
                )

                improvements.extend(
                    result.get("improvements", [])
                )

            except Exception as exc:
                print(f"Gemini evaluation error: {exc}")

        if scores:
            overall_score = round(sum(scores) / len(scores))
        else:
            overall_score = 0

        # Remove duplicate items
        strengths = list(dict.fromkeys(strengths))
        improvements = list(dict.fromkeys(improvements))

        # Keep report concise
        strengths = strengths[:5]
        improvements = improvements[:8]

        if not strengths:
            strengths = [
                "Attempted the interview questions"
            ]

        if not improvements:
            improvements = [
                "Continue improving technical explanations",
                "Provide practical examples",
            ]

        return {
            "overall_score": max(0, min(100, overall_score)),
            "strengths": strengths,
            "improvements": improvements,
        }
