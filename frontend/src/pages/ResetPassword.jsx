import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

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