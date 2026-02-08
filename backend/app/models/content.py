"""Generated content & user progress models."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class GeneratedContent(Base):
    """LLM-generated teaching content cached per topic."""

    __tablename__ = "generated_contents"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    content_type = Column(String(50), nullable=False, default="lesson")  # lesson | quiz
    content_json = Column(JSONB, nullable=False)  # full structured response
    model_used = Column(String(100), nullable=True)
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    topic = relationship("Topic", back_populates="generated_contents")

    def __repr__(self) -> str:
        return f"<GeneratedContent id={self.id} topic_id={self.topic_id} type='{self.content_type}'>"


class UserProgress(Base):
    """Tracks what topics a user has studied."""

    __tablename__ = "user_progress"
    __table_args__ = (UniqueConstraint("user_id", "topic_id", name="uq_user_progress_user_topic"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)  # placeholder until auth
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="not_started")  # not_started | in_progress | completed
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    quiz_score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<UserProgress user='{self.user_id}' topic={self.topic_id} status='{self.status}'>"
