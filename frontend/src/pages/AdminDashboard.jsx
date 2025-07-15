const AdminDashboard = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Selamat Datang, Admin!</h1>
      <p className="text-gray-600">
        Ini adalah halaman dashboard admin. Di sini kamu bisa melihat ringkasan penjualan, performa
        menu, dan lainnya.
      </p>

      {/* Contoh konten tambahan */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-blue-700">Total Penjualan Hari Ini</h2>
          <p className="text-2xl font-bold mt-2">Rp 2.300.000</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-green-700">Jumlah Transaksi</h2>
          <p className="text-2xl font-bold mt-2">124</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
