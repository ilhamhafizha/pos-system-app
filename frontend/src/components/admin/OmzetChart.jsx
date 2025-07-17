import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { parseISO } from "date-fns";

const OmzetChart = ({ data }) => {
  const formatToWIB = (value, withDay = false) => {
    try {
      const utcDate = parseISO(value); // contoh: "2025-07-15 05:01:46.370000"
      const wibDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000); // tambah 7 jam

      return new Intl.DateTimeFormat("id-ID", {
        timeZone: "UTC",
        weekday: withDay ? "long" : undefined,
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(wibDate);
    } catch (err) {
      console.error("Date parsing error:", err);
      return value;
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Diagram Penjualan per Tanggal</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" tickFormatter={(value) => formatToWIB(value)} />
          <YAxis />
          <Tooltip labelFormatter={(value) => formatToWIB(value, true)} />
          <Legend />
          <Bar dataKey="foods" fill="#0E43AF" name="Foods" barSize={30} />
          <Bar dataKey="beverages" fill="#14B8A6" name="Beverages" barSize={30} />
          <Bar dataKey="desserts" fill="#F59E0B" name="Desserts" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OmzetChart;
