from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.meal import Meal
from app.models.user_profile import UserProfile
from app.schemas.metrics import (
    MetricsResponse, StatCard, WeeklyCalorieItem,
    MacroDistributionItem, GoalProgress, WeeklyInsight, RecentActivityItem
)

class MetricsService:
    @staticmethod
    def get_metrics(db: Session, user_id: int, range_str: str) -> MetricsResponse:
        days = 7
        if range_str == "30D":
            days = 30
        elif range_str == "90D":
            days = 90

        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)

        meals = db.query(Meal).filter(
            Meal.user_id == user_id,
            Meal.meal_date >= start_date,
            Meal.meal_date <= end_date
        ).all()

        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        # Use only fields that exist on UserProfile:
        # age, gender, height_cm, weight_kg, activity_level, goal,
        # bmr, tdee, daily_calorie_target, protein_target_g, fat_target_g, carb_target_g
        target_calories = profile.daily_calorie_target if profile else 2000.0
        target_protein  = profile.protein_target_g if profile else 150.0
        current_weight  = profile.weight_kg if profile else None   # actual field name

        # ── Daily totals ─────────────────────────────────────────────
        daily_totals = {}
        for i in range(days):
            d = start_date + timedelta(days=i)
            daily_totals[d] = {"calories": 0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "logged": False}

        total_calories = 0
        total_protein  = 0.0
        total_carbs    = 0.0
        total_fat      = 0.0
        days_logged    = 0
        meals_logged_count = len(meals)

        for meal in meals:
            d = meal.meal_date
            if d in daily_totals:
                # Meal model actual fields: calories, protein, carbs, fat, food_name
                daily_totals[d]["calories"] += meal.calories
                daily_totals[d]["protein"]  += meal.protein
                daily_totals[d]["carbs"]    += meal.carbs
                daily_totals[d]["fat"]      += meal.fat
                if not daily_totals[d]["logged"]:
                    daily_totals[d]["logged"] = True
                    days_logged += 1

                total_calories += meal.calories
                total_protein  += meal.protein
                total_carbs    += meal.carbs
                total_fat      += meal.fat

        # ── Averages ─────────────────────────────────────────────────
        avg_calories = int(total_calories / days_logged) if days_logged > 0 else 0
        avg_protein  = total_protein / days_logged if days_logged > 0 else 0.0
        avg_carbs    = total_carbs / days_logged if days_logged > 0 else 0.0
        avg_fat      = total_fat / days_logged if days_logged > 0 else 0.0

        # ── Goal completion (days within 110% of calorie target) ──────
        days_met_target = sum(
            1 for v in daily_totals.values()
            if 0 < v["calories"] <= target_calories * 1.1
        )
        goal_completion = int((days_met_target / days) * 100) if days > 0 else 0

        # ── Streak (consecutive logged days counting backwards) ───────
        streak = 0
        for i in range(days - 1, -1, -1):
            d = start_date + timedelta(days=i)
            if daily_totals[d]["logged"]:
                streak += 1
            else:
                break

        # ── Stat cards ───────────────────────────────────────────────
        cards = [
            StatCard(title="Average Calories", value=str(avg_calories), unit="kcal"),
            StatCard(title="Goal Completion",  value=str(goal_completion), unit="%"),
            StatCard(title=f"{range_str} Streak", value=str(streak), unit="days"),
            StatCard(title="Meals Logged",     value=str(meals_logged_count), unit=""),
        ]

        # ── Last-7-day calorie bar chart (always 7 bars) ─────────────
        weekly_calories = []
        for i in range(7):
            d = end_date - timedelta(days=6 - i)
            cals = daily_totals.get(d, {}).get("calories", 0)
            weekly_calories.append(WeeklyCalorieItem(day=d.strftime("%a"), calories=int(cals)))

        # ── Macro distribution ───────────────────────────────────────
        total_macros = total_protein + total_carbs + total_fat
        if total_macros > 0:
            p_pct = int((total_protein / total_macros) * 100)
            c_pct = int((total_carbs / total_macros) * 100)
            f_pct = int((total_fat / total_macros) * 100)
        else:
            p_pct = c_pct = f_pct = 0

        macros = [
            MacroDistributionItem(name="Protein",       grams=int(avg_protein), percent=p_pct),
            MacroDistributionItem(name="Carbohydrates", grams=int(avg_carbs),   percent=c_pct),
            MacroDistributionItem(name="Fat",           grams=int(avg_fat),     percent=f_pct),
        ]

        # ── Goal progress ─────────────────────────────────────────────
        # target_weight does not exist on UserProfile; use calorie-goal adherence instead
        if target_calories > 0 and avg_calories > 0:
            progress_pct = min(100, int((avg_calories / target_calories) * 100))
        else:
            progress_pct = 0

        goal_progress = GoalProgress(
            current_weight=current_weight,
            target_weight=None,       # field does not exist in UserProfile
            progress_pct=progress_pct,
            estimated_time="N/A"
        )

        # ── Insights ─────────────────────────────────────────────────
        insights = [
            WeeklyInsight(
                title="Goal achieved",
                description=f"You stayed within your calorie target for {days_met_target} of the last {days} days.",
                type="success"
            )
        ]
        if avg_protein > target_protein:
            insights.append(WeeklyInsight(
                title="Protein Intake",
                description="Your average protein intake is looking great this period.",
                type="info"
            ))

        # ── Recent activity ───────────────────────────────────────────
        recent_meals = sorted(meals, key=lambda m: (m.meal_date, m.id), reverse=True)[:4]
        recent_activity = []
        for rm in recent_meals:
            time_label = "Today" if rm.meal_date == end_date else rm.meal_date.strftime("%b %d")
            recent_activity.append(RecentActivityItem(
                title=rm.food_name,       # actual field name (not 'name')
                time_label=time_label,
                calories=int(rm.calories)
            ))

        return MetricsResponse(
            cards=cards,
            weekly_calories=weekly_calories,
            macros=macros,
            goal_progress=goal_progress,
            insights=insights,
            recent_activity=recent_activity,
        )
