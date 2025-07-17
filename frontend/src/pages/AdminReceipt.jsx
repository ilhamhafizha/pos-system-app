// src/pages/AdminReceipt.jsx
import { useLocation, useNavigate } from "react-router-dom";

const AdminReceipt = () => {
  const { state } = useLocation();
  const receipt = state?.receipt;
  const navigate = useNavigate();

  if (!receipt) return <div className="p-6">Data tidak ditemukan</div>;

  const formatCurrency = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);

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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 hover:underline text-sm">
        ← Kembali
      </button>

      <h2 className="text-2xl font-semibold mb-2">Struk Transaksi</h2>
      <p className="text-sm text-gray-600 mb-4">{formatDate(receipt.createdAt)}</p>

      <div className="mb-4">
        <p>
          <strong>No Order:</strong> {receipt.order_number}
        </p>
        <p>
          <strong>Customer:</strong> {receipt.customer_name || "-"}
        </p>
        <p>
          <strong>Tipe:</strong> {receipt.transaction_type.replace("_", " ")}
        </p>
        <p>
          <strong>Table:</strong> {receipt.table}
        </p>
        <p>
          <strong>Kasir:</strong> {receipt.user?.username}
        </p>
      </div>

      <hr className="my-3" />

      <div className="mb-4">
        <p className="font-semibold mb-2">Item Pesanan:</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Menu</th>
              <th>Kategori</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {receipt.TransactionItems.map((item) => (
              <tr key={item.id} className="border-b">
                <td>{item.Catalog.name}</td>
                <td>{item.Catalog.category}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.subtotal)}</td>
                <td>{item.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-3" />

      <div className="text-sm">
        <p>Subtotal: {formatCurrency(receipt.subtotal_group)}</p>
        <p>Pajak (10%): {formatCurrency(receipt.tax)}</p>
        <p className="font-bold">Total: {formatCurrency(receipt.total)}</p>
        <p>Bayar: {formatCurrency(receipt.cash)}</p>
        <p>Kembalian: {formatCurrency(receipt.cashback)}</p>
      </div>
    </div>
  );
};

export default AdminReceipt;
