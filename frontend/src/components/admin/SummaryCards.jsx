import Swal from "sweetalert2";
import axios from "axios";

const SummaryCards = ({ data }) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const handleCategoryClick = async (categoryKey, endpointParam) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/admin/dashboard/category/${endpointParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const menus = res.data?.data || [];

      if (menus.length === 0) {
        Swal.fire("Info", `Tidak ada data untuk kategori ${endpointParam}`, "info");
        return;
      }

      const htmlList = menus
        .map(
          (item) =>
            `<li class="flex justify-between"><span>${item.name}</span><span>${item.total_sold} terjual</span></li>`
        )
        .join("");

      Swal.fire({
        title: `Detail ${endpointParam.charAt(0).toUpperCase() + endpointParam.slice(1)}`,
        html: `<ul class="text-left text-sm space-y-1">${htmlList}</ul>`,
        confirmButtonText: "Tutup",
      });
    } catch (err) {
      console.error("Gagal ambil data kategori:", err);
      Swal.fire("Gagal", "Gagal mengambil data kategori", "error");
    }
  };

  const categoryMap = [
    { label: "Foods", key: "foods", endpoint: "foods" },
    { label: "Beverages", key: "beverages", endpoint: "beverages" },
    { label: "Desserts", key: "deserts", endpoint: "dessert" }, // ✅ mapping khusus
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {/* Total Omzet */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-gray-500 text-sm">Total Omzet</h3>
        <p className="text-xl font-semibold text-green-600">
          Rp{" "}
          {(data?.totalOmzet ? data.totalOmzet / 1.1 : 0).toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Total Order */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-gray-500 text-sm">Total Order</h3>
        <p className="text-xl font-semibold">{data?.totalOrders?.toLocaleString("id-ID") || 0}</p>
      </div>

      {/* Total Menu Terjual */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-gray-500 text-sm">Total Menu Terjual</h3>
        <p className="text-xl font-semibold">{data?.allMenuOrders?.toLocaleString("id-ID") || 0}</p>
      </div>

      {/* Kategori: Foods, Beverages, Desserts */}
      {categoryMap.map(({ label, key, endpoint }) => (
        <div
          key={key}
          className="bg-white rounded shadow p-4 cursor-pointer hover:bg-blue-50"
          onClick={() => handleCategoryClick(key, endpoint)}
        >
          <h3 className="text-gray-500 text-sm">{label}</h3>
          <p className="text-xl font-semibold">{data?.[key]?.toLocaleString("id-ID") || 0}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
