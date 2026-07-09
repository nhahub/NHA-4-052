from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict

MealType = Literal["Breakfast", "Lunch", "Dinner", "Snack"]


class MealBase(BaseModel):
    """Base fields for a meal entry."""
    food_name: str = Field(..., description="Name of the food item")
    calories: int = Field(..., ge=0, description="Calories (kcal)")
    protein: float = Field(0.0, ge=0, description="Protein (g)")
    carbs: float = Field(0.0, ge=0, description="Carbohydrates (g)")
    fat: float = Field(0.0, ge=0, description="Fat (g)")
    meal_type: MealType = Field(..., description="Type of meal")
    meal_date: date = Field(..., description="Date of the meal")
    food_category: Optional[str] = Field(None, description="Food category (e.g. Dairy, Protein)")
    is_ai_predicted: bool = Field(False, description="Whether the category was predicted by AI")


class MealCreate(MealBase):
    """Schema for creating a new meal entry."""
    pass


class MealUpdate(BaseModel):
    """Schema for updating an existing meal entry (all fields optional)."""
    food_name: Optional[str] = Field(None, description="Name of the food item")
    calories: Optional[int] = Field(None, ge=0, description="Calories (kcal)")
    protein: Optional[float] = Field(None, ge=0, description="Protein (g)")
    carbs: Optional[float] = Field(None, ge=0, description="Carbohydrates (g)")
    fat: Optional[float] = Field(None, ge=0, description="Fat (g)")
    meal_type: Optional[MealType] = Field(None, description="Type of meal")
    meal_date: Optional[date] = Field(None, description="Date of the meal")
    food_category: Optional[str] = Field(None, description="Food category")
    is_ai_predicted: Optional[bool] = Field(None, description="Whether the category was predicted by AI")


class MealResponse(MealBase):
    """Schema for meal response, including DB-generated IDs."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int


class DailySummary(BaseModel):
    """Schema for daily nutritional summary."""
    date: date
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    target_calories: Optional[float] = None
    target_protein: Optional[float] = None
    target_carbs: Optional[float] = None
    target_fat: Optional[float] = None
    remaining_calories: Optional[float] = None


class MealDayResponse(BaseModel):
    """Schema for the get meals by date response."""
    summary: DailySummary
    meals: list[MealResponse]
