from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.meal import MealCreate, MealUpdate, MealResponse, DailySummary, MealDayResponse
from app.services.meal_service import MealService

router = APIRouter()


@router.post("", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def create_meal(
    payload: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a new meal."""
    return MealService.create_meal(db, current_user.id, payload)


@router.get("", response_model=MealDayResponse)
def get_meals(
    target_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all meals and the daily summary for a specific date."""
    meals = MealService.get_meals_by_date(db, current_user.id, target_date)
    summary = MealService.get_daily_summary(db, current_user.id, target_date)
    
    return {
        "summary": summary,
        "meals": meals
    }


@router.put("/{meal_id}", response_model=MealResponse)
def update_meal(
    meal_id: int,
    payload: MealUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing meal."""
    meal = MealService.get_meal_by_id(db, meal_id, current_user.id)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    return MealService.update_meal(db, meal, payload)


@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an existing meal."""
    meal = MealService.get_meal_by_id(db, meal_id, current_user.id)
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    MealService.delete_meal(db, meal)
    return None
