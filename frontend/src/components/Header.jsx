import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // pastikan path-nya sesuai
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // gunakan context langsung
  const [userInfo, setUserInfo] = useState({
    username: "",
    role: "",
    avatar: "",
  });

  useEffect(() => {
    if (user?.user) {
      setUserInfo({
        username: user.user.username,
        role: user.user.role,
        avatar: user.user.avatar,
      });
    }
  }, [user]); // jalankan ulang setiap user berubah

  const handleLogout = () => {
    logout(); // sudah menangani redirect
  };

  const avatarUrl = userInfo.avatar
    ? `http://localhost:3000/${userInfo.avatar}`
    : "/default-avatar.png";

  return (
    <header className="w-full bg-white px-6 py-4 flex justify-end items-center shadow">
      <div className="flex items-center gap-4 text-sm">
        {/* Riwayat Transaksi */}
        <button
          onClick={() => navigate("/cashier/history")}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Riwayat Transaksi
        </button>

        {/* Avatar */}
        <img
          src={avatarUrl}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-avatar.png";
          }}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border"
        />

        {/* Username dan Role */}
        <span className="text-gray-700 font-medium capitalize">
          {userInfo.username} ({userInfo.role})
        </span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
