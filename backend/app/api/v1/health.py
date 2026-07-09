from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Lightweight health-check endpoint."""
    return {"status": "healthy", "service": "CaloriX"}
