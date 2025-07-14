import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import CashierDashboard from "../pages/CashierDashboard";
import ReceiptPage from "../pages/ReceiptPage"; // pastikan path ses
import OrderHistory from "../pages/OrderHistory"; //

// Tambahkan di dalam <Routes>
const AdminDashboard = () => <div className="p-10 text-xl">Admin Dashboard</div>;
// const CashierDashboard = () => <div className="p-10 text-xl">Cashier Dashboard</div>;

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cashier/dashboard" element={<CashierDashboard />} />
        <Route path="/cashier/receipt" element={<ReceiptPage />} />;
        <Route path="/cashier/history" element={<OrderHistory />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
