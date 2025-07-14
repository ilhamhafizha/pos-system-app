import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    const payload = {
      token: data.token,
      user: data.user,
    };
    setUser(payload);
    localStorage.setItem("user", JSON.stringify(payload));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // gunakan redirect manual
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
