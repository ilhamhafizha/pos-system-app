import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ username: "", role: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.user) {
      setUserInfo({
        username: user.user.username,
        role: user.user.role,
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">POS Kasir</h1>

      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => navigate("/cashier/history")}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Riwayat Transaksi
        </button>
        <span className="text-gray-700 font-medium capitalize">
          {userInfo.username} ({userInfo.role})
        </span>
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
