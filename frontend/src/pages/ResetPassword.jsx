import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = location.state?.email;

  // Cek session active sebelum user bisa mengakses halaman reset password
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const sessionStart = localStorage.getItem("sessionStart");

    if (storedUser && sessionStart) {
      const now = Date.now();
      const elapsed = now - parseInt(sessionStart, 10);
      const sessionDuration = 10 * 60 * 1000; // 10 menit dalam ms

      if (elapsed < sessionDuration) {
        // Jika user masih aktif, arahkan ke dashboard sesuai role
        const role = storedUser.user?.role;
        if (role === "cashier") navigate("/cashier/dashboard");
        else if (role === "admin") navigate("/admin/dashboard");
      } else {
        // Jika session expired, hapus data
        localStorage.removeItem("user");
        localStorage.removeItem("sessionStart");
      }
    }
  }, [navigate]);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/auth/reset-password/confirm", {
        email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      Swal.fire("Berhasil", "Password berhasil diubah. Silakan login kembali.", "success");
      navigate("/login");
    } catch (err) {
      Swal.fire("Gagal", err?.response?.data?.message || "Gagal reset password", "error");
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <p className="text-lg font-semibold">
          Tidak ada email yang dikirim. Silakan mulai dari halaman Reset Password.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Buat Password Baru</h2>

        <input
          type="password"
          name="password"
          placeholder="Password Baru"
          className="mb-4 w-full p-2 border rounded"
          onChange={handleChange}
          value={form.password}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Konfirmasi Password"
          className="mb-6 w-full p-2 border rounded"
          onChange={handleChange}
          value={form.confirmPassword}
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Simpan Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
