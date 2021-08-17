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

export default function DailyByVaxCharts({ dosesData }) {
  var vtype = "pfizer";
  var dose = "1st";
  const vaxNames = {
    pfizer: "pfizer",
    sino: "sinovac",
    astra: "astrazeneca",
  };
  const CustomTooltip = ({ active, payload }) => {
    if (!active) return null;
    for (const bar of payload) {
      return (
        <div className="flex flex-col text-white p-2 bg-gray-900 text-sm">
          <p>{`${bar.payload.date}:`}</p>
          <p className="text-xs uppercase">
            {vaxNames[vtype]} {dose} dose
          </p>
          {dose == "1st" ? (
            <p className="text-lg text-blue-500">
              {bar.payload[`dose1_${vtype}`].toLocaleString()}
            </p>
          ) : (
            <p className="text-lg text-green-500">
              {bar.payload[`dose2_${vtype}`].toLocaleString()}
            </p>
          )}
          <p className="text-xs uppercase text-gray-400">1st Dose Total</p>

          <p className="text-lg text-blue-500">{bar.payload.dose1_display}</p>
          <p className="text-xs uppercase text-gray-400">2nd Dose Total</p>

          <p className="text-lg text-green-500">{bar.payload.dose2_display}</p>
          <p className="text-xs uppercase text-gray-400">Total</p>

          <p className="text-lg">
            {(
              bar.payload.dose1_pfizer +
              bar.payload.dose1_sino +
              bar.payload.dose1_astra +
              bar.payload.dose2_pfizer +
              bar.payload.dose2_sino +
              bar.payload.dose2_astra
            ).toLocaleString()}
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
        <Bar
          dataKey="dose2_pfizer"
          stackId="a"
          fill="#34D399ff"
          radius={[0, 0, 2, 2]}
          onMouseOver={() => ((vtype = "pfizer"), (dose = "2nd"))}
        />
        <Bar
          dataKey="dose2_sino"
          stackId="a"
          fill="#34D399cc"
          radius={[0, 0, 2, 2]}
          onMouseOver={() => ((vtype = "sino"), (dose = "2nd"))}
        />
        <Bar
          dataKey="dose2_astra"
          stackId="a"
          fill="#34D39999"
          radius={[0, 0, 2, 2]}
          onMouseOver={() => ((vtype = "astra"), (dose = "2nd"))}
        />
        <Bar
          dataKey="dose1_pfizer"
          stackId="a"
          fill="#60A5FAff"
          radius={[2, 2, 0, 0]}
          onMouseOver={() => ((vtype = "pfizer"), (dose = "1st"))}
        />
        <Bar
          dataKey="dose1_sino"
          stackId="a"
          fill="#60A5FAcc"
          radius={[2, 2, 0, 0]}
          onMouseOver={() => ((vtype = "sino"), (dose = "1st"))}
        />
        <Bar
          dataKey="dose1_astra"
          stackId="a"
          fill="#60A5FA99"
          radius={[2, 2, 0, 0]}
          onMouseOver={() => ((vtype = "astra"), (dose = "1st"))}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
