import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("cx_token"));
  const [loading, setLoading] = useState(true);

  /**
   * On mount (or when token changes), hydrate user from the /me endpoint.
   */
  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch {
      // Token invalid/expired – clean up
      localStorage.removeItem("cx_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Persist token, set user, and update state after a successful login.
   */
  const login = useCallback(async (email, password) => {
    const tokens = await authService.login({ email, password });
    localStorage.setItem("cx_token", tokens.access_token);
    setToken(tokens.access_token);

    // Fetch user profile with the new token
    const userData = await authService.getMe();
    setUser(userData);
    return userData;
  }, []);

  /**
   * Register, then auto-login.
   */
  const register = useCallback(async (username, email, password) => {
    await authService.register({ username, email, password });
    // Auto-login after registration
    return login(email, password);
  }, [login]);

  /**
   * Clear everything and redirect to login.
   */
  const logout = useCallback(() => {
    localStorage.removeItem("cx_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
