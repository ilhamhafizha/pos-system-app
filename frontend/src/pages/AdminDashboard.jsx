import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import SummaryCards from "../components/admin/SummaryCards";
import OmzetChart from "../components/admin/OmzetChart";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  useEffect(() => {
    fetchSummary();
    fetchChartData();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil ringkasan admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/dashboard/chart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChartData(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil data chart:", error);
    }
  };

  const handleCategoryClick = async (category) => {
    try {
      const res = await axios.get(`http://localhost:3000/admin/dashboard/category/${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const menus = res.data?.data || [];

      if (menus.length === 0) {
        Swal.fire("Info", `Tidak ada data untuk kategori ${category}`, "info");
        return;
      }

      const htmlList = menus
        .map(
          (item) =>
            `<li class="flex justify-between"><span>${item.name}</span><span>${item.total_sold} terjual</span></li>`
        )
        .join("");

      Swal.fire({
        title: `Detail ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        html: `<ul class="text-left text-sm space-y-1">${htmlList}</ul>`,
        confirmButtonText: "Tutup",
      });
    } catch (err) {
      console.error("Gagal ambil detail kategori:", err);
      Swal.fire("Gagal", "Gagal mengambil data kategori", "error");
    }
  };

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Dashboard Admin</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <SummaryCards data={summary} onCategoryClick={handleCategoryClick} />
      )}
      <OmzetChart data={chartData} />
    </div>
  );
};

export default AdminDashboard;
