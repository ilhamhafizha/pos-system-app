import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  // 🔒 Jika user sudah login, langsung redirect ke dashboard
  useEffect(() => {
    if (user) {
      const role = user.user?.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "cashier") {
        navigate("/cashier/dashboard");
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email: form.email,
        password: form.password,
      });

      // Simpan token & data user (termasuk avatar)
      login(res.data);

      Swal.fire("Success", "Login successful", "success");

      // Redirect berdasarkan role dari server
      const role = res.data?.user?.role || res.data?.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "cashier") {
        navigate("/cashier/dashboard");
      } else {
        Swal.fire("Unauthorized", "Unknown role", "error");
      }
    } catch (err) {
      Swal.fire("Login Failed", err?.response?.data?.message || "Invalid credentials", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="mb-4 w-full p-2 border rounded"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="mb-4 w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Belum punya akun?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
          <p className="mt-2">
            Lupa password?{" "}
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Reset password
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
