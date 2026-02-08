"""Admin REST endpoints – user management (admin only)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_admin_user
from app.models.user import User
from app.schemas.admin import AdminCreateUserRequest, AdminUserOut, AdminUserProgressOut
from app.services.admin_service import (
    create_user,
    deactivate_user,
    get_user_progress,
    list_users,
)
from app.utils.jwt_utils import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[AdminUserOut])
async def admin_list_users(
    _admin_id: str = Depends(get_admin_user),
    active_only: bool = False,
    session: AsyncSession = Depends(get_db),
):
    """List all users. Admin only (virabhra@yahoo.com)."""
    users = await list_users(session, active_only=active_only)
    return [AdminUserOut(**u) for u in users]


@router.get("/users/count")
async def admin_user_count(
    _admin_id: str = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db),
):
    """Get total signed-up user count."""
    users = await list_users(session, active_only=False)
    return {"total": len(users), "active": sum(1 for u in users if u["is_active"])}


@router.get("/users/{user_id}/progress", response_model=AdminUserProgressOut)
async def admin_get_user_progress(
    user_id: str,
    _admin_id: str = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db),
):
    """Get a specific user's progress."""
    progress = await get_user_progress(session, user_id)
    if not progress:
        raise HTTPException(status_code=404, detail="User not found")
    return AdminUserProgressOut(**progress)


@router.post("/users", response_model=AdminUserOut)
async def admin_create_user(
    body: AdminCreateUserRequest,
    _admin_id: str = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db),
):
    """Create a new user. Admin only."""
    stmt = select(User).where(User.email == body.email)
    result = await session.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(body.password)
    user = await create_user(session, body.email, body.name, hashed)
    return AdminUserOut(
        id=str(user.id),
        email=user.email,
        name=user.name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.delete("/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    _admin_id: str = Depends(get_admin_user),
    session: AsyncSession = Depends(get_db),
):
    """Deactivate a user (soft delete). Admin only."""
    if user_id == _admin_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    ok = await deactivate_user(session, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deactivated"}
