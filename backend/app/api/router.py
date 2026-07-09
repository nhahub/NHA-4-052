from fastapi import APIRouter

from app.api.v1 import auth, health, profile, meals, ml, ai, metrics, ai_chat

router = APIRouter(prefix="/api/v1")

router.include_router(health.router, tags=["health"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(profile.router, prefix="/profile", tags=["profile"])
router.include_router(meals.router, prefix="/meals", tags=["meals"])
router.include_router(ml.router, prefix="/ml", tags=["ml"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
router.include_router(ai_chat.router, prefix="/ai-chat", tags=["ai-chat"])
