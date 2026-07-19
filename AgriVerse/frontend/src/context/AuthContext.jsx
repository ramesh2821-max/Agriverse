import { createContext, useContext, useState, useCallback } from "react";
import api from "../config/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "agriverse_admin_token";
const ADMIN_KEY = "agriverse_admin_profile";

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem(ADMIN_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    const profile = { _id: data._id, email: data.email, name: data.name };
    localStorage.setItem(ADMIN_KEY, JSON.stringify(profile));
    setAdmin(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
