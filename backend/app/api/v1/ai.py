"""AI Assistant API routes."""

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_optional_ai_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.ai import (
    ImageAnalysisResponse,
    MealSuggestionRequest,
    MealSuggestionsResponse,
)
from app.services.ai_service import ai_service
from app.core.config import get_settings

router = APIRouter()


@router.post(
    "/suggest-meals",
    response_model=MealSuggestionsResponse,
    summary="Get meal suggestions from available ingredients",
)
async def suggest_meals(
    payload: MealSuggestionRequest,
    current_user: Optional[User] = Depends(get_optional_ai_user),
    db: Session = Depends(get_db),
):
    """
    Generate meal suggestions based on ingredients the user has available.

    Considers:
    - User's available ingredients
    - User's profile (goals, remaining calories/macros)
    - Optional meal type filter
    - Optional dietary preferences
    - Optional max calories per meal
    """
    try:
        user_id = current_user.id if current_user else None
        result = ai_service.suggest_meals(
            db=db,
            user_id=user_id,
            ingredients=payload.ingredients,
            meal_type=payload.meal_type,
            dietary_preferences=payload.dietary_preferences,
            max_calories=payload.max_calories,
        )
        return result
    except RuntimeError as e:
        if "GEMINI_API_KEY not configured" in str(e):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service unavailable: API key not configured"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate meal suggestions: {str(e)}"
        )


@router.post(
    "/analyze-image",
    response_model=ImageAnalysisResponse,
    summary="Analyze food image for nutrition estimation",
)
async def analyze_image(
    file: UploadFile = File(..., description="Food image (JPEG, PNG, WebP, HEIC)"),
    meal_type: Optional[str] = Form(None, description="Optional meal type context"),
    current_user: Optional[User] = Depends(get_optional_ai_user),
):
    """
    Analyze a food image using Gemini Vision to detect food items and estimate nutrition.

    Returns:
    - Detected food items and ingredients
    - Estimated calories, protein, carbs, fat
    - Predicted meal category
    - Confidence score
    """
    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/heic"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {', '.join(allowed_types)}"
        )

    # Validate file size (max 10MB)
    MAX_SIZE = 10 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB."
        )

    try:
        result = ai_service.analyze_image(
            image_bytes=contents,
            mime_type=file.content_type,
            meal_type=meal_type,
        )
        return result
    except RuntimeError as e:
        if "GEMINI_API_KEY not configured" in str(e):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service unavailable: API key not configured"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze image: {str(e)}"
        )