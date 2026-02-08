"""Load AI_ML_Syllabus_Structured.csv into normalised Postgres tables on startup."""

import logging
import re

import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.models.syllabus import MainTopic, SubTopic, Topic, Unit

logger = logging.getLogger(__name__)


def _parse_topic_number(title: str) -> tuple[str, str]:
    """Extract number and clean title from strings like '1.1 Meaning, Scope & Role'."""
    m = re.match(r"^(\d+\.\d+)\s+(.*)", title)
    if m:
        return m.group(1), m.group(2)
    return "", title


async def seed_from_csv() -> None:
    """Read the CSV and insert data if tables are empty.

    Idempotent – skips if main_topics table already has rows.
    Creates its own session so it can be called from lifespan.
    """
    async with async_session() as session:
        await _do_seed(session)


async def _do_seed(session: AsyncSession) -> None:
    """Internal seeding logic – fully idempotent."""
    # Check if data already exists
    result = await session.execute(select(MainTopic).limit(1))
    if result.scalars().first() is not None:
        logger.info("Database already seeded – skipping CSV import.")
        return

    csv_path = settings.CSV_PATH_RESOLVED
    logger.info("Seeding database from %s …", csv_path)

    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    logger.info("CSV loaded: %d rows, columns: %s", len(df), list(df.columns))

    # Caches to avoid duplicate inserts
    main_topic_cache: dict[str, MainTopic] = {}
    unit_cache: dict[str, Unit] = {}
    topic_cache: dict[str, Topic] = {}

    rows_inserted = 0

    for _, row in df.iterrows():
        mt_name = str(row["Main_Topic"]).strip()
        unit_name = str(row["Unit"]).strip()
        topic_title = str(row["Topic_Title"]).strip()
        sub_topic_text = str(row["Sub_Topic"]).strip()

        # ── Main Topic (get or create) ────────────────────────────
        if mt_name not in main_topic_cache:
            existing = (await session.execute(
                select(MainTopic).where(MainTopic.name == mt_name)
            )).scalars().first()
            if existing:
                main_topic_cache[mt_name] = existing
            else:
                mt = MainTopic(name=mt_name)
                session.add(mt)
                await session.flush()
                main_topic_cache[mt_name] = mt

        # ── Unit (get or create) ──────────────────────────────────
        unit_key = f"{mt_name}::{unit_name}"
        if unit_key not in unit_cache:
            existing = (await session.execute(
                select(Unit).where(
                    Unit.name == unit_name,
                    Unit.main_topic_id == main_topic_cache[mt_name].id,
                )
            )).scalars().first()
            if existing:
                unit_cache[unit_key] = existing
            else:
                unit = Unit(name=unit_name, main_topic_id=main_topic_cache[mt_name].id)
                session.add(unit)
                await session.flush()
                unit_cache[unit_key] = unit

        # ── Topic (get or create) ─────────────────────────────────
        topic_key = f"{unit_key}::{topic_title}"
        if topic_key not in topic_cache:
            existing = (await session.execute(
                select(Topic).where(
                    Topic.title == topic_title,
                    Topic.unit_id == unit_cache[unit_key].id,
                )
            )).scalars().first()
            if existing:
                topic_cache[topic_key] = existing
            else:
                number, title = _parse_topic_number(topic_title)
                topic = Topic(
                    number=number,
                    title=topic_title,
                    unit_id=unit_cache[unit_key].id,
                )
                session.add(topic)
                await session.flush()
                topic_cache[topic_key] = topic

        # ── Sub-Topic ─────────────────────────────────────────────
        sub = SubTopic(
            content=sub_topic_text,
            topic_id=topic_cache[topic_key].id,
        )
        session.add(sub)
        rows_inserted += 1

    await session.commit()
    logger.info(
        "Seeding complete: %d main_topics, %d units, %d topics, %d sub_topics",
        len(main_topic_cache),
        len(unit_cache),
        len(topic_cache),
        rows_inserted,
    )
