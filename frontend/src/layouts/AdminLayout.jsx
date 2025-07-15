import { Outlet } from "react-router-dom";
import HeaderAdmin from "../components/HeaderAdmin";
import SidebarAdmin from "../components/SidebarAdmin";

const AdminLayout = () => {
  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1 min-h-screen bg-gray-100">
        <HeaderAdmin />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
