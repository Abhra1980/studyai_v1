"""Pydantic schemas for syllabus API responses."""

from pydantic import BaseModel


# ── Sub-Topic ─────────────────────────────────────────────────────
class SubTopicOut(BaseModel):
    id: int
    content: str

    model_config = {"from_attributes": True}


# ── Topic ─────────────────────────────────────────────────────────
class TopicBrief(BaseModel):
    """Compact topic without sub-topics (used in listings)."""
    id: int
    number: str
    title: str

    model_config = {"from_attributes": True}


class TopicDetail(BaseModel):
    """Full topic with all sub-topics."""
    id: int
    number: str
    title: str
    unit_name: str
    main_topic_name: str
    sub_topics: list[SubTopicOut]

    model_config = {"from_attributes": True}


# ── Unit ──────────────────────────────────────────────────────────
class UnitBrief(BaseModel):
    id: int
    name: str
    topic_count: int

    model_config = {"from_attributes": True}


class UnitDetail(BaseModel):
    id: int
    name: str
    topics: list[TopicBrief]

    model_config = {"from_attributes": True}


# ── Main Topic ────────────────────────────────────────────────────
class MainTopicBrief(BaseModel):
    id: int
    name: str
    unit_count: int
    topic_count: int

    model_config = {"from_attributes": True}


class MainTopicDetail(BaseModel):
    id: int
    name: str
    units: list[UnitDetail]

    model_config = {"from_attributes": True}


# ── Part Progress (for Curriculum grid) ────────────────────────────
class PartProgressItem(BaseModel):
    part_id: int
    completed: int
    total: int


# ── Search ────────────────────────────────────────────────────────
class SearchResult(BaseModel):
    topic_id: int
    topic_number: str
    topic_title: str
    unit_name: str
    main_topic_name: str
    matched_sub_topic: str | None = None
