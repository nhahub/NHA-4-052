from datetime import datetime, timezone
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class UserProfile(Base):
    """UserProfile model storing physical metrics, goals, and calculated macro targets."""

    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # ── Input Metrics ────────────────────────────────────────────────
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)  # Male / Female
    height_cm: Mapped[float] = mapped_column(Float, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    activity_level: Mapped[str] = mapped_column(String(50), nullable=False)
    goal: Mapped[str] = mapped_column(String(50), nullable=False)

    # ── Calculated Metrics ───────────────────────────────────────────
    bmr: Mapped[float] = mapped_column(Float, nullable=False)
    tdee: Mapped[float] = mapped_column(Float, nullable=False)
    daily_calorie_target: Mapped[float] = mapped_column(Float, nullable=False)
    protein_target_g: Mapped[float] = mapped_column(Float, nullable=False)
    fat_target_g: Mapped[float] = mapped_column(Float, nullable=False)
    carb_target_g: Mapped[float] = mapped_column(Float, nullable=False)

    # ── Timestamps ───────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ── Relationships ────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile id={self.id} user_id={self.user_id} bmr={self.bmr}>"
