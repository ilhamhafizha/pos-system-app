import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Misal: ORD-3EC2B038
  const [receipt, setReceipt] = useState(location.state?.receipt || null);
  const [loading, setLoading] = useState(!receipt);

  useEffect(() => {
    if (!receipt) {
      fetchReceipt();
    }
  }, []);

  const fetchReceipt = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get(`http://localhost:3000/cashier/sales-report/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;

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

      setReceipt(formattedReceipt);
      setLoading(false);
    } catch (err) {
      console.error("Gagal ambil data struk:", err);
      setLoading(false);
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

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Memuat data struk...</div>;
  }

  if (!receipt) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg text-gray-500 mb-4">Data struk tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-4">Struk Transaksi</h1>
      <p>
        No. Order: <strong>{receipt.order_number}</strong>
      </p>
      <p>Tanggal: {formatDate(receipt.createdAt)}</p>
      <p>Customer: {receipt.customer_name || "-"}</p>
      <p>Tipe: {receipt.transaction_type.replace("_", " ")}</p>
      {receipt.transaction_type === "dine_in" && <p>Meja: {receipt.table || "-"}</p>}
      <hr className="my-4" />

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-2">Menu</th>
            <th className="pb-2">Qty</th>
            <th className="pb-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.menu}</td>
              <td>{item.quantity}</td>
              <td>Rp{item.subtotal.toLocaleString("id-ID")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="my-4" />
      <div className="text-sm">
        <p>Subtotal: Rp{receipt.subtotal.toLocaleString("id-ID")}</p>
        <p>Tax: Rp{receipt.tax.toLocaleString("id-ID")}</p>
        <p className="font-semibold">Total: Rp{receipt.total.toLocaleString("id-ID")}</p>
        <p>Bayar: Rp{receipt.cash.toLocaleString("id-ID")}</p>
        <p>Kembali: Rp{receipt.cashback.toLocaleString("id-ID")}</p>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Kembali
      </button>
    </div>
  );
};

export default ReceiptPage;
