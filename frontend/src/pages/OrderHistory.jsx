import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ⭐️

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate(); // ⭐️

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get("http://localhost:3000/cashier/dashboard/orders/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data?.data || []);
    } catch (err) {
      console.error("Gagal ambil histori order:", err);
    }
  };

  const handleDetailClick = async (orderId) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(
        `http://localhost:3000/cashier/dashboard/orders/${orderId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const receipt = res.data?.data;
      if (receipt) {
        navigate("/cashier/receipt", { state: { receipt } });
      }
    } catch (err) {
      console.error("Gagal ambil struk:", err);
      alert("Gagal menampilkan detail transaksi.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Riwayat Transaksi</h2>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">No Order</th>
              <th className="p-3">Tipe</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Meja</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Detail</th> {/* ⭐️ */}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  Tidak ada riwayat transaksi.
                </td>
              </tr>
            )}
            {orders.map((order, index) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{order.order_number}</td>
                <td className="p-3 capitalize">{order.transaction_type.replace("_", " ")}</td>
                <td className="p-3">{order.customer_name}</td>
                <td className="p-3">{order.table}</td>
                <td className="p-3 text-right">Rp {parseInt(order.total || 0).toLocaleString()}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDetailClick(order.id)} // ⭐️
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;