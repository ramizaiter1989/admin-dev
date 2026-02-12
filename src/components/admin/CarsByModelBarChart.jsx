import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CarsByModelBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        
        <XAxis
          dataKey="label"
          interval={0}
          angle={0}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
        />

        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12 }}
        />

        <Tooltip
          formatter={(value) => [`${value}`, "Cars"]}
        />

        <Bar
          dataKey="count"
          fill="#00A19C"
          radius={[6, 6, 0, 0]}
          animationDuration={600}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CarsByModelBarChart;
