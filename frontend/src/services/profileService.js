import api from "./api";

/**
 * Profile service – wraps all user profile API interactions.
 */
const profileService = {
  /**
   * Retrieve the authenticated user's profile.
   * @returns {Promise<{ age, gender, height_cm, weight_kg, activity_level, goal, bmr, tdee, daily_calorie_target, protein_target_g, fat_target_g, carb_target_g }>}
   */
  async getProfile() {
    const res = await api.get("/profile");
    return res.data;
  },

  /**
   * Save (create or update) the user profile.
   * @param {{ age: number, gender: string, height_cm: number, weight_kg: number, activity_level: string, goal: string }} data
   * @returns {Promise}
   */
  async saveProfile(data) {
    const res = await api.post("/profile", data);
    return res.data;
  },
};

export default profileService;
