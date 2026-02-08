"""Admin API schemas."""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminUserOut(BaseModel):
    """User list item for admin."""
    id: str
    email: str
    name: str
    is_active: bool
    created_at: datetime | None
    updated_at: datetime | None = None


class AdminCreateUserRequest(BaseModel):
    """Request to create a new user (admin only)."""
    email: EmailStr
    name: str
    password: str


class AdminUserProgressOut(BaseModel):
    """User progress for admin view."""
    user_id: str
    email: str
    name: str
    completed: int
    total: int
    completed_topics: list[dict]  # [{topic_id, title, unit_name, completed_at}]
