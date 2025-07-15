import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const SalesReport = () => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    fetchSalesSummary();
  }, []);

  const fetchSalesSummary = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get("http://localhost:3000/cashier/sales-summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil sales summary", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCategoryClick = async (category) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(
        `http://localhost:3000/cashier/sales-summary/category/${category}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
    } catch (error) {
      console.error("Gagal ambil detail kategori:", error);
      Swal.fire("Gagal", "Gagal mengambil data kategori", "error");
    }
  };

  return (
    <div className="bg-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {loadingSummary ? (
          <p>Loading summary...</p>
        ) : (
          <>
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-gray-500 text-sm">Total Omzet</h3>
              <p className="text-xl font-semibold text-green-600">
                Rp {summary.total_omzet.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-gray-500 text-sm">Total Order</h3>
              <p className="text-xl font-semibold">{summary.total_order}</p>
            </div>
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-gray-500 text-sm">Total Menu Terjual</h3>
              <p className="text-xl font-semibold">{summary.total_menu_sales}</p>
            </div>

            {/* Klikable kategori */}
            <div
              className="bg-white rounded shadow p-4 cursor-pointer hover:bg-blue-50"
              onClick={() => handleCategoryClick("foods")}
            >
              <h3 className="text-gray-500 text-sm">Foods</h3>
              <p className="text-xl font-semibold">{summary.foods}</p>
            </div>
            <div
              className="bg-white rounded shadow p-4 cursor-pointer hover:bg-blue-50"
              onClick={() => handleCategoryClick("beverages")}
            >
              <h3 className="text-gray-500 text-sm">Beverages</h3>
              <p className="text-xl font-semibold">{summary.beverages}</p>
            </div>
            <div
              className="bg-white rounded shadow p-4 cursor-pointer hover:bg-blue-50"
              onClick={() => handleCategoryClick("dessert")}
            >
              <h3 className="text-gray-500 text-sm">Desserts</h3>
              <p className="text-xl font-semibold">{summary.desserts}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
