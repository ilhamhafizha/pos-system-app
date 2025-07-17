import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const SESSION_TIMEOUT = 60 * 60 * 1000; // 10 menit

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    const payload = {
      token: data.token,
      user: data.user,
      loginTime: Date.now(), // catat waktu login
    };
    setUser(payload);
    localStorage.setItem("user", JSON.stringify(payload));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ⏱️ Auto logout jika session lewat dari batas waktu
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("user");
      if (saved) {
        const session = JSON.parse(saved);
        const now = Date.now();
        const diff = now - session.loginTime;

        if (diff > SESSION_TIMEOUT) {
          alert("Session expired. Please login again.");
          logout();
        }
      }
    }, 10000); // cek setiap 10 detik

    return () => clearInterval(interval);
  }, []);

  // 🔄 Reset timer jika user aktif (opsional tapi disarankan)
  useEffect(() => {
    const resetTimer = () => {
      const saved = localStorage.getItem("user");
      if (saved) {
        const session = JSON.parse(saved);
        session.loginTime = Date.now();
        localStorage.setItem("user", JSON.stringify(session));
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
