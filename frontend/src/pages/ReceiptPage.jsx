import { useLocation, useNavigate } from "react-router-dom";

const ReceiptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const receipt = location.state?.receipt;

  if (!receipt) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Data struk tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Kembali
        </button>
      </div>
    );
  }

  const isFromHistory = receipt.customer_name !== undefined;

  const formatFullDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const dateUTC = new Date(dateStr);
    const offsetMs = 7 * 60 * 60 * 1000; // GMT+7
    const localDate = new Date(dateUTC.getTime() + offsetMs);

    const datePart = localDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const timePart = localDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${datePart} ${timePart}`;
  };

  const formatFullDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto font-sans">
      <h2 className="text-xl font-bold mb-4">Struk Pembayaran</h2>

      {isFromHistory ? (
        <>
          <p>
            Order: <b>{receipt.order_number}</b>
          </p>
          <p>
            Tanggal Order: <b>{formatFullDateTime(receipt.createdAt)}</b>
          </p>
          <p>
            Customer: <b>{receipt.customer_name}</b>
          </p>
          {receipt.table && (
            <p>
              Meja: <b>{receipt.table}</b>
            </p>
          )}
          <p>
            Tipe: <b>{receipt.transaction_type?.replace("_", " ")}</b>
          </p>

          <ul className="mt-4 space-y-1 border-t pt-2 text-sm">
            {receipt.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {item.menu} x {item.quantity}
                </span>
                <span>Rp {parseInt(item.subtotal).toLocaleString()}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {parseInt(receipt.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>PPN (10%)</span>
              <span>Rp {parseInt(receipt.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>Rp {parseInt(receipt.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar</span>
              <span>Rp {parseInt(receipt.cash).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600 font-bold">
              <span>Kembalian</span>
              <span>Rp {parseInt(receipt.cashback).toLocaleString()}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <p>Customer: {receipt.customer}</p>
          {receipt.table && <p>Meja: {receipt.table}</p>}
          <p>
            Tanggal Order:{" "}
            <b>
              {formatFullDate(receipt.createdAt ?? (receipt.createdAt = new Date().toISOString()))}
            </b>
          </p>

          <ul className="mt-4 space-y-1 border-t pt-2 text-sm">
            {receipt.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {item.catalog.name} x {item.quantity}
                </span>
                <span>Rp {(item.quantity * parseInt(item.catalog.price)).toLocaleString()}</span>
              </li>
            ))}
          </ul>

          {/* Hitung subtotal & tax secara manual */}
          {(() => {
            const subtotal = receipt.items.reduce(
              (sum, item) => sum + item.quantity * parseInt(item.catalog.price),
              0
            );
            const tax = Math.round(subtotal * 0.1);
            const total = subtotal + tax;
            const change = receipt.cash - total;

            return (
              <div className="mt-4 border-t pt-2 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN (10%)</span>
                  <span>Rp {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>Rp {receipt.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Kembalian</span>
                  <span>Rp {change.toLocaleString()}</span>
                </div>
              </div>
            );
          })()}
        </>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
      >
        Kembali
      </button>
    </div>
  );
};

export default ReceiptPage;
