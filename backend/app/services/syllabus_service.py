"""Syllabus data-access service – queries the normalised Postgres tables."""

import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.content import UserProgress
from app.models.syllabus import MainTopic, SubTopic, Topic, Unit
from app.schemas.syllabus import (
    MainTopicBrief,
    MainTopicDetail,
    PartProgressItem,
    SearchResult,
    TopicBrief,
    TopicDetail,
    SubTopicOut,
    UnitBrief,
    UnitDetail,
)

logger = logging.getLogger(__name__)


async def list_main_topics(session: AsyncSession) -> list[MainTopicBrief]:
    """Return all main topics with unit & topic counts."""
    stmt = (
        select(
            MainTopic.id,
            MainTopic.name,
            func.count(Unit.id.distinct()).label("unit_count"),
            func.count(Topic.id.distinct()).label("topic_count"),
        )
        .outerjoin(Unit, Unit.main_topic_id == MainTopic.id)
        .outerjoin(Topic, Topic.unit_id == Unit.id)
        .group_by(MainTopic.id, MainTopic.name)
        .order_by(MainTopic.id)
    )
    result = await session.execute(stmt)
    return [
        MainTopicBrief(id=r.id, name=r.name, unit_count=r.unit_count, topic_count=r.topic_count)
        for r in result.all()
    ]


async def get_main_topic_detail(session: AsyncSession, main_topic_id: int) -> MainTopicDetail | None:
    """Return a single main topic with all units and their topics."""
    stmt = (
        select(MainTopic)
        .options(selectinload(MainTopic.units).selectinload(Unit.topics))
        .where(MainTopic.id == main_topic_id)
    )
    result = await session.execute(stmt)
    mt = result.scalars().first()
    if mt is None:
        return None

    return MainTopicDetail(
        id=mt.id,
        name=mt.name,
        units=[
            UnitDetail(
                id=u.id,
                name=u.name,
                topics=[TopicBrief(id=t.id, number=t.number, title=t.title) for t in u.topics],
            )
            for u in mt.units
        ],
    )


async def get_topic_detail(session: AsyncSession, topic_id: int) -> TopicDetail | None:
    """Return a topic with full sub-topic list + parent info."""
    stmt = (
        select(Topic)
        .options(
            selectinload(Topic.sub_topics),
            selectinload(Topic.unit).selectinload(Unit.main_topic),
        )
        .where(Topic.id == topic_id)
    )
    result = await session.execute(stmt)
    topic = result.scalars().first()
    if topic is None:
        return None

    return TopicDetail(
        id=topic.id,
        number=topic.number,
        title=topic.title,
        unit_name=topic.unit.name,
        main_topic_name=topic.unit.main_topic.name,
        sub_topics=[SubTopicOut(id=s.id, content=s.content) for s in topic.sub_topics],
    )


async def search_topics(session: AsyncSession, query: str, limit: int = 20) -> list[SearchResult]:
    """Search topics and sub-topics by keyword (case-insensitive ILIKE)."""
    pattern = f"%{query}%"

    # Search in topic titles
    topic_stmt = (
        select(Topic, Unit, MainTopic)
        .join(Unit, Topic.unit_id == Unit.id)
        .join(MainTopic, Unit.main_topic_id == MainTopic.id)
        .where(Topic.title.ilike(pattern))
        .limit(limit)
    )
    topic_result = await session.execute(topic_stmt)
    results = [
        SearchResult(
            topic_id=t.id,
            topic_number=t.number,
            topic_title=t.title,
            unit_name=u.name,
            main_topic_name=mt.name,
        )
        for t, u, mt in topic_result.all()
    ]

    # Also search in sub-topics if we haven't hit the limit
    remaining = limit - len(results)
    if remaining > 0:
        sub_stmt = (
            select(SubTopic, Topic, Unit, MainTopic)
            .join(Topic, SubTopic.topic_id == Topic.id)
            .join(Unit, Topic.unit_id == Unit.id)
            .join(MainTopic, Unit.main_topic_id == MainTopic.id)
            .where(SubTopic.content.ilike(pattern))
            .limit(remaining)
        )
        sub_result = await session.execute(sub_stmt)
        seen_topic_ids = {r.topic_id for r in results}
        for st, t, u, mt in sub_result.all():
            if t.id not in seen_topic_ids:
                results.append(
                    SearchResult(
                        topic_id=t.id,
                        topic_number=t.number,
                        topic_title=t.title,
                        unit_name=u.name,
                        main_topic_name=mt.name,
                        matched_sub_topic=st.content,
                    )
                )
                seen_topic_ids.add(t.id)

    return results


async def get_part_progress(session: AsyncSession, user_id: str) -> list[PartProgressItem]:
    """Return completed/total per part (MainTopic) for the given user."""
    parts = await list_main_topics(session)
    result = []
    for p in parts:
        topic_ids_subq = (
            select(Topic.id)
            .join(Unit, Topic.unit_id == Unit.id)
            .where(Unit.main_topic_id == p.id)
        )
        completed_stmt = (
            select(func.count(UserProgress.id))
            .where(UserProgress.user_id == user_id)
            .where(UserProgress.status == "completed")
            .where(UserProgress.topic_id.in_(topic_ids_subq))
        )
        completed_res = await session.execute(completed_stmt)
        completed = completed_res.scalar() or 0
        total = getattr(p, "topic_count", 0) or 0
        result.append(PartProgressItem(part_id=p.id, completed=completed, total=total))
    return result
