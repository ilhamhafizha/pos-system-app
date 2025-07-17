import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { FaHistory } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import Swal from "sweetalert2"; // Import SweetAlert2

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState({
    username: "",
    role: "",
    avatar: "",
  });

  const handleAvatarClick = () => {
    navigate("/cashier/setting");
  };

  useEffect(() => {
    if (user?.user) {
      setUserInfo({
        username: user.user.username,
        role: user.user.role,
        avatar: user.user.avatar,
      });
    }
  }, [user]);

  // Handle Logout dengan SweetAlert2
  const handleLogout = () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan keluar dari aplikasi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        logout(); // Logout jika dikonfirmasi
        Swal.fire("Berhasil!", "Anda telah logout.", "success");
        navigate("/login"); // Redirect ke halaman login setelah logout
      }
    });
  };

  const avatarUrl = userInfo.avatar
    ? `http://localhost:3000/${userInfo.avatar}`
    : "/default-avatar.png";

  return (
    <header className="w-full bg-white px-6 py-4 flex justify-between items-center shadow">
      {/* Riwayat Transaksi (berada di kiri) */}
      <div
        onClick={() => navigate("/cashier/history")}
        className="text-gray-700 cursor-pointer hover:text-gray-900"
      >
        <FaHistory size={24} />
      </div>

      {/* Info User dan Avatar (berada di kanan) */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex justify-center items-center py-0.5">
          <img
            src={avatarUrl}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border cursor-pointer"
            onClick={handleAvatarClick}
          />
        </div>

        {/* Username dan Role */}
        <span className="text-gray-700 font-medium capitalize">
          {userInfo.username} ({userInfo.role})
        </span>

        {/* Logout Icon */}
        <div onClick={handleLogout} className="cursor-pointer text-red-500">
          <FaSignOutAlt size={24} />
        </div>
      </div>
    </header>
  );
};

export default Header;
