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
    <LineChart
      width={900}
      height={320}
      margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
      data={data}
    >
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />

      <Line
        type="monotone"
        dataKey="pending"
        stroke="#facc15"
        strokeWidth={2}
        name="Pending"
      />

      <Line
        type="monotone"
        dataKey="completed"
        stroke="#22c55e"
        strokeWidth={2}
        name="Completed"
      />

      <Line
        type="monotone"
        dataKey="cancelled"
        stroke="#ef4444"
        strokeWidth={2}
        name="Cancelled"
      />

      <Line
        type="monotone"
        dataKey="total"
        stroke="#3b82f6"
        strokeWidth={2}
        name="Total"
      />
    </LineChart>
  );
};

export default BookingsOverviewChart;
