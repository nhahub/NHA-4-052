from datetime import date
from sqlalchemy.orm import Session
from app.services.meal_service import MealService
from app.services.profile_service import ProfileService
from app.schemas.meal import MealCreate
from google.generativeai.types import FunctionDeclaration

# Define Tool Schemas that Gemini expects
TOOLS = [
    FunctionDeclaration(
        name="add_meal",
        description="Log a new meal to the user's meal tracker.",
        parameters={
            "type": "object",
            "properties": {
                "food_name": {"type": "string", "description": "The name of the meal/food."},
                "meal_type": {"type": "string", "description": "Breakfast, Lunch, Dinner, or Snack"},
                "calories": {"type": "integer", "description": "Estimated calories"},
                "protein": {"type": "number", "description": "Estimated protein in grams"},
                "carbs": {"type": "number", "description": "Estimated carbs in grams"},
                "fat": {"type": "number", "description": "Estimated fat in grams"},
                "meal_date": {"type": "string", "format": "date", "description": "Date for the meal in YYYY-MM-DD format"}
            },
            "required": ["food_name", "meal_type", "calories", "protein", "carbs", "fat"]
        }
    ),
    FunctionDeclaration(
        name="delete_meal",
        description="Delete a meal by its ID.",
        parameters={
            "type": "object",
            "properties": {"meal_id": {"type": "integer", "description": "ID of the meal to delete."}},
            "required": ["meal_id"]
        }
    ),
    FunctionDeclaration(
        name="update_weight",
        description="Update the user's current weight in their profile.",
        parameters={
            "type": "object",
            "properties": {"weight_kg": {"type": "number", "description": "New weight in kg."}},
            "required": ["weight_kg"]
        }
    )
]

class ToolDispatcher:
    @staticmethod
    def dispatch(db: Session, user_id: int, tool_name: str, args: dict) -> str:
        """Executes the appropriate tool based on Gemini's request and returns a string result."""
        try:
            if tool_name == "add_meal":
                # Support both tool naming conventions and map to backend schema
                if args.get("name") and not args.get("food_name"):
                    args["food_name"] = args.pop("name")
                if args.get("protein_g") is not None and args.get("protein") is None:
                    args["protein"] = args.pop("protein_g")
                if args.get("carbs_g") is not None and args.get("carbs") is None:
                    args["carbs"] = args.pop("carbs_g")
                if args.get("fat_g") is not None and args.get("fat") is None:
                    args["fat"] = args.pop("fat_g")
                if args.get("meal_date") is None:
                    args["meal_date"] = date.today().isoformat()

                payload = MealCreate(**args)
                meal = MealService.create_meal(db, user_id, payload)
                return f"Successfully added meal '{meal.food_name}' (ID: {meal.id}) with {meal.calories} kcal."

            elif tool_name == "delete_meal":
                meal_id = int(args.get("meal_id"))
                meal = MealService.get_meal_by_id(db, meal_id, user_id)
                if meal:
                    MealService.delete_meal(db, meal)
                    return f"Successfully deleted meal ID {meal_id}."
                return f"Meal ID {meal_id} not found."

            elif tool_name == "update_weight":
                weight = args.get("weight_kg") or args.get("weight")
                if weight is not None:
                    weight = float(weight)
                from app.schemas.profile import UserProfileUpdate
                ProfileService.update_profile(db, user_id, UserProfileUpdate(current_weight=weight))
                return f"Successfully updated current weight to {weight} kg."

            else:
                return f"Tool {tool_name} is not recognized."

        except Exception as e:
            return f"Error executing tool {tool_name}: {str(e)}"
