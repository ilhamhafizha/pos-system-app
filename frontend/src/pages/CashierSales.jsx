import History from "../components/History";
import SalesReport from "../components/SalesReport";

const CashierSales = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <SalesReport />
      <div>
        <p className="text-2xl font-bold mb-4">Sales Report</p>
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <History />
        </div>
      </div>
    </div>
  );
};

export default CashierSales;
