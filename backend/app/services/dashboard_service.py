"""Dashboard service – aggregate user stats for the Learning Dashboard."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import UserProgress
from app.models.syllabus import Topic, Unit


async def get_dashboard_data(session: AsyncSession, user_id: str) -> dict:
    """Return all dashboard metrics for the user."""
    # Completed & total
    total_stmt = select(func.count(Topic.id))
    total_result = await session.execute(total_stmt)
    total = total_result.scalar() or 0

    completed_stmt = (
        select(func.count(func.distinct(UserProgress.topic_id)))
        .where(UserProgress.user_id == user_id)
        .where(UserProgress.status == "completed")
    )
    completed_result = await session.execute(completed_stmt)
    completed = completed_result.scalar() or 0

    # Streak: consecutive days with completed topics (including today, UTC)
    streak_stmt = text("""
        WITH dates AS (
            SELECT DISTINCT (completed_at AT TIME ZONE 'UTC')::date AS d
            FROM user_progress
            WHERE user_id = :uid AND status = 'completed' AND completed_at IS NOT NULL
            ORDER BY d DESC
            LIMIT 365
        ),
        with_row AS (
            SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d DESC))::int AS grp
            FROM dates
        ),
        streaked AS (
            SELECT grp, MIN(d) AS streak_start, MAX(d) AS streak_end,
                   ((NOW() AT TIME ZONE 'UTC')::date - MAX(d)) AS days_ago
            FROM with_row
            GROUP BY grp
        )
        SELECT (streak_end - streak_start + 1)::int AS streak_days
        FROM streaked
        WHERE days_ago <= 1
        ORDER BY streak_days DESC
        LIMIT 1
    """)
    try:
        streak_result = await session.execute(streak_stmt, {"uid": user_id})
        row = streak_result.fetchone()
        streak = row[0] if row else 0
    except Exception:
        streak = 0

    # Topics this month (for "study" metric – estimate ~25 min per topic)
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    topics_this_month_stmt = (
        select(func.count(func.distinct(UserProgress.topic_id)))
        .where(UserProgress.user_id == user_id)
        .where(UserProgress.status == "completed")
        .where(UserProgress.completed_at >= month_start)
    )
    topics_month_result = await session.execute(topics_this_month_stmt)
    topics_this_month = topics_month_result.scalar() or 0
    study_hours = round(topics_this_month * 25 / 60)  # ~25 min per topic

    # Avg quiz score (last 30 days, quiz_score stored as 0–100 percentage)
    thirty_days_ago = now - timedelta(days=30)
    avg_score_stmt = (
        select(func.avg(UserProgress.quiz_score))
        .where(UserProgress.user_id == user_id)
        .where(UserProgress.status == "completed")
        .where(UserProgress.completed_at >= thirty_days_ago)
        .where(UserProgress.quiz_score.isnot(None))
    )
    avg_result = await session.execute(avg_score_stmt)
    avg_score_val = avg_result.scalar() or 0
    avg_quiz_score = round(float(avg_score_val)) if avg_score_val else 0

    # Due for review: completed 1+ days ago, oldest first
    one_day_ago = now - timedelta(days=1)
    review_stmt = (
        select(UserProgress.topic_id, Topic.title, Unit.name)
        .join(Topic, UserProgress.topic_id == Topic.id)
        .join(Unit, Topic.unit_id == Unit.id)
        .where(UserProgress.user_id == user_id)
        .where(UserProgress.status == "completed")
        .where(UserProgress.completed_at < one_day_ago)
        .order_by(UserProgress.completed_at.asc())
        .limit(10)
    )
    review_result = await session.execute(review_stmt)
    due_for_review = [
        {"topic_id": r.topic_id, "title": f"{r.name} – {r.title}"}
        for r in review_result.all()
    ]

    # This week: Mon–Sun, topics completed per day
    # Start of current week (Monday)
    today = now.date()
    days_since_monday = today.weekday()
    week_start = today - timedelta(days=days_since_monday)
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly = []
    for i in range(7):
        d = week_start + timedelta(days=i)
        d_start = datetime(d.year, d.month, d.day, 0, 0, 0, tzinfo=timezone.utc)
        d_end = d_start + timedelta(days=1)
        count_stmt = (
            select(func.count(func.distinct(UserProgress.topic_id)))
            .where(UserProgress.user_id == user_id)
            .where(UserProgress.status == "completed")
            .where(UserProgress.completed_at >= d_start)
            .where(UserProgress.completed_at < d_end)
        )
        count_result = await session.execute(count_stmt)
        cnt = count_result.scalar() or 0
        weekly.append({
            "day": day_names[i],
            "topics": cnt,
            "mins": cnt * 25,  # ~25 min per topic
        })

    # Personal best streak (max streak historically)
    try:
        best_stmt = text("""
            WITH dates AS (
                SELECT DISTINCT (completed_at AT TIME ZONE 'UTC')::date AS d
                FROM user_progress
                WHERE user_id = :uid AND status = 'completed' AND completed_at IS NOT NULL
                ORDER BY d DESC
            ),
            with_row AS (
                SELECT d, d - (ROW_NUMBER() OVER (ORDER BY d DESC))::int AS grp
                FROM dates
            )
            SELECT COALESCE(MAX((streak_end - streak_start + 1)), 0)::int
            FROM (
                SELECT grp, MIN(d) AS streak_start, MAX(d) AS streak_end
                FROM with_row GROUP BY grp
            ) s
        """)
        best_result = await session.execute(best_stmt, {"uid": user_id})
        best_row = best_result.fetchone()
        personal_best = best_row[0] if best_row else 0
    except Exception:
        personal_best = 0

    return {
        "completed": completed,
        "total": total,
        "streak": streak,
        "personal_best_streak": personal_best,
        "study_hours": study_hours,
        "topics_this_month": topics_this_month,
        "avg_quiz_score": avg_quiz_score,
        "due_for_review": due_for_review,
        "weekly_activity": weekly,
    }
