import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const BookingsOverviewChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <LineChart width={900} height={320} data={data}>
      <XAxis dataKey="label" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />

      <Line dataKey="pending" stroke="#facc15" />
      <Line dataKey="completed" stroke="#22c55e" />
      <Line dataKey="cancelled" stroke="#ef4444" />
      <Line dataKey="total" stroke="#3b82f6" />
    </LineChart>
  );
};

export default BookingsOverviewChart;
