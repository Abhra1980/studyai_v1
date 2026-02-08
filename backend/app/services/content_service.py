"""Content service – save & retrieve LLM-generated content from Postgres."""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import GeneratedContent

logger = logging.getLogger(__name__)


async def save_content(
    session: AsyncSession,
    topic_id: int,
    content_type: str,
    content_json: dict[str, Any],
    model_used: str | None = None,
) -> GeneratedContent:
    """Persist generated content to the database."""
    record = GeneratedContent(
        topic_id=topic_id,
        content_type=content_type,
        content_json=content_json,
        model_used=model_used,
    )
    session.add(record)
    await session.commit()
    await session.refresh(record)
    logger.info("Saved %s content for topic_id=%d", content_type, topic_id)
    return record


async def get_cached_content(
    session: AsyncSession,
    topic_id: int,
    content_type: str = "lesson",
) -> GeneratedContent | None:
    """Retrieve the most recent cached content for a topic."""
    stmt = (
        select(GeneratedContent)
        .where(
            GeneratedContent.topic_id == topic_id,
            GeneratedContent.content_type == content_type,
        )
        .order_by(GeneratedContent.created_at.desc())
        .limit(1)
    )
    result = await session.execute(stmt)
    return result.scalars().first()


async def list_content_for_topic(
    session: AsyncSession,
    topic_id: int,
) -> list[GeneratedContent]:
    """Return all generated content for a topic."""
    stmt = (
        select(GeneratedContent)
        .where(GeneratedContent.topic_id == topic_id)
        .order_by(GeneratedContent.created_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
