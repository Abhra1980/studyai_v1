"""Learn endpoints – generate lessons via LLM (streaming + non-streaming)."""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.content import CachedContentOut, LearnRequest, LessonContent, MoreContextRequest, MoreContextResponse
from app.services import syllabus_service, content_service
from app.services.llm_service import generate_lesson, generate_more_context, stream_lesson

router = APIRouter(prefix="/learn", tags=["Learn"])


@router.post("/{topic_id}", response_model=LessonContent)
async def teach_topic(
    topic_id: int,
    body: LearnRequest,
    session: AsyncSession = Depends(get_db),
):
    """Generate a full lesson for a topic (non-streaming)."""
    topic = await syllabus_service.get_topic_detail(session, topic_id)
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    sub_topics_to_use = [s.content for s in topic.sub_topics]
    if body.sub_topic_id is not None:
        focused = next((s for s in topic.sub_topics if s.id == body.sub_topic_id), None)
        if focused:
            sub_topics_to_use = [focused.content]

    result = await generate_lesson(
        main_topic=topic.main_topic_name,
        unit_name=topic.unit_name,
        topic_title=topic.title,
        sub_topics=sub_topics_to_use,
        user_level=body.user_level,
        focus_areas=body.focus_areas,
        include_code=body.include_code,
        include_quiz=body.include_quiz,
    )

    # Cache the result
    await content_service.save_content(
        session=session,
        topic_id=topic_id,
        content_type="lesson",
        content_json=result,
        model_used=None,
    )

    # Add topic context to response
    response_data = {
        **result,
        "topic_id": topic_id,
        "topic_title": topic.title,
        # Map LLM response fields to schema fields
        "key_points": result.get("key_concepts", []),
        "code_examples": result.get("code_examples", []),
        "further_reading": result.get("resources", result.get("further_reading", [])),
    }
    
    return LessonContent(**response_data)


@router.post("/{topic_id}/more-context", response_model=MoreContextResponse)
async def generate_more_context_endpoint(
    topic_id: int,
    body: MoreContextRequest,
    session: AsyncSession = Depends(get_db),
):
    """Generate additional context based on user's follow-up question (uses existing lesson)."""
    if not body.question or not body.question.strip():
        raise HTTPException(status_code=400, detail="question is required")
    topic = await syllabus_service.get_topic_detail(session, topic_id)
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    existing_explanation = body.existing_explanation
    if not existing_explanation:
        cached = await content_service.list_content_for_topic(session, topic_id)
        if cached:
            latest = max(cached, key=lambda c: c.created_at)
            existing_explanation = latest.content_json.get("explanation", "")
    if not existing_explanation:
        existing_explanation = f"Topic: {topic.title}. Sub-topics: {', '.join(s.content for s in topic.sub_topics)}"
    result = await generate_more_context(
        topic_title=topic.title,
        existing_explanation=existing_explanation,
        user_question=body.question.strip(),
    )
    return MoreContextResponse(explanation=result["explanation"], code_examples=result.get("code_examples", []))


@router.get("/{topic_id}/stream")
async def stream_teach_topic(
    topic_id: int,
    user_level: str = Query("intermediate", description="beginner/intermediate/advanced"),
    session: AsyncSession = Depends(get_db),
):
    """Stream a lesson via Server-Sent Events."""
    topic = await syllabus_service.get_topic_detail(session, topic_id)
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    async def event_generator():
        async for chunk in stream_lesson(
            main_topic=topic.main_topic_name,
            unit_name=topic.unit_name,
            topic_title=topic.title,
            sub_topics=[s.content for s in topic.sub_topics],
            user_level=user_level,
        ):
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/{topic_id}/cached", response_model=list[CachedContentOut])
async def get_cached_lessons(
    topic_id: int,
    session: AsyncSession = Depends(get_db),
):
    """Return all previously-generated content for a topic."""
    return await content_service.list_content_for_topic(session, topic_id)
