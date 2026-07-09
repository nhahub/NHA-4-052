"""AI Assistant Pydantic schemas."""

from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


# ── Request schemas ──────────────────────────────────────────────────

class MealSuggestionRequest(BaseModel):
    """Schema for ingredient-to-meal suggestions request."""

    ingredients: list[str] = Field(
        ..., min_length=1, max_length=20, description="List of available ingredients"
    )
    meal_type: Optional[Literal["Breakfast", "Lunch", "Dinner", "Snack"]] = Field(
        None, description="Optional meal type filter"
    )
    dietary_preferences: Optional[list[str]] = Field(
        None, description="Dietary preferences (e.g., vegetarian, low-carb, gluten-free)"
    )
    max_calories: Optional[int] = Field(
        None, ge=50, le=2000, description="Maximum calories per meal suggestion"
    )


class ImageAnalysisRequest(BaseModel):
    """Schema for food image analysis request (metadata only; image is multipart)."""

    meal_type: Optional[Literal["Breakfast", "Lunch", "Dinner", "Snack"]] = Field(
        None, description="Optional meal type context"
    )


# ── Response schemas ─────────────────────────────────────────────────

class MealSuggestion(BaseModel):
    """Schema for a single meal suggestion."""

    name: str = Field(..., description="Name of the suggested meal")
    description: str = Field(..., description="Brief description and cooking idea")
    ingredients_used: list[str] = Field(..., description="Ingredients from user's list used in this meal")
    additional_ingredients: list[str] = Field(
        default_factory=list, description="Additional ingredients needed"
    )
    estimated_calories: int = Field(..., ge=0, description="Estimated calories (kcal)")
    estimated_protein_g: float = Field(..., ge=0, description="Estimated protein (g)")
    estimated_carbs_g: float = Field(..., ge=0, description="Estimated carbohydrates (g)")
    estimated_fat_g: float = Field(..., ge=0, description="Estimated fat (g)")
    meal_type: Literal["Breakfast", "Lunch", "Dinner", "Snack"] = Field(
        ..., description="Suggested meal type"
    )
    prep_time_minutes: Optional[int] = Field(None, ge=0, description="Estimated preparation time")
    cook_time_minutes: Optional[int] = Field(None, ge=0, description="Estimated cooking time")
    instructions: list[str] = Field(
        default_factory=list, description="Step-by-step cooking instructions"
    )
    macro_fit_score: Optional[float] = Field(
        None, ge=0, le=100, description="How well this fits remaining macros (0-100)"
    )


class MealSuggestionsResponse(BaseModel):
    """Schema for meal suggestions response."""

    suggestions: list[MealSuggestion] = Field(..., description="List of meal suggestions")
    remaining_calories: Optional[float] = Field(None, description="User's remaining calories for the day")
    remaining_protein_g: Optional[float] = Field(None, description="User's remaining protein (g)")
    remaining_carbs_g: Optional[float] = Field(None, description="User's remaining carbs (g)")
    remaining_fat_g: Optional[float] = Field(None, description="User's remaining fat (g)")


class ImageAnalysisResponse(BaseModel):
    """Schema for food image analysis response."""

    detected_food_items: list[str] = Field(..., description="Detected food items in the image")
    detected_ingredients: list[str] = Field(..., description="Detected raw ingredients")
    estimated_calories: int = Field(..., ge=0, description="Estimated total calories (kcal)")
    estimated_protein_g: float = Field(..., ge=0, description="Estimated protein (g)")
    estimated_carbs_g: float = Field(..., ge=0, description="Estimated carbohydrates (g)")
    estimated_fat_g: float = Field(..., ge=0, description="Estimated fat (g)")
    predicted_meal_category: Literal[
        "Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Beverage", "Other"
    ] = Field(..., description="Predicted meal category")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence of the analysis (0-1)")
    serving_size_estimate: Optional[str] = Field(None, description="Estimated serving size description")
    notes: Optional[str] = Field(None, description="Additional notes about the analysis")