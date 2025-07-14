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

  return (
    <div className="p-6 max-w-md mx-auto font-sans">
      <h2 className="text-xl font-bold mb-4">Struk Pembayaran</h2>

      {isFromHistory ? (
        <>
          <p>Order: {receipt.order_number}</p>
          <p>Customer: {receipt.customer_name}</p>
          {receipt.table && <p>Meja: {receipt.table}</p>}
          <p>Tipe: {receipt.transaction_type?.replace("_", " ")}</p>

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
              <span>PPN</span>
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
          <div className="mt-4 border-t pt-2 text-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span>Rp {receipt.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar</span>
              <span>Rp {receipt.cash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembalian</span>
              <span>Rp {receipt.change.toLocaleString()}</span>
            </div>
          </div>
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
