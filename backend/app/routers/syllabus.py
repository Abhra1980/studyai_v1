"""Syllabus REST endpoints – browse the curriculum hierarchy."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user_id
from app.schemas.syllabus import MainTopicBrief, MainTopicDetail, PartProgressItem, SearchResult, TopicDetail
from app.services import syllabus_service

router = APIRouter(prefix="/syllabus", tags=["Syllabus"])


@router.get("/part-progress", response_model=list[PartProgressItem])
async def get_part_progress(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Return completed/total per part for the current user (for Curriculum grid)."""
    return await syllabus_service.get_part_progress(session, user_id)


@router.get("", response_model=list[MainTopicBrief])
async def list_all_main_topics(session: AsyncSession = Depends(get_db)):
    """Return all 14 main topics with unit & topic counts."""
    return await syllabus_service.list_main_topics(session)


@router.get("/{main_topic_id}", response_model=MainTopicDetail)
async def get_main_topic(main_topic_id: int, session: AsyncSession = Depends(get_db)):
    """Return a main topic with all its units and topics."""
    result = await syllabus_service.get_main_topic_detail(session, main_topic_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Main topic not found")
    return result


@router.get("/topics/{topic_id}", response_model=TopicDetail)
async def get_topic(topic_id: int, session: AsyncSession = Depends(get_db)):
    """Return a single topic with all sub-topics."""
    result = await syllabus_service.get_topic_detail(session, topic_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return result


@router.get("/search/", response_model=list[SearchResult])
async def search(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=500),
    session: AsyncSession = Depends(get_db),
):
    """Search topics and sub-topics by keyword."""
    return await syllabus_service.search_topics(session, q, limit)
