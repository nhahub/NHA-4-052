from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.ml import (
    PredictionRequest,
    PredictionResponse,
    SimilarFoodsRequest,
    SimilarFoodResponse,
    FoodSearchResponse,
)
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_food_category(
    payload: PredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Predict the food category based on nutritional features.
    """
    try:
        # Convert Pydantic model to dictionary
        features_dict = payload.model_dump()
        prediction = ml_service.predict(features_dict)
        return PredictionResponse(predicted_category=prediction)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/similar-foods", response_model=SimilarFoodResponse)
def get_similar_foods(
    payload: SimilarFoodsRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Find similar foods based on nutritional features.
    """
    try:
        features_dict = payload.features.model_dump()
        results = ml_service.get_similar_foods(features_dict, top_k=payload.top_k)
        return SimilarFoodResponse(results=results)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to find similar foods: {str(e)}"
        )


@router.get("/foods", response_model=FoodSearchResponse)
def search_foods(
    q: str = Query(..., min_length=2, description="Search query for food name"),
    limit: int = Query(10, ge=1, le=50, description="Max number of results"),
    current_user: User = Depends(get_current_user),
):
    """
    Search for foods in the nutrition dataset by name.
    """
    results = ml_service.search_foods(q, limit=limit)
    return FoodSearchResponse(results=results)
