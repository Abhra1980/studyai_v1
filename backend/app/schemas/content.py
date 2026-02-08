"""Pydantic schemas for content & learning endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


# ── Learn Request / Response ──────────────────────────────────────
class LearnRequest(BaseModel):
    """Optional user context for personalised teaching."""
    user_level: str = "beginner"  # beginner | intermediate | advanced
    focus_areas: list[str] = []
    include_code: bool = True
    include_quiz: bool = True
    sub_topic_id: int | None = None  # When set, focus generation on this specific sub-topic only


class LessonContent(BaseModel):
    """Structured LLM-generated lesson."""
    topic_id: int
    topic_title: str
    explanation: str
    key_points: list[str] = []
    code_examples: list[dict[str, str]] = []  # [{language, code, explanation}]
    math_formulas: list[str] = []
    quiz: list[dict[str, Any]] = []  # [{question, options, correct, explanation}]
    further_reading: list[str] = []
    model_used: str | None = None


# ── More Context (follow-up) ───────────────────────────────────────
class MoreContextRequest(BaseModel):
    """User's follow-up question to generate additional context."""
    question: str
    existing_explanation: str | None = None  # Pass from frontend if available


class MoreContextResponse(BaseModel):
    """Additional context generated from user's follow-up question."""
    explanation: str
    code_examples: list[dict[str, str]] = []


# ── Quiz ──────────────────────────────────────────────────────────
class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str


class QuizResponse(BaseModel):
    topic_id: int
    topic_title: str
    questions: list[QuizQuestion]
    model_used: str | None = None


# ── Cached Content ────────────────────────────────────────────────
class CachedContentOut(BaseModel):
    id: int
    topic_id: int
    content_type: str
    content_json: dict[str, Any]
    model_used: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard ──────────────────────────────────────────────────────
class DueForReviewItem(BaseModel):
    topic_id: int
    title: str


class WeeklyDay(BaseModel):
    day: str
    topics: int
    mins: int


class DashboardData(BaseModel):
    completed: int
    total: int
    streak: int
    personal_best_streak: int
    study_hours: int
    topics_this_month: int
    avg_quiz_score: int
    due_for_review: list[DueForReviewItem]
    weekly_activity: list[WeeklyDay]


# ── Progress Summary (for GUI) ─────────────────────────────────────
class ProgressSummary(BaseModel):
    """Completed vs total topics for the current user."""
    completed: int
    total: int


class MarkCompleteRequest(BaseModel):
    """Optional body when marking a topic complete."""
    quiz_score: int | None = None


# ── Progress ──────────────────────────────────────────────────────
class ProgressUpdate(BaseModel):
    status: str  # not_started | in_progress | completed
    quiz_score: int | None = None


class ProgressOut(BaseModel):
    topic_id: int
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    quiz_score: int | None

    model_config = {"from_attributes": True}
