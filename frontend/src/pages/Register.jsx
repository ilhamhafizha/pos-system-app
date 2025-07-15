// src/pages/Register.jsx
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    active: true,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/register", form);
      Swal.fire("Berhasil", "Akun kasir berhasil dibuat!", "success");
      navigate("/login");
    } catch (err) {
      Swal.fire("Gagal", err?.response?.data?.message || "Terjadi kesalahan", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register Cashier</h2>

        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="mb-4 w-full p-2 border rounded"
          required
        />

        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="mb-4 w-full p-2 border rounded"
          required
        />

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

        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="mb-6 w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Register
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          <p className="mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </p>
      </form>
    </div>
  );
};

export default Register;
