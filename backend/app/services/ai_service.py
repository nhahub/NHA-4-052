"""AI Assistant service layer – integrates with Google Gemini for text and vision tasks."""

import json
import logging
from typing import Optional

import traceback
import google.generativeai as genai
from sqlalchemy.orm import Session

from app.models.meal import Meal
from app.models.user_profile import UserProfile
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Configure Gemini API key from settings
settings = get_settings()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not set – AI features will be unavailable")


class AIService:
    """Service for AI-powered meal suggestions and food image analysis."""

    # Model configuration
    TEXT_MODEL = "gemini-2.5-flash"
    VISION_MODEL = "gemini-2.5-flash"

    # Prompt templates
    MEAL_SUGGESTION_PROMPT = """
You are a nutrition-savvy culinary assistant. Given the user's available ingredients and dietary context, suggest 3-5 creative, balanced meal ideas.

User Context:
- Available ingredients: {ingredients}
- Meal type filter: {meal_type}
- Dietary preferences: {dietary_preferences}
- Maximum calories per meal: {max_calories}
- Daily calorie target: {daily_calorie_target}
- Remaining calories today: {remaining_calories}
- Remaining protein target: {remaining_protein}g
- Remaining carbs target: {remaining_carbs}g
- Remaining fat target: {remaining_fat}g
- User goal: {goal}

Return ONLY a valid JSON array of meal suggestions. Each suggestion must have exactly these fields:
- "name": string (meal name)
- "description": string (brief description + cooking idea)
- "ingredients_used": array of strings (subset of user's ingredients)
- "additional_ingredients": array of strings (extra ingredients needed, can be empty)
- "estimated_calories": integer (kcal)
- "estimated_protein_g": number (grams)
- "estimated_carbs_g": number (grams)
- "estimated_fat_g": number (grams)
- "meal_type": "Breakfast" | "Lunch" | "Dinner" | "Snack"
- "prep_time_minutes": integer or null
- "cook_time_minutes": integer or null
- "instructions": array of strings (step-by-step cooking instructions, 3-6 steps)
- "macro_fit_score": number 0-100 (how well this fits remaining macros)

Guidelines:
- Prioritize using the user's available ingredients
- Keep estimates realistic for home cooking portions
- Consider the user's goal (weight loss/maintenance/muscle gain) when suggesting portions
- For macro_fit_score: 100 = perfect fit for remaining macros, 0 = completely mismatched
- Return 3-5 diverse suggestions
"""

    IMAGE_ANALYSIS_PROMPT = """
You are a food recognition and nutrition estimation expert. Analyze the uploaded food image and provide detailed nutritional estimates.

Return ONLY a valid JSON object with exactly these fields:
- "detected_food_items": array of strings (specific prepared dishes/foods seen, e.g., ["grilled chicken breast", "steamed broccoli", "brown rice"])
- "detected_ingredients": array of strings (raw ingredients identified, e.g., ["chicken", "broccoli", "rice", "olive oil"])
- "estimated_calories": integer (total kcal for the visible portion)
- "estimated_protein_g": number (total protein in grams)
- "estimated_carbs_g": number (total carbohydrates in grams)
- "estimated_fat_g": number (total fat in grams)
- "predicted_meal_category": "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert" | "Beverage" | "Other"
- "confidence_score": number 0-1 (your confidence in the analysis)
- "serving_size_estimate": string or null (e.g., "approximately 400g", "1 plate", "1 bowl")
- "notes": string or null (any additional observations, e.g., "fried preparation adds extra fat", "sauce not clearly visible")

Guidelines:
- Be conservative with calorie estimates (better to slightly underestimate)
- If multiple items, estimate each and sum
- Consider cooking methods (fried vs steamed vs raw)
- If uncertain about portions, note it in 'notes' and adjust confidence
- For beverages, include liquid calories
"""

    @classmethod
    def _get_text_model(cls):
        """Get configured Gemini text model."""
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not configured")
        return genai.GenerativeModel(cls.TEXT_MODEL)

    @classmethod
    def _get_vision_model(cls):
        """Get configured Gemini vision model."""
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not configured")
        return genai.GenerativeModel(cls.VISION_MODEL)

    @classmethod
    def _get_user_context(cls, db: Session, user_id: Optional[int]) -> dict:
        """Fetch user profile and today's meal summary for context."""
        if not user_id:
            return {
                "daily_calorie_target": 2000,
                "remaining_calories": 2000,
                "remaining_protein": 150,
                "remaining_carbs": 200,
                "remaining_fat": 65,
                "goal": "Maintenance",
            }
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

        if not profile:
            return {
                "daily_calorie_target": 2000,
                "remaining_calories": 2000,
                "remaining_protein": 150,
                "remaining_carbs": 200,
                "remaining_fat": 65,
                "goal": "Maintenance",
            }

        # Get today's meals and recent history
        from datetime import date, timedelta

        today = date.today()
        today_meals = db.query(Meal).filter(
            Meal.user_id == user_id,
            Meal.meal_date == today
        ).all()

        total_cals = sum(m.calories for m in today_meals)
        total_prot = sum(m.protein for m in today_meals)
        total_carbs = sum(m.carbs for m in today_meals)
        total_fat = sum(m.fat for m in today_meals)

        # Recent meals (last 10 entries)
        recent_meals_query = db.query(Meal).filter(Meal.user_id == user_id).order_by(Meal.meal_date.desc())
        recent_meals = recent_meals_query.limit(10).all()

        # Build a 7-day nutrition history (day -> totals)
        nutrition_history = []
        for i in range(0, 7):
            d = today - timedelta(days=i)
            meals_on_d = db.query(Meal).filter(Meal.user_id == user_id, Meal.meal_date == d).all()
            nutrition_history.append({
                "date": d.isoformat(),
                "calories": sum(m.calories for m in meals_on_d),
                "protein": sum(m.protein for m in meals_on_d),
                "carbs": sum(m.carbs for m in meals_on_d),
                "fat": sum(m.fat for m in meals_on_d),
                "meals": [
                    {
                        "id": m.id,
                        "food_name": m.food_name,
                        "meal_type": m.meal_type,
                        "calories": m.calories,
                        "protein": m.protein,
                        "carbs": m.carbs,
                        "fat": m.fat,
                    }
                    for m in meals_on_d
                ],
            })

        # Serialize meal lists for prompt
        def serialize_meal(m: Meal) -> dict:
            return {
                "id": m.id,
                "food_name": getattr(m, 'food_name', getattr(m, 'food_name', None)) or getattr(m, 'food_name', None) or getattr(m, 'food_name', None),
                "meal_type": m.meal_type,
                "meal_date": m.meal_date.isoformat(),
                "calories": m.calories,
                "protein": m.protein,
                "carbs": m.carbs,
                "fat": m.fat,
            }

        return {
            "profile": {
                "age": profile.age,
                "gender": profile.gender,
                "height_cm": profile.height_cm,
                "weight_kg": profile.weight_kg,
                "activity_level": profile.activity_level,
                "goal": profile.goal,
                "bmr": profile.bmr,
                "tdee": profile.tdee,
                "daily_calorie_target": profile.daily_calorie_target,
                "protein_target_g": profile.protein_target_g,
                "fat_target_g": profile.fat_target_g,
                "carb_target_g": profile.carb_target_g,
            },
            "today_meals": [serialize_meal(m) for m in today_meals],
            "recent_meals": [serialize_meal(m) for m in recent_meals],
            "nutrition_history": nutrition_history,
            "daily_calorie_target": profile.daily_calorie_target,
            "remaining_calories": max(0, profile.daily_calorie_target - total_cals),
            "remaining_protein": max(0, profile.protein_target_g - total_prot),
            "remaining_carbs": max(0, profile.carb_target_g - total_carbs),
            "remaining_fat": max(0, profile.fat_target_g - total_fat),
            "goal": profile.goal,
        }

    @classmethod
    def suggest_meals(
        cls,
        db: Session,
        user_id: Optional[int],
        ingredients: list[str],
        meal_type: Optional[str] = None,
        dietary_preferences: Optional[list[str]] = None,
        max_calories: Optional[int] = None,
    ) -> dict:
        """
        Generate meal suggestions based on available ingredients and user context.

        Returns dict with suggestions list and user's remaining macros.
        """
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("AI service unavailable: GEMINI_API_KEY not configured")

        # Get user context
        context = cls._get_user_context(db, user_id)

        # Build prompt
        prompt = cls.MEAL_SUGGESTION_PROMPT.format(
            ingredients=", ".join(ingredients),
            meal_type=meal_type or "Any",
            dietary_preferences=", ".join(dietary_preferences) if dietary_preferences else "None",
            max_calories=max_calories or "No limit",
            daily_calorie_target=round(context["daily_calorie_target"], 1),
            remaining_calories=round(context["remaining_calories"], 1),
            remaining_protein=round(context["remaining_protein"], 1),
            remaining_carbs=round(context["remaining_carbs"], 1),
            remaining_fat=round(context["remaining_fat"], 1),
            goal=context["goal"],
        )

        try:
            model = cls._get_text_model()
            response = model.generate_content(prompt)

            # Parse JSON response
            text = response.text.strip()
            # Handle potential markdown code blocks
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            suggestions = json.loads(text)

            # Validate and clean suggestions
            validated_suggestions = []
            for s in suggestions:
                validated_suggestions.append({
                    "name": s.get("name", "Unnamed Meal"),
                    "description": s.get("description", ""),
                    "ingredients_used": s.get("ingredients_used", []),
                    "additional_ingredients": s.get("additional_ingredients", []),
                    "estimated_calories": max(0, int(s.get("estimated_calories", 0))),
                    "estimated_protein_g": max(0, float(s.get("estimated_protein_g", 0))),
                    "estimated_carbs_g": max(0, float(s.get("estimated_carbs_g", 0))),
                    "estimated_fat_g": max(0, float(s.get("estimated_fat_g", 0))),
                    "meal_type": s.get("meal_type", "Snack"),
                    "prep_time_minutes": s.get("prep_time_minutes"),
                    "cook_time_minutes": s.get("cook_time_minutes"),
                    "instructions": s.get("instructions", []),
                    "macro_fit_score": min(100, max(0, float(s.get("macro_fit_score", 50)))),
                })

            return {
                "suggestions": validated_suggestions,
                "remaining_calories": context["remaining_calories"],
                "remaining_protein_g": context["remaining_protein"],
                "remaining_carbs_g": context["remaining_carbs"],
                "remaining_fat_g": context["remaining_fat"],
            }

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Raw response: {response.text}")
            raise RuntimeError("AI returned invalid response format")
        except Exception as e:
            logger.error(f"AI meal suggestion failed: {e}")
            raise RuntimeError(f"Meal suggestion failed: {str(e)}")

    @classmethod
    def analyze_image(cls, image_bytes: bytes, mime_type: str, meal_type: Optional[str] = None) -> dict:
        """
        Analyze a food image using Gemini Vision.

        Args:
            image_bytes: Raw image data
            mime_type: MIME type (image/jpeg, image/png, etc.)
            meal_type: Optional meal type context

        Returns dict with analysis results.
        """
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("AI service unavailable: GEMINI_API_KEY not configured")

        # Validate MIME type
        allowed_types = {"image/jpeg", "image/png", "image/webp", "image/heic"}
        if mime_type not in allowed_types:
            raise ValueError(f"Unsupported image type: {mime_type}. Allowed: {allowed_types}")

        # Build prompt with optional meal type context
        prompt = cls.IMAGE_ANALYSIS_PROMPT
        if meal_type:
            prompt += f"\n\nContext: The user indicates this is a {meal_type} meal."

        try:
            model = cls._get_vision_model()

            # Prepare image part for Gemini
            image_part = {
                "mime_type": mime_type,
                "data": image_bytes,
            }

            response = model.generate_content([prompt, image_part])

            # Parse JSON response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            result = json.loads(text)

            # Validate required fields
            required_fields = [
                "detected_food_items",
                "detected_ingredients",
                "estimated_calories",
                "estimated_protein_g",
                "estimated_carbs_g",
                "estimated_fat_g",
                "predicted_meal_category",
                "confidence_score",
            ]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field in AI response: {field}")

            # Clamp values
            result["estimated_calories"] = max(0, int(result["estimated_calories"]))
            result["estimated_protein_g"] = max(0, float(result["estimated_protein_g"]))
            result["estimated_carbs_g"] = max(0, float(result["estimated_carbs_g"]))
            result["estimated_fat_g"] = max(0, float(result["estimated_fat_g"]))
            result["confidence_score"] = min(1.0, max(0.0, float(result["confidence_score"])))

            # Validate meal category
            valid_categories = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Beverage", "Other"]
            if result["predicted_meal_category"] not in valid_categories:
                result["predicted_meal_category"] = "Other"

            # Ensure optional fields exist
            result.setdefault("serving_size_estimate", None)
            result.setdefault("notes", None)

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI vision response as JSON: {e}")
            logger.error(f"Raw response: {response.text}")
            raise RuntimeError("AI returned invalid response format")
        except Exception as e:
            logger.error(f"AI image analysis failed: {e}")
            raise RuntimeError(f"Image analysis failed: {str(e)}")

    @classmethod
    def chat_with_coach(cls, db: Session, user_id: int, prompt: str) -> str:
        """
        Chat with AI Coach using Function Calling.
        """
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("AI service unavailable: GEMINI_API_KEY not configured")
            
        from app.services.ai_tools import TOOLS, ToolDispatcher

        # Decide whether to enable tools based on user's last message (mutation vs read-only)
        def _is_mutation_intent(p: str) -> bool:
            try:
                # extract the last user message inserted by PromptBuilder: 'User: <msg>\nAssistant:'
                user_part = p.rsplit('User:', 1)[1]
                user_msg = user_part.split('Assistant:')[0].strip().lower()
            except Exception:
                user_msg = p.lower()

            mutation_keywords = [
                'add ', 'add meal', 'log ', 'log meal', 'create meal', 'record meal',
                'delete ', 'delete meal', 'remove ', 'remove meal',
                'update weight', 'update my weight', 'change weight', 'update meal', 'edit meal'
            ]
            return any(k in user_msg for k in mutation_keywords)

        enable_tools = _is_mutation_intent(prompt)

        try:
            if enable_tools:
                model = genai.GenerativeModel(cls.TEXT_MODEL, tools=TOOLS)
            else:
                model = genai.GenerativeModel(cls.TEXT_MODEL)
            # Use generate_content directly as we provide the entire history in the prompt.
            response = model.generate_content(prompt)
            
            # Check if Gemini wants to call a function
            if response.candidates and response.candidates[0].content.parts:
                part = response.candidates[0].content.parts[0]
                if part.function_call:
                    func_call = part.function_call
                    tool_name = func_call.name
                    args = dict(func_call.args)
                    
                    # Dispatch to tool
                    tool_result_str = ToolDispatcher.dispatch(db, user_id, tool_name, args)
                    
                    # Return the tool result back to Gemini so it can answer the user
                    messages = [
                        {"role": "user", "parts": [prompt]},
                        {"role": "model", "parts": [part]},
                        {"role": "user", "parts": [
                            genai.protos.Part(
                                function_response=genai.protos.FunctionResponse(
                                    name=tool_name,
                                    response={"result": tool_result_str}
                                )
                            )
                        ]}
                    ]
                    
                    final_response = model.generate_content(messages)
                    return final_response.text
                    
            return response.text
            
        except Exception as e:
            traceback.print_exc()
            logger.exception("AI chat failed")
            raise RuntimeError(f"Chat failed: {str(e)}")

# Singleton instance
ai_service = AIService()