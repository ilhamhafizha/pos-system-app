import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios"; // Pastikan ini sesuai path kamu
import { FiSearch } from "react-icons/fi";
import { FaFileInvoice } from "react-icons/fa";
import ReceiptPopup from "../components/ReceiptPopup";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const getOrders = async () => {
    try {
      const res = await axios.get("/cashier/sales-report");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Gagal ambil histori:", err);
    }
  };

  const openReceipt = async (id) => {
    try {
      const res = await axios.get(`/cashier/sales-report/${id}/receipt`);
      setSelectedReceipt(res.data.data);
      setIsPopupOpen(true);
    } catch (err) {
      console.error("Gagal ambil struk:", err);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Histori Order</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">No Order</th>
              <th className="p-2 text-left">Tipe</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Meja</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-center">Detail</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.order_number}</td>
                <td className="p-2 capitalize">{item.transaction_type}</td>
                <td className="p-2">{item.customer_name}</td>
                <td className="p-2">{item.table || "-"}</td>
                <td className="p-2">Rp{item.total.toLocaleString()}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => openReceipt(item.id)}
                    className="text-blue-600 hover:underline"
                  >
                    <FaFileInvoice size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup struk */}
      <ReceiptPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        receiptData={selectedReceipt}
      />
    </div>
  );
};

export default OrderHistory;
