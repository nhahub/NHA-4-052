from datetime import date
from sqlalchemy import Integer, String, Float, ForeignKey, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Meal(Base):
    """Meal tracking entity representing individual food items logged by users."""

    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Food Parameters ──────────────────────────────────────────────
    food_name: Mapped[str] = mapped_column(String(255), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, nullable=False)  # Kcal
    protein: Mapped[float] = mapped_column(Float, default=0.0)      # Grams
    carbs: Mapped[float] = mapped_column(Float, default=0.0)        # Grams
    fat: Mapped[float] = mapped_column(Float, default=0.0)          # Grams

    # ── Meal metadata ────────────────────────────────────────────────
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Breakfast, Lunch, Dinner, Snack
    meal_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)

    # ── AI Classification ────────────────────────────────────────────
    food_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_ai_predicted: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Relationships ────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="meals")

    def __repr__(self) -> str:
        return f"<Meal id={self.id} user_id={self.user_id} food={self.food_name!r}>"
