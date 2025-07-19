import { useEffect, useState } from "react";
import axios from "axios";
import { FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [filters, setFilters] = useState({
    start: "",
    finish: "",
    category: "",
    orderType: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [meta, setMeta] = useState({ page: 1, perPage: 10, totalPages: 1 });

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:3000/admin/sales-report?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseData = res.data;

      setSales(responseData.data);
      setMeta({
        page: filters.page,
        perPage: filters.limit,
        totalPages: responseData.meta?.totalPages || 1,
        totalData: responseData.meta?.totalData || 0,
      });
    } catch (err) {
      console.error("Gagal fetch sales report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
  };

  const handleReset = () => {
    setFilters({
      start: "",
      finish: "",
      category: "",
      orderType: "",
      search: "",
      page: 1,
      limit: 10,
    });
  };

  const handleExport = async (type) => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const query = new URLSearchParams({ ...filters, export: type }).toString();
    try {
      const res = await axios.get(`http://localhost:3000/admin/sales-report?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-report.${type === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal export:", err);
      alert(`Gagal export ${type.toUpperCase()}`);
    }
  };

  const handleDetailClick = async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(`http://localhost:3000/admin/sales-report/${id}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const receipt = res.data.data;
      if (receipt) {
        navigate("/admin/receipt", { state: { receipt } });
      }
    } catch (err) {
      console.error("Gagal ambil struk:", err);
      alert("Gagal menampilkan detail transaksi.");
    }
  };

  const formatDate = (str) => {
    if (!str) return "-";
    const date = new Date(str);
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Sales Report</h2>

      {/* FILTER CARD */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="flex flex-col">
            <label htmlFor="start" className="text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start"
              name="start"
              value={filters.start}
              onChange={handleInputChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="finish" className="text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="finish"
              name="finish"
              value={filters.finish}
              onChange={handleInputChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              id="category"
              value={filters.category}
              onChange={handleInputChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Category</option>
              <option value="foods">Foods</option>
              <option value="beverages">Beverages</option>
              <option value="dessert">Desserts</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="orderType" className="text-sm font-medium text-gray-700 mb-1">
              Order Type
            </label>
            <select
              name="orderType"
              id="orderType"
              value={filters.orderType}
              onChange={handleInputChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Type</option>
              <option value="dine_in">Dine-in</option>
              <option value="take_away">Take-away</option>
            </select>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Customer name or order number"
              value={filters.search}
              onChange={handleInputChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("excel")}
              className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded-lg hover:bg-green-200"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-200"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="p-3 text-left">No</th>
              <th className="p-3 text-left">Order No</th>
              <th className="p-3 text-left">Order Date</th>
              <th className="p-3 text-left">Order Type</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-center">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6 animate-pulse text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400 italic">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              sales.map((tx, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3">{(meta.page - 1) * meta.perPage + idx + 1}</td>
                  <td className="p-3 font-medium">{tx.order_number}</td>
                  <td className="p-3">{formatDate(tx.createdAt)}</td>
                  <td className="p-3 capitalize">{tx.transaction_type.replace("_", " ")}</td>
                  <td className="p-3">{tx.TransactionItems?.[0]?.Catalog?.category || "-"}</td>
                  <td className="p-3">{tx.customer_name}</td>
                  <td className="p-3 text-center">
                    <FiExternalLink
                      onClick={() => handleDetailClick(tx.id)}
                      className="inline text-blue-500 hover:text-blue-700 cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4 p-4">
          <p className="text-sm text-gray-600">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSales;
