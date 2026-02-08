"""Quiz endpoints – generate quizzes via LLM."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.content import QuizResponse
from app.services import syllabus_service, content_service
from app.services.llm_service import generate_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post("/{topic_id}", response_model=QuizResponse)
async def create_quiz(
    topic_id: int,
    num_questions: int = 5,
    difficulty: str = "intermediate",
    session: AsyncSession = Depends(get_db),
):
    """Generate a multiple-choice quiz for a topic."""
    topic = await syllabus_service.get_topic_detail(session, topic_id)
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    result = await generate_quiz(
        topic_title=topic.title,
        sub_topics=[s.content for s in topic.sub_topics],
        num_questions=num_questions,
    )

    # Cache quiz
    await content_service.save_content(
        session=session,
        topic_id=topic_id,
        content_type="quiz",
        content_json=result,
        model_used=None,
    )

    # Add topic context to response
    response_data = {
        **result,
        "topic_id": topic_id,
        "topic_title": topic.title,
    }
    
    return QuizResponse(**response_data)
