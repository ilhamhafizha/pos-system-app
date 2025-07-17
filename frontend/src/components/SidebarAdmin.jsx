import { useNavigate, useLocation } from "react-router-dom";

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "List Menu", path: "/admin/list" },
    { name: "Sales Report", path: "/admin/sales" },
    { name: "Settings", path: "/admin/setting" },
  ];

  return (
    <aside className="w-52 min-h-screen bg-white shadow-md p-4">
      <h2 className="text-xl font-bold text-blue-600 mb-6">POS Admin</h2>

      <ul className="space-y-2">
        {menus.map((menu) => (
          <li key={menu.path}>
            <button
              onClick={() => navigate(menu.path)}
              className={`w-full text-left px-3 py-2 rounded hover:bg-blue-100 font-medium 
              ${location.pathname === menu.path ? "bg-blue-500 text-white" : "text-gray-700"}`}
            >
              {menu.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SidebarAdmin;
