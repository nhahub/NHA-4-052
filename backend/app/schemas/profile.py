from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict

GenderType = Literal["Male", "Female"]
ActivityLevelType = Literal[
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
    "Extra Active",
]
GoalType = Literal["Weight Loss", "Maintenance", "Muscle Gain"]


# ── Request schemas ──────────────────────────────────────────────────
class ProfileSave(BaseModel):
    """Schema to create or update a user profile."""

    age: int = Field(..., ge=1, le=120, description="Age in years")
    gender: GenderType = Field(..., description="Gender (Male or Female)")
    height_cm: float = Field(..., ge=30.0, le=300.0, description="Height in centimeters")
    weight_kg: float = Field(..., ge=10.0, le=500.0, description="Weight in kilograms")
    activity_level: ActivityLevelType = Field(
        ..., description="Activity level for TDEE calculation"
    )
    goal: GoalType = Field(..., description="Fitness/nutrition goal")


# ── Response schemas ─────────────────────────────────────────────────
class ProfileResponse(BaseModel):
    """Full profile schema including calculated values sent back to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    activity_level: str
    goal: str

    # Calculated metrics
    bmr: float
    tdee: float
    daily_calorie_target: float
    protein_target_g: float
    fat_target_g: float
    carb_target_g: float

    created_at: datetime
    updated_at: datetime
