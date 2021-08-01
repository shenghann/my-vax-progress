import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import React, { useState } from "react";

export default function DailyCharts({ dosesData }) {
  const CustomTooltip = ({ active, payload }) => {
    if (!active) return null;
    for (const bar of payload) {
      return (
        <div className="flex flex-col text-white bg-black p-2 text-sm">
          <p>{`${bar.payload.date}:`}</p>
          <p className="text-xs uppercase text-gray-400">1st Dose</p>

          <p className="text-lg text-blue-500">{bar.payload.dose1_display}</p>
          <p className="text-xs uppercase text-gray-400">2nd Dose</p>

          <p className="text-lg text-green-500">{bar.payload.dose2_display}</p>
          <p className="text-xs uppercase text-gray-400">Total</p>

          <p className="text-lg">
            {(bar.payload.dose1 + bar.payload.dose2).toLocaleString()}
          </p>
          {/* // <p>{`1st Dose ${bar.payload.dose1_display}`}</p>
          // <p>{`2nd Dose ${bar.payload.dose2_display}`}</p> */}
        </div>
      );
    }

    return null;
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dosesData}
        margin={{
          bottom: 20,
          top: 20,
        }}
      >
        <YAxis type="number" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
        <XAxis type="category" dataKey="date" hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#4B5563" }} />
        <Bar dataKey="dose2" stackId="a" fill="#34D399" radius={[0, 0, 2, 2]} />
        <Bar dataKey="dose1" stackId="a" fill="#60A5FA" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
