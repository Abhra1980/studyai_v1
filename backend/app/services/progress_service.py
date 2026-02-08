"""User progress service – track topic completion per user."""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import UserProgress
from app.models.syllabus import Topic


async def get_progress_counts(session: AsyncSession, user_id: str) -> tuple[int, int]:
    """Return (completed_count, total_topics) for the user."""
    # Total topics in syllabus
    total_stmt = select(func.count(Topic.id))
    total_result = await session.execute(total_stmt)
    total = total_result.scalar() or 0

    # Completed by this user (count distinct topics)
    completed_stmt = (
        select(func.count(func.distinct(UserProgress.topic_id)))
        .where(UserProgress.user_id == user_id)
        .where(UserProgress.status == "completed")
    )
    completed_result = await session.execute(completed_stmt)
    completed = completed_result.scalar() or 0

    return (completed, total)


async def mark_topic_completed(
    session: AsyncSession,
    user_id: str,
    topic_id: int,
    quiz_score: int | None = None,
) -> None:
    """Mark a topic as completed for the user. Upserts to avoid duplicates."""
    now = datetime.now(timezone.utc)
    # Check if already exists
    stmt = select(UserProgress).where(
        UserProgress.user_id == user_id,
        UserProgress.topic_id == topic_id,
    )
    result = await session.execute(stmt)
    existing = result.scalars().first()

    if existing:
        existing.status = "completed"
        existing.completed_at = now
        existing.quiz_score = quiz_score
    else:
        session.add(
            UserProgress(
                user_id=user_id,
                topic_id=topic_id,
                status="completed",
                started_at=now,
                completed_at=now,
                quiz_score=quiz_score,
            )
        )
    await session.commit()
