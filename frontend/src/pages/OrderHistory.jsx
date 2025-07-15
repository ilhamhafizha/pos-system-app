import { useNavigate } from "react-router-dom";
import History from "../components/History";

const CashierLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <p className="text-2xl font-bold mb-4">Riwayat Transaksi</p>

      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800"
      >
        Kembali
      </button>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <History />
      </div>
    </div>
  );
};

export default CashierLayout;