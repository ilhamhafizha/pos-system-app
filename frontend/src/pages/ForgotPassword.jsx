import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");

  // 🔒 Cek session masih aktif
  useEffect(() => {
    if (user) {
      const role = user.user?.role;
      if (role === "cashier") {
        navigate("/cashier/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/reset-password/email", { email });
      Swal.fire("Berhasil", "Email ditemukan. Silakan buat password baru.", "success");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      Swal.fire("Gagal", err?.response?.data?.message || "Email tidak ditemukan", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        <input
          type="email"
          placeholder="Masukkan Email"
          className="mb-4 w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Cek Email
        </button>

        <p className="mt-4 text-center text-sm">
          Ingat password?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
