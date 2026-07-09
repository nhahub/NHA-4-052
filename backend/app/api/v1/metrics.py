from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.schemas.metrics import MetricsResponse
from app.services.metrics_service import MetricsService

router = APIRouter()

@router.get("", response_model=MetricsResponse)
def get_metrics(
    range: str = Query("7D", description="Date range: 7D, 30D, 90D"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all nutrition metrics in a single consolidated response."""
    # Default to 7D if invalid range
    if range not in ["7D", "30D", "90D"]:
        range = "7D"
    return MetricsService.get_metrics(db, current_user.id, range)
