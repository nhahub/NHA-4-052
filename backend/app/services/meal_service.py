from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.meal import Meal
from app.models.user_profile import UserProfile
from app.schemas.meal import MealCreate, MealUpdate, DailySummary


class MealService:
    """Service layer for meal tracking and daily summaries."""

    @staticmethod
    def create_meal(db: Session, user_id: int, payload: MealCreate) -> Meal:
        meal = Meal(
            user_id=user_id,
            **payload.model_dump()
        )
        db.add(meal)
        db.commit()
        db.refresh(meal)
        return meal

    @staticmethod
    def get_meals_by_date(db: Session, user_id: int, target_date: date) -> list[Meal]:
        return db.query(Meal).filter(
            Meal.user_id == user_id,
            Meal.meal_date == target_date
        ).all()

    @staticmethod
    def get_meal_by_id(db: Session, meal_id: int, user_id: int) -> Meal | None:
        return db.query(Meal).filter(
            Meal.id == meal_id,
            Meal.user_id == user_id
        ).first()

    @staticmethod
    def update_meal(db: Session, meal: Meal, payload: MealUpdate) -> Meal:
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(meal, key, value)
        db.commit()
        db.refresh(meal)
        return meal

    @staticmethod
    def delete_meal(db: Session, meal: Meal) -> None:
        db.delete(meal)
        db.commit()

    @staticmethod
    def get_daily_summary(db: Session, user_id: int, target_date: date) -> DailySummary:
        # Get all meals for the day
        meals = MealService.get_meals_by_date(db, user_id, target_date)
        
        # Calculate totals
        total_cals = sum(m.calories for m in meals)
        total_prot = sum(m.protein for m in meals)
        total_carbs = sum(m.carbs for m in meals)
        total_fat = sum(m.fat for m in meals)

        summary = DailySummary(
            date=target_date,
            total_calories=total_cals,
            total_protein=round(total_prot, 1),
            total_carbs=round(total_carbs, 1),
            total_fat=round(total_fat, 1)
        )

        # Get user profile to calculate targets and remaining
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile:
            summary.target_calories = profile.daily_calorie_target
            summary.target_protein = profile.protein_target_g
            summary.target_carbs = profile.carb_target_g
            summary.target_fat = profile.fat_target_g
            summary.remaining_calories = profile.daily_calorie_target - total_cals
            
        return summary
