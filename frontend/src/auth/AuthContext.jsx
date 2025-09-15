// meit/frontend/src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(api.isLoggedIn());

  const login = async (creds) => {
    await api.login(creds);
    setAuthed(true);
  };
  const logout = () => { api.logout(); setAuthed(false); };
  const register = (info) => api.register(info);

  // 새로고침해도 access가 남아있으면 authed true
  useEffect(() => { setAuthed(api.isLoggedIn()); }, []);

  return (
    <AuthCtx.Provider value={{ authed, login, logout, register }}>
      {children}
    </AuthCtx.Provider>
  );
}
