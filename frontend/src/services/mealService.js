import api from "./api";

const mealService = {
  /**
   * Add a new meal.
   * @param {{ food_name: string, calories: number, protein: number, carbs: number, fat: number, meal_type: string, meal_date: string }} data
   * @returns {Promise}
   */
  async addMeal(data) {
    const res = await api.post("/meals", data);
    return res.data;
  },

  /**
   * Get meals and daily summary for a specific date.
   * @param {string} targetDate (YYYY-MM-DD)
   * @returns {Promise<{ summary: object, meals: array }>}
   */
  async getMealsByDate(targetDate) {
    const res = await api.get(`/meals?target_date=${targetDate}`);
    return res.data;
  },

  /**
   * Update a meal.
   * @param {number} mealId
   * @param {object} data
   * @returns {Promise}
   */
  async updateMeal(mealId, data) {
    const res = await api.put(`/meals/${mealId}`, data);
    return res.data;
  },

  /**
   * Delete a meal.
   * @param {number} mealId
   * @returns {Promise}
   */
  async deleteMeal(mealId) {
    const res = await api.delete(`/meals/${mealId}`);
    return res.data;
  }
};

export default mealService;
