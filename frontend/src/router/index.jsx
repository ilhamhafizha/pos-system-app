import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import CashierDashboard from "../pages/CashierDashboard";
import ReceiptPage from "../pages/ReceiptPage";
import OrderHistory from "../pages/OrderHistory";
import CashierSales from "../pages/CashierSales";

import SettingPage from "../pages/SettingPage"; // pastikan file ini sudah ada
import CashierLayout from "../layouts/CashierLayout"; // ⬅️ layout baru
import AdminLayout from "../layouts/AdminLayout"; // ⬅️ layout baru
import AdminDashboard from "../pages/AdminDashboard";
import AdminList from "../pages/AdminList";
import AdminSales from "../pages/AdminSales";
import AdminSetting from "../pages/AdminSetting";
import AdminReceipt from "../pages/AdminReceipt";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ⬇️ Semua halaman kasir berada di dalam layout Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="list" element={<AdminList />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="setting" element={<AdminSetting />} />
          <Route path="/admin/receipt" element={<AdminReceipt />} />
        </Route>

        <Route path="/cashier/history" element={<OrderHistory />} />
        {/* ⬇️ Semua halaman kasir berada di dalam layout CashierLayout */}
        <Route element={<CashierLayout />}>
          <Route path="/cashier/dashboard" element={<CashierDashboard />} />
          <Route path="/cashier/sales" element={<CashierSales />} />
          <Route path="/cashier/setting" element={<SettingPage />} />
          <Route path="/cashier/receipt/:orderNumber" element={<ReceiptPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
