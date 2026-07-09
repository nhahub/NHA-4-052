from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class StatCard(BaseModel):
    title: str
    value: str
    unit: str

class WeeklyCalorieItem(BaseModel):
    day: str
    calories: int

class MacroDistributionItem(BaseModel):
    name: str
    grams: int
    percent: int

class GoalProgress(BaseModel):
    current_weight: Optional[float] = None
    target_weight: Optional[float] = None
    progress_pct: int
    estimated_time: str

class WeeklyInsight(BaseModel):
    title: str
    description: str
    type: str # "success", "info", "warning"

class RecentActivityItem(BaseModel):
    title: str
    time_label: str
    calories: int

class MetricsResponse(BaseModel):
    cards: List[StatCard]
    weekly_calories: List[WeeklyCalorieItem]
    macros: List[MacroDistributionItem]
    goal_progress: GoalProgress
    insights: List[WeeklyInsight]
    recent_activity: List[RecentActivityItem]
