import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, create_model, ConfigDict

# Determine the absolute path to the metadata.json
METADATA_PATH = Path(__file__).parent.parent / "ml" / "metadata.json"

# Load metadata to dynamically generate the feature schema
try:
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        metadata = json.load(f)
        feature_names = metadata.get("feature_names", metadata.get("feature_columns", []))
except Exception:
    feature_names = []

# Dynamically create the Pydantic schema for features
# Each feature is optional at the API layer and populated by the ML service as needed.
feature_fields = {feature: (Optional[Any], None) for feature in feature_names}

# The dynamically generated schema
PredictionRequest = create_model(
    "PredictionRequest",
    __config__=ConfigDict(extra="ignore"),
    **feature_fields,
)


class PredictionResponse(BaseModel):
    """Schema for prediction response."""
    predicted_category: str
    confidence_score: float = 1.0


class SimilarFoodsRequest(BaseModel):
    """Schema for requesting similar foods."""
    features: PredictionRequest
    top_k: int = 5


class SimilarFoodItem(BaseModel):
    """Schema for a single similar food item."""
    food_name: str
    distance: float
    category: Optional[str] = None
    features: Dict[str, Any]


class SimilarFoodResponse(BaseModel):
    """Schema for similar foods response."""
    results: List[SimilarFoodItem]


class FoodSearchItem(BaseModel):
    """Schema for a food item returned from the database search."""
    food_name: str
    category: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    serving_size_g: float


class FoodSearchResponse(BaseModel):
    """Schema for food search results."""
    results: List[FoodSearchItem]
