from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import UserService
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account with email, username, and password."""
    user = UserService.create_user(db, payload)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate and receive tokens",
)
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Validate credentials and return JWT access + refresh tokens."""
    user = UserService.authenticate(db, payload.email, payload.password)
    tokens = UserService.create_tokens(user)
    return tokens


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user
