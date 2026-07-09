# CaloriX – Pydantic Schemas
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TokenPayload,
)
from app.schemas.profile import ProfileSave, ProfileResponse
from app.schemas.meal import MealCreate, MealUpdate, MealResponse, DailySummary
from app.schemas.ml import (
    PredictionRequest,
    PredictionResponse,
    SimilarFoodsRequest,
    SimilarFoodResponse,
    SimilarFoodItem,
)
from app.schemas.ai import (
    MealSuggestionRequest,
    MealSuggestionsResponse,
    MealSuggestion,
    ImageAnalysisResponse,
)

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenPayload",
    "ProfileSave",
    "ProfileResponse",
    "MealCreate",
    "MealUpdate",
    "MealResponse",
    "DailySummary",
    "PredictionRequest",
    "PredictionResponse",
    "SimilarFoodsRequest",
    "SimilarFoodResponse",
    "SimilarFoodItem",
    "MealSuggestionRequest",
    "MealSuggestionsResponse",
    "MealSuggestion",
    "ImageAnalysisResponse",
]
