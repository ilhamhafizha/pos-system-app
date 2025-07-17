import { useEffect, useState } from "react";
import axios from "axios";
import { FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [sales, setSales] = useState([]);
  const [filters, setFilters] = useState({
    customer_name: "",
    transaction_type: "",
    category: "",
    start: "",
    finish: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchSales();
  };

  const handleReset = () => {
    setFilters({
      customer_name: "",
      transaction_type: "",
      category: "",
      start: "",
      finish: "",
    });
    fetchSales();
  };

  const handleExport = async (type) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const query = new URLSearchParams({ ...filters, export: type }).toString();
      const res = await axios.get(`http://localhost:3000/cashier/sales-report?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cashier-sales-report.${type === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal export:", err);
      alert("Export gagal!");
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:3000/cashier/sales-report?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⬇️ Tambahkan console.log di sini
      console.log("Sales response:", res.data.data);

      setSales(res.data.data || []);
    } catch (err) {
      console.error("Gagal fetch sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailClick = async (orderNumber) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(`http://localhost:3000/cashier/sales-report/${orderNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;

      // Format data supaya sesuai struktur ReceiptPage
      const formattedReceipt = {
        order_number: data.order_number,
        createdAt: data.createdAt,
        customer_name: data.customer_name,
        table: data.table,
        transaction_type: data.transaction_type,
        subtotal: data.subtotal_group,
        tax: data.tax,
        total: data.total,
        cash: data.cash,
        cashback: data.cashback,
        items: data.TransactionItems.map((item) => ({
          menu: item.Catalog.name,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      };

      navigate(`/cashier/receipt/${orderNumber}`, {
        state: { receipt: formattedReceipt },
      });
    } catch (error) {
      console.error("Gagal ambil struk:", error);
      alert("Gagal mengambil detail transaksi!");
    }
  };

  const formatDate = (str) => {
    if (!str) return "-";
    const date = new Date(str);

    // Tambah offset +7 jam untuk WIB
    const offsetInMs = 7 * 60 * 60 * 1000;
    const wibDate = new Date(date.getTime() + offsetInMs);

    const day = wibDate.getDate().toString().padStart(2, "0");
    const month = wibDate.toLocaleString("id-ID", { month: "long" });
    const year = wibDate.getFullYear();
    const hours = wibDate.getHours().toString().padStart(2, "0");
    const minutes = wibDate.getMinutes().toString().padStart(2, "0");
    const seconds = wibDate.getSeconds().toString().padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Customer</label>
            <input
              type="text"
              name="customer_name"
              value={filters.customer_name}
              onChange={handleInputChange}
              placeholder="Nama Customer"
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Tipe Order</label>
            <select
              name="transaction_type"
              value={filters.transaction_type}
              onChange={handleInputChange}
              className="border rounded px-2 py-1"
            >
              <option value="">Semua</option>
              <option value="dine_in">Dine In</option>
              <option value="take_away">Take Away</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Kategori</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleInputChange}
              className="border rounded px-2 py-1"
            >
              <option value="">Semua</option>
              <option value="foods">Foods</option>
              <option value="beverages">Beverages</option>
              <option value="dessert">Desserts</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              name="start"
              value={filters.start}
              onChange={handleInputChange}
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              name="finish"
              value={filters.finish}
              onChange={handleInputChange}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cari
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={() => handleExport("excel")}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded hover:bg-green-200"
          >
            Export Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded hover:bg-red-200"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="p-3 text-left">No</th>
              <th className="p-3 text-left">No Order</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Tipe</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-center">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400 italic">
                  Tidak ada transaksi ditemukan.
                </td>
              </tr>
            ) : (
              sales.map((tx, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-medium">{tx.order_number}</td>
                  <td className="p-3">{formatDate(tx.createdAt)}</td>
                  <td className="p-3 capitalize">{tx.transaction_type.replace("_", " ")}</td>
                  <td className="p-3">{tx.customer_name}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        console.log("Klik detail, order_number:", tx.order_number);
                        handleDetailClick(tx.order_number); // Ganti sesuai key yang benar
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Lihat Struk"
                    >
                      <FiExternalLink className="text-xl inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
