"""Syllabus database models – normalised from the CSV hierarchy."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class MainTopic(Base):
    """Top-level category – e.g. 'STATISTICS FOR AI & MACHINE LEARNING'."""

    __tablename__ = "main_topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)

    # relationships
    units = relationship("Unit", back_populates="main_topic", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<MainTopic id={self.id} name='{self.name}'>"


class Unit(Base):
    """Module / Unit inside a main topic – e.g. 'Unit 1: Statistical Foundations'."""

    __tablename__ = "units"
    __table_args__ = (
        UniqueConstraint("name", "main_topic_id", name="uq_unit_name_main_topic"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    main_topic_id = Column(Integer, ForeignKey("main_topics.id"), nullable=False)

    # relationships
    main_topic = relationship("MainTopic", back_populates="units")
    topics = relationship("Topic", back_populates="unit", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Unit id={self.id} name='{self.name}'>"


class Topic(Base):
    """Numbered topic – e.g. '1.1 Meaning, Scope & Role of Statistics'."""

    __tablename__ = "topics"
    __table_args__ = (
        UniqueConstraint("title", "unit_id", name="uq_topic_title_unit"),
    )

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(20), nullable=False, index=True)  # e.g. "1.1"
    title = Column(String(500), nullable=False)                # full title text
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)

    # relationships
    unit = relationship("Unit", back_populates="topics")
    sub_topics = relationship("SubTopic", back_populates="topic", cascade="all, delete-orphan")
    generated_contents = relationship("GeneratedContent", back_populates="topic")

    def __repr__(self) -> str:
        return f"<Topic id={self.id} number='{self.number}' title='{self.title[:40]}'>"


class SubTopic(Base):
    """Individual bullet item under a topic."""

    __tablename__ = "sub_topics"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)

    # relationships
    topic = relationship("Topic", back_populates="sub_topics")

    def __repr__(self) -> str:
        return f"<SubTopic id={self.id} content='{self.content[:40]}'>"
