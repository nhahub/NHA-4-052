from sqlalchemy.orm import Session

from app.models.user_profile import UserProfile
from app.schemas.profile import ProfileSave

# TDEE activity multipliers
ACTIVITY_MULTIPLIERS = {
    "Sedentary": 1.2,
    "Lightly Active": 1.375,
    "Moderately Active": 1.55,
    "Very Active": 1.725,
    "Extra Active": 1.9,
}


class ProfileService:
    """Calculates nutritional metrics (BMR, TDEE, Macros) and handles database profile sync."""

    @staticmethod
    def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
        """
        Calculates BMR using the Mifflin-St Jeor Equation.
        Men: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
        Women: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
        """
        base = (10 * weight) + (6.25 * height) - (5 * age)
        if gender == "Male":
            return base + 5
        return base - 161

    @staticmethod
    def calculate_tdee(bmr: float, activity_level: str) -> float:
        """Calculates TDEE by multiplying BMR with the physical activity level multiplier."""
        multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.2)
        return bmr * multiplier

    @staticmethod
    def calculate_calorie_target(tdee: float, goal: str) -> float:
        """
        Calculates target daily calories based on TDEE and fitness goals.
        - Weight Loss: TDEE - 500 (minimum floor of 1200 kcal for safety)
        - Maintenance: TDEE
        - Muscle Gain: TDEE + 300
        """
        if goal == "Weight Loss":
            return max(tdee - 500.0, 1200.0)
        elif goal == "Muscle Gain":
            return tdee + 300.0
        return tdee

    @staticmethod
    def calculate_macros(
        calorie_target: float, weight_kg: float
    ) -> tuple[float, float, float]:
        """
        Calculates daily target macros (Protein, Fat, Carbs) in grams.
        - Protein: 2.0g per kg of body weight (4 kcal/g). Capped at 45% of total calories.
        - Fat: 25% of total calories (9 kcal/g).
        - Carbohydrates: Remaining calories (4 kcal/g).
        """
        # 1. Protein target (2.0g/kg)
        protein_g = weight_kg * 2.0
        protein_kcal = protein_g * 4.0

        # Cap protein at 45% of daily calorie target to avoid extreme values
        max_protein_kcal = calorie_target * 0.45
        if protein_kcal > max_protein_kcal:
            protein_kcal = max_protein_kcal
            protein_g = protein_kcal / 4.0

        # 2. Fat target (25% of daily calories)
        fat_kcal = calorie_target * 0.25
        fat_g = fat_kcal / 9.0

        # 3. Carbohydrates target (remaining calories)
        carb_kcal = calorie_target - protein_kcal - fat_kcal
        carb_g = max(carb_kcal / 4.0, 0.0)  # Ensure no negative carbs

        return round(protein_g, 1), round(fat_g, 1), round(carb_g, 1)

    # ── Database Operations ──────────────────────────────────────────

    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> UserProfile | None:
        """Retrieve user profile by user id."""
        return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    @staticmethod
    def save_profile(
        db: Session, user_id: int, payload: ProfileSave
    ) -> UserProfile:
        """
        Create or update a user's profile, runs calculations, and persists to DB.
        """
        # Run BMR, TDEE, calorie target and macro target calculations
        bmr = ProfileService.calculate_bmr(
            payload.weight_kg, payload.height_cm, payload.age, payload.gender
        )
        tdee = ProfileService.calculate_tdee(bmr, payload.activity_level)
        calorie_target = ProfileService.calculate_calorie_target(tdee, payload.goal)
        protein_g, fat_g, carb_g = ProfileService.calculate_macros(
            calorie_target, payload.weight_kg
        )

        profile = ProfileService.get_by_user_id(db, user_id)

        if not profile:
            # Create new profile
            profile = UserProfile(
                user_id=user_id,
                age=payload.age,
                gender=payload.gender,
                height_cm=payload.height_cm,
                weight_kg=payload.weight_kg,
                activity_level=payload.activity_level,
                goal=payload.goal,
                bmr=round(bmr, 1),
                tdee=round(tdee, 1),
                daily_calorie_target=round(calorie_target, 1),
                protein_target_g=protein_g,
                fat_target_g=fat_g,
                carb_target_g=carb_g,
            )
            db.add(profile)
        else:
            # Update existing profile
            profile.age = payload.age
            profile.gender = payload.gender
            profile.height_cm = payload.height_cm
            profile.weight_kg = payload.weight_kg
            profile.activity_level = payload.activity_level
            profile.goal = payload.goal
            profile.bmr = round(bmr, 1)
            profile.tdee = round(tdee, 1)
            profile.daily_calorie_target = round(calorie_target, 1)
            profile.protein_target_g = protein_g
            profile.fat_target_g = fat_g
            profile.carb_target_g = carb_g

        db.commit()
        db.refresh(profile)
        return profile
