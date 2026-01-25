import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * data shape:
 * [
 *   { label: "Toyota Corolla", count: 4 },
 *   { label: "BMW X5", count: 2 }
 * ]
 */

const CarsByModelBarChart = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
        >
          {/* Grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          {/* X Axis */}
          <XAxis
            dataKey="label"
            interval={0}
            angle={0}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />

          {/* Y Axis */}
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />

          {/* Tooltip */}
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
            formatter={(value) => [`${value}`, "Cars"]}
          />

          {/* Bar */}
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            fill="#00A19C"
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CarsByModelBarChart;
