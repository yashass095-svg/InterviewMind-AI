from fastapi import APIRouter, HTTPException

from app.schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    InterviewAnswerRequest,
    InterviewAnswerResponse,
    InterviewFinishRequest,
    InterviewFinishResponse,
    InterviewReportRequest,
    InterviewReportResponse,
)

from app.services.session_manager import (
    InterviewSessionManager,
)


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"],
)


# ---------------------------------------------------------
# SESSION MANAGER
# ---------------------------------------------------------

session_manager = InterviewSessionManager()


# ---------------------------------------------------------
# START INTERVIEW
# ---------------------------------------------------------

@router.post(
    "/start",
    response_model=InterviewStartResponse,
)
def start_interview(
    payload: InterviewStartRequest,
):

    session = session_manager.create_session(
        candidate_id=payload.candidate_id,
        candidate=payload.candidate,
        category=payload.category,
        difficulty=payload.difficulty,
    )

    return {
        "session_id": session.session_id,
        "question_number": session.question_number,
        "question": session.current_question,
        "category": getattr(session, "category", payload.category),
        "difficulty": getattr(session, "difficulty", payload.difficulty),
        "total_questions": session.total_questions,
    }


# ---------------------------------------------------------
# SUBMIT ANSWER
# ---------------------------------------------------------

@router.post(
    "/answer",
    response_model=InterviewAnswerResponse,
)
def answer_interview_question(
    payload: InterviewAnswerRequest,
):

    try:
        result = session_manager.answer_question(
            session_id=payload.session_id,
            answer=payload.answer,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    return result


# ---------------------------------------------------------
# FINISH INTERVIEW
# ---------------------------------------------------------

@router.post(
    "/finish",
    response_model=InterviewFinishResponse,
)
def finish_interview(
    payload: InterviewFinishRequest,
):

    result = session_manager.finish_session(
        session_id=payload.session_id,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    return {
        "session_id": result.session_id,
        "candidate_id": result.candidate_id,
        "status": result.status,
        "answers_count": result.answers_count,
        "completed_topics": result.completed_topics,
    }


# ---------------------------------------------------------
# REPORT
# ---------------------------------------------------------

@router.post(
    "/report",
    response_model=InterviewReportResponse,
)
def interview_report(
    payload: InterviewReportRequest,
):

    result = session_manager.generate_report(
        session_id=payload.session_id,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    return result
