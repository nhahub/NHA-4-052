from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.profile import ProfileSave, ProfileResponse
from app.services.profile_service import ProfileService
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.get(
    "",
    response_model=ProfileResponse,
    summary="Get user profile and calorie calculation metrics",
)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the physical profile and calculated macros for the logged-in user."""
    profile = ProfileService.get_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete your profile initialization.",
        )
    return profile


@router.post(
    "",
    response_model=ProfileResponse,
    summary="Create or update user profile and recalculate macros",
)
async def save_profile(
    payload: ProfileSave,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit user parameters (age, weight, height, activity, goals) to calculate
    and store daily calorie and macronutrient targets.
    """
    profile = ProfileService.save_profile(db, current_user.id, payload)
    return profile
