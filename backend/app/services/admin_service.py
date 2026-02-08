"""Admin service – user management and progress overview."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import UserProgress
from app.models.user import User
from app.models.syllabus import Topic, Unit


async def list_users(session: AsyncSession, active_only: bool = False) -> list[dict]:
    """List all users with signup info."""
    stmt = select(User).order_by(User.created_at.desc())
    if active_only:
        stmt = stmt.where(User.is_active == True)
    result = await session.execute(stmt)
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "updated_at": u.updated_at,
        }
        for u in users
    ]


async def get_user_progress(session: AsyncSession, user_id: str) -> dict | None:
    """Get a user's progress: completed count, total, and completed topics list."""
    try:
        uid = uuid.UUID(user_id)
    except (ValueError, TypeError):
        return None
    stmt = select(User).where(User.id == uid)
    result = await session.execute(stmt)
    user = result.scalars().first()
    if not user:
        return None

    total_stmt = select(func.count(Topic.id))
    total_res = await session.execute(total_stmt)
    total = total_res.scalar() or 0

    completed_stmt = (
        select(func.count(func.distinct(UserProgress.topic_id)))
        .where(UserProgress.user_id == user_id)
        .where(UserProgress.status == "completed")
    )
    completed_res = await session.execute(completed_stmt)
    completed = completed_res.scalar() or 0

    topics_stmt = (
        select(UserProgress.topic_id, Topic.title, Unit.name, UserProgress.completed_at)
        .join(Topic, UserProgress.topic_id == Topic.id)
        .join(Unit, Topic.unit_id == Unit.id)
        .where(UserProgress.user_id == user_id)
        .where(UserProgress.status == "completed")
        .order_by(UserProgress.completed_at.desc())
    )
    topics_res = await session.execute(topics_stmt)
    completed_topics = [
        {
            "topic_id": row.topic_id,
            "title": row.title,
            "unit_name": row.name,
            "completed_at": row.completed_at.isoformat() if row.completed_at else None,
        }
        for row in topics_res.all()
    ]

    return {
        "user_id": str(user.id),
        "email": user.email,
        "name": user.name,
        "completed": completed,
        "total": total,
        "completed_topics": completed_topics,
    }


async def create_user(
    session: AsyncSession,
    email: str,
    name: str,
    hashed_password: str,
) -> User:
    """Create a new user."""
    user = User(email=email, name=name, hashed_password=hashed_password)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def deactivate_user(session: AsyncSession, user_id: str) -> bool:
    """Soft delete: set is_active=False. Returns True if user existed."""
    try:
        uid = uuid.UUID(user_id)
    except (ValueError, TypeError):
        return False
    stmt = select(User).where(User.id == uid)
    result = await session.execute(stmt)
    user = result.scalars().first()
    if not user:
        return False
    user.is_active = False
    await session.commit()
    return True
