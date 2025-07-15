const SettingPage = () => {
  const user = JSON.parse(localStorage.getItem("user"))?.user;

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Pengaturan Akun</h2>
      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Username:</span> {user?.username || "-"}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user?.email || "-"}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {user?.role || "-"}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {user?.status || "-"}
        </p>
        <p>
          <span className="font-semibold">Bahasa:</span> Indonesia
        </p>
      </div>

      <div className="mt-6">
        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          onClick={() => alert("Fitur ubah password belum tersedia")}
        >
          Ubah Password
        </button>
      </div>
    </div>
  );
};

export default SettingPage;