"""Dashboard endpoints – Learning Dashboard data."""

from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user_id
from app.schemas.content import DashboardData
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardData)
async def get_dashboard(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_db),
):
    """Get full dashboard data for the current user."""
    data = await dashboard_service.get_dashboard_data(session, user_id)
    return DashboardData(**data)
