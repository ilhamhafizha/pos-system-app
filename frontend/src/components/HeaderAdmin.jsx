import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const HeaderAdmin = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    username: "",
    role: "",
    avatar: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.user) {
      setUserInfo({
        username: user.user.username,
        role: user.user.role,
        avatar: user.user.avatar,
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white px-6 py-4 flex justify-end items-center">
      <div className="flex items-center gap-4 text-sm">
        {/* Avatar */}
        <img
          src={userInfo.avatar ? `http://localhost:3000/${userInfo.avatar}` : "/default-avatar.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border"
        />

        {/* Username dan Role */}
        <span className="text-gray-700 font-medium capitalize">
          {userInfo.username} ({userInfo.role})
        </span>

        {/* Logout Button */}
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

export default HeaderAdmin;
