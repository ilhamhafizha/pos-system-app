import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const dateUTC = new Date(dateStr);
    const offsetMs = 7 * 60 * 60 * 1000;
    const localDate = new Date(dateUTC.getTime() + offsetMs);

    return localDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">No</th>
            <th className="p-3">No Order</th>
            <th className="p-3">Tanggal</th>
            <th className="p-3">Tipe</th>
            <th className="p-3">Customer</th>
            <th className="p-3 text-center">Detail</th>
          </tr>
        </thead>

        <tbody>
          {currentOrders.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                Tidak ada riwayat transaksi.
              </td>
            </tr>
          )}
          {currentOrders.map((order, index) => (
            <tr key={order.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{indexOfFirst + index + 1}</td>
              <td className="p-3 font-medium">{order.order_number}</td>
              <td className="p-3">{formatDate(order.createdAt)}</td>
              <td className="p-3 capitalize">{order.transaction_type.replace("_", " ")}</td>
              <td className="p-3">{order.customer_name}</td>
              <td className="p-3 text-center">
                <button
                  onClick={() => handleDetailClick(order.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Pagination Buttons */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      )}
    </>
  );
};

export default OrderHistory;
