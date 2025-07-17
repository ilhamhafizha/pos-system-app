import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import CashierDashboard from "../pages/CashierDashboard";
import ReceiptPage from "../pages/ReceiptPage";
import OrderHistory from "../pages/OrderHistory";
import CashierSales from "../pages/CashierSales";
import SettingPage from "../pages/SettingPage";

import AdminDashboard from "../pages/AdminDashboard";
import AdminList from "../pages/AdminList";
import AdminSales from "../pages/AdminSales";
import AdminSetting from "../pages/AdminSetting";
import AdminReceipt from "../pages/AdminReceipt";

import AdminLayout from "../layouts/AdminLayout";
import CashierLayout from "../layouts/CashierLayout";

import PrivateRoute from "../components/PrivateRoute"; // ⬅️ Tambahkan ini
import Unauthorized from "../pages/Unauthorized"; // ⬅️ Tambahkan halaman unauthorized jika belum ada

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin only */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="list" element={<AdminList />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="setting" element={<AdminSetting />} />
            <Route path="receipt" element={<AdminReceipt />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["cashier"]} />}>
          <Route path="/cashier" element={<CashierLayout />}>
            <Route path="dashboard" element={<CashierDashboard />} />
            <Route path="sales" element={<CashierSales />} />
            <Route path="setting" element={<SettingPage />} />
            <Route path="receipt/:orderNumber" element={<ReceiptPage />} />
            <Route path="history" element={<OrderHistory />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
