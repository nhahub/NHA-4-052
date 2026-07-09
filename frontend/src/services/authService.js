import api from "./api";

/**
 * Auth service – wraps all authentication API calls.
 */
const authService = {
  /**
   * Register a new user.
   * @param {{ username: string, email: string, password: string }} data
   * @returns {Promise<{ id, username, email, is_active, created_at }>}
   */
  async register(data) {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  /**
   * Log in with email + password.
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ access_token, refresh_token, token_type }>}
   */
  async login(data) {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  /**
   * Get the currently authenticated user's profile.
   * @returns {Promise<{ id, username, email, is_active, created_at }>}
   */
  async getMe() {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export default authService;
