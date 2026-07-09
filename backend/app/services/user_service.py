from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token


class UserService:
    """Encapsulates all user-related business logic."""

    # ── Queries ──────────────────────────────────────────────────────

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> User | None:
        return db.query(User).filter(User.username == username).first()

    # ── Registration ─────────────────────────────────────────────────

    @staticmethod
    def create_user(db: Session, payload: UserCreate) -> User:
        """
        Register a new user.
        Raises 409 if email or username already exists.
        """
        if UserService.get_by_email(db, payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )
        if UserService.get_by_username(db, payload.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this username already exists.",
            )

        user = User(
            email=payload.email,
            username=payload.username,
            hashed_password=hash_password(payload.password),
        )

        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists.",
            )
        return user

    # ── Authentication ───────────────────────────────────────────────

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> User:
        """
        Validate credentials and return the user.
        Raises 401 on bad email or password.
        """
        user = UserService.get_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated.",
            )
        return user

    # ── Token generation ─────────────────────────────────────────────

    @staticmethod
    def create_tokens(user: User) -> dict:
        """Generate an access + refresh token pair for the given user."""
        data = {"sub": str(user.id)}
        return {
            "access_token": create_access_token(data),
            "refresh_token": create_refresh_token(data),
            "token_type": "bearer",
        }
