import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotePopup from "../components/NotePopup";

const CashierDashboard = () => {
  const [selectedMenuForNote, setSelectedMenuForNote] = useState(null);
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [orderType, setOrderType] = useState("dine_in");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [cashAmount, setCashAmount] = useState("");
  const [change, setChange] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.get("http://localhost:3000/cashier/dashboard/menus", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data;
      if (Array.isArray(data)) {
        const updatedMenus = data.map((menu) => ({
          ...menu,
          image: menu.image ? `http://localhost:3000/uploads/${menu.image}` : "/placeholder.jpg", // fallback kalau tidak ada gambar
        }));
        setMenus(updatedMenus);
      } else {
        console.warn("Format data tidak sesuai");
      }
    } catch (err) {
      console.error("Gagal ambil menu:", err?.response?.data || err.message);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;

      const body = {
        customer_name: customerName,
        transaction_type: orderType,
        table: orderType === "dine_in" ? tableNumber : "take away", // ⬅️ otomatis isi
      };

      console.log("Body yang dikirim:", body);

      const res = await axios.post("http://localhost:3000/cashier/dashboard/orders", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const createdOrderId = res.data?.data?.id;
      if (createdOrderId) {
        setOrderId(createdOrderId);
        setOrderItems([]);
      }
    } catch (err) {
      console.error("Gagal buat order:", err?.response?.data || err.message);
    }
  };

  const handleAddToOrder = async (menu, note = "") => {
    if (!orderId) return;

    const existingItem = orderItems.find((item) => item.catalog.id === menu.id);
    const quantity = existingItem ? existingItem.quantity + 1 : 1;

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const res = await axios.post(
        `http://localhost:3000/cashier/dashboard/orders/${orderId}/items`,
        {
          catalog_id: menu.id,
          quantity,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const itemId = res.data?.data?.id;

      if (existingItem) {
        setOrderItems((prev) =>
          prev.map((item) => (item.catalog.id === menu.id ? { ...item, quantity, note } : item))
        );
      } else {
        const newItem = {
          id: itemId,
          quantity,
          note,
          catalog: menu,
        };
        setOrderItems((prev) => [...prev, newItem]);
      }
    } catch (err) {
      console.error("Gagal tambah menu:", err?.response?.data || err.message);
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;

    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      const item = orderItems.find((item) => item.id === itemId);
      if (!item) return;

      await axios.post(
        `http://localhost:3000/cashier/dashboard/orders/${orderId}/items`,
        {
          catalog_id: item.catalog.id, // harus kirim catalog_id, bukan item_id
          quantity: newQty,
          note: item.note || "", // tetap kirim note (jika backend butuh)
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrderItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
      );
    } catch (err) {
      console.error("Gagal update quantity:", err?.response?.data || err.message);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;
      await axios.delete(`http://localhost:3000/cashier/dashboard/orders/${itemId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { item_id: itemId }, // 👈 body
      });

      setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Gagal hapus item:", err?.response?.data || err.message);
    }
  };

  const handlePayment = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;

      // Hitung subtotal dari semua item
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.quantity * parseInt(item.catalog?.price),
        0
      );

      // Hitung PPN dan total
      const tax = Math.round(subtotal * 0.1); // 10%
      const total = subtotal + tax;

      // Ambil input cash dan ubah jadi angka
      const cash = parseInt(cashAmount.toString().replace(/\D/g, ""), 10);

      // Validasi uang cash cukup
      if (isNaN(cash) || cash < total) {
        alert("Uang cash tidak cukup");
        return;
      }

      // Kirim ke backend
      await axios.put(
        `http://localhost:3000/cashier/dashboard/orders/${orderId}/pay`,
        { cash },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Set kembalian dan struk
      const kembalian = cash - total;
      setChange(kembalian);

      const res = await axios.get(
        `http://localhost:3000/cashier/dashboard/orders/${orderId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const receiptData = res.data?.data;

      setReceipt({
        order_number: receiptData.order_number,
        customer: receiptData.customer_name,
        table: receiptData.table !== "take away" ? receiptData.table : null,
        items: receiptData.items.map((item) => ({
          quantity: item.quantity,
          catalog: { name: item.menu, price: item.price },
        })),
        subtotal: receiptData.subtotal,
        tax: receiptData.tax,
        total: receiptData.total,
        cash: receiptData.cash,
        change: receiptData.cashback,
        createdAt: receiptData.createdAt,
      });
    } catch (err) {
      console.error("Gagal bayar:", err?.response?.data || err.message);
      alert(`Gagal bayar: ${err?.response?.data?.message || err.message}`);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-[70%] p-6">
          <h2 className="text-2xl font-bold mb-4">Daftar Menu</h2>
          <div className="mb-4 flex gap-2">
            {["all", "foods", "beverages", "dessert"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded font-semibold capitalize 
        ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {cat === "all" ? "All Menu" : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {menus.length === 0 && (
              <p className="col-span-3 text-center text-gray-500">Tidak ada menu tersedia</p>
            )}
            {menus
              .filter((menu) =>
                selectedCategory === "all" ? true : menu.category === selectedCategory
              )
              .map((menu) => (
                <div key={menu.id} className="relative bg-white p-4 rounded-xl shadow-md">
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full capitalize">
                    {menu.category}
                  </div>
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-40 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                  <h3 className="text-lg font-semibold mt-2">{menu.name}</h3>
                  <p className="text-sm mt-1 text-gray-600">{menu.description}</p>
                  <p className="text-md font-bold mt-2 text-green-600">
                    Rp {parseInt(menu.price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => setSelectedMenuForNote(menu)}
                    disabled={!orderId}
                    className={`mt-3 w-full text-white py-1 rounded 
                    ${
                      orderId ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 cursor-not-allowed"
                    }`}
                  >
                    Tambah
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="w-[30%] p-6 bg-white shadow-md rounded-l-xl">
          <h2 className="text-xl font-bold mb-4">Buat Order</h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setOrderType("dine_in")}
              className={`flex-1 py-2 rounded text-white font-semibold 
            ${orderType === "dine_in" ? "bg-blue-500" : "bg-gray-300"}`}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType("take_away")}
              className={`flex-1 py-2 rounded text-white font-semibold 
            ${orderType === "take_away" ? "bg-blue-500" : "bg-gray-300"}`}
            >
              Take Away
            </button>
          </div>

          <input
            type="text"
            placeholder="Nama Customer"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />

          {orderType === "dine_in" && (
            <input
              type="text"
              placeholder="Nomor Meja"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />
          )}

          <p className="text-sm text-gray-500 mb-2">
            👈 Pilih menu dari sebelah kiri untuk menambahkan pesanan.
          </p>

          <button
            onClick={handleCreateOrder}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !customerName || (orderType === "dine_in" && !tableNumber) || orderId !== null
            }
          >
            {orderId ? "Order Dibuat" : "Buat Order"}
          </button>

          {orderItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-bold mb-2">Item Dipesan</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {orderItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between border-b pb-1">
                    <div>
                      <div className="font-semibold">{item.catalog?.name}</div>
                      {item.note && (
                        <div className="text-xs text-gray-500">Catatan: {item.note}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 bg-gray-300 rounded"
                        >
                          –
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 bg-gray-300 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="ml-2 text-red-500 text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    <span>
                      Rp {(item.quantity * parseInt(item.catalog?.price)).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 font-bold flex justify-between">
                <span>Total</span>
                <span>
                  Rp{" "}
                  {orderItems
                    .reduce((sum, item) => sum + item.quantity * parseInt(item.catalog?.price), 0)
                    .toLocaleString()}
                </span>
              </div>

              <div className="mt-4">
                <input
                  type="number"
                  placeholder="Uang Customer"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Bayar Sekarang
                </button>
              </div>

              {change !== null && (
                <div className="mt-2 text-green-600 font-semibold">
                  Kembalian: Rp {change.toLocaleString()}
                </div>
              )}

              {receipt && (
                <div className="mt-6 border-t pt-4 text-sm text-gray-800">
                  <h4 className="font-bold mb-2">Struk Belanja</h4>
                  <p>Customer: {receipt.customer}</p>
                  {receipt.table && <p>Meja: {receipt.table}</p>}

                  <ul className="mt-2 space-y-1">
                    {receipt.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {item.catalog?.name} x {item.quantity}
                        </span>
                        <span>
                          Rp {(item.quantity * parseInt(item.catalog?.price)).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* ✅ Hitung nilai PPN dan subtotal */}
                  {(() => {
                    const total = receipt.total || 0;
                    const subtotal = Math.round(total / 1.1); // 10% PPN
                    const tax = total - subtotal;
                    const cash = receipt.cash || 0;
                    const change = receipt.change || 0;

                    return (
                      <div className="mt-4 border-t pt-2 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>Rp {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PPN</span>
                          <span>Rp {tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>Rp {total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bayar</span>
                          <span>Rp {cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-bold">
                          <span>Kembalian</span>
                          <span>Rp {change.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ✅ Tombol cetak struk */}
                  <button
                    onClick={() =>
                      navigate(`/cashier/receipt/${receipt.order_number}`, {
                        state: { ...receipt, createdAt: new Date().toISOString() },
                      })
                    }
                    className="mt-4 w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
                  >
                    Cetak Struk
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedMenuForNote && ( // ⭐️
          <NotePopup
            menu={selectedMenuForNote}
            onClose={() => setSelectedMenuForNote(null)}
            onConfirm={(note) => {
              handleAddToOrder(selectedMenuForNote, note);
              setSelectedMenuForNote(null);
            }}
          />
        )}
      </div>
    </>
  );
};

export default CashierDashboard;
