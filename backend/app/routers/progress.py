"""Progress endpoints – user completion tracking."""

from fastapi import APIRouter, Body, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user_id
from app.schemas.content import MarkCompleteRequest, ProgressSummary
from app.services import progress_service

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("", response_model=ProgressSummary)
async def get_my_progress(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Get completed/total topic count for the current user."""
    completed, total = await progress_service.get_progress_counts(session, user_id)
    return ProgressSummary(completed=completed, total=total)


@router.post("/{topic_id}/complete")
async def mark_topic_complete(
    topic_id: int,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
    body: MarkCompleteRequest | None = Body(default=None),
):
    """Mark a topic as completed for the current user. Call after quiz submission."""
    quiz_score = body.quiz_score if body else None
    await progress_service.mark_topic_completed(
        session, user_id, topic_id, quiz_score=quiz_score
    )
    return {"ok": True, "topic_id": topic_id}
