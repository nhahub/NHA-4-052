import api from "./api";

const aiService = {
  /**
   * Generate meal suggestions from a list of ingredients.
   * @param {{ ingredients: string[], meal_type?: string, dietary_preferences?: string[], max_calories?: number }} params
   * @returns {Promise<{ suggestions: Array, remaining_calories?: number, remaining_protein_g?: number, remaining_carbs_g?: number, remaining_fat_g?: number }>}
   */
  async suggestMeals({ ingredients, meal_type, dietary_preferences, max_calories }) {
    const body = { ingredients };
    if (meal_type) body.meal_type = meal_type;
    if (dietary_preferences?.length) body.dietary_preferences = dietary_preferences;
    if (max_calories) body.max_calories = max_calories;

    const res = await api.post("/ai/suggest-meals", body);
    return res.data;
  },

  /**
   * Analyze a food image for nutrition estimation.
   * @param {File} file - image file (JPEG, PNG, WebP, HEIC)
   * @param {string} [mealType] - optional meal type context
   * @returns {Promise<object>} analysis result
   */
  async analyzeImage(file, mealType) {
    const formData = new FormData();
    formData.append("file", file);
    if (mealType) formData.append("meal_type", mealType);

    const res = await api.post("/ai/analyze-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default aiService;
