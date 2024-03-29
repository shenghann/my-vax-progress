import { BarChart, Bar, Cell, Text, XAxis, YAxis, Tooltip, LabelList, ReferenceLine, ReferenceArea, ResponsiveContainer } from "recharts";
import React, { useState } from "react";

export default function DailyByVaxCharts({ dosesData }) {
  var vtype = "pfizer";
  var dose = "1st";
  const vaxNames = {
    pfizer: "pfizer",
    sino: "sinovac",
    astra: "astrazeneca",
    cansino: "cansino",
  };
  const CustomTooltip = ({ active, payload }) => {
    if (!active) return null;
    for (const bar of payload) {
      return (
        <div className="flex flex-col text-white p-2 bg-gray-900 text-sm">
          {bar.payload.projection ? <p className="text-yellow-300">Projected for</p> : ""}
          <p>{`${bar.payload.date}:`}</p>
          <p className="text-xs uppercase">
            {vaxNames[vtype]} {vtype == "cansino" ? "" : dose} dose
          </p>
          {dose == "1st" ? (
            <p className="text-lg text-blue-500">{bar.payload[`dose1_${vtype}`].toLocaleString()}</p>
          ) : (
            <p className="text-lg text-green-500">{bar.payload[`dose2_${vtype}`].toLocaleString()}</p>
          )}
          <p className="text-xs uppercase text-gray-400">1st Dose Total</p>

          <p className="text-lg text-blue-500">{bar.payload.dose1_display}</p>
          <p className="text-xs uppercase text-gray-400">Full Dose Total</p>

          <p className="text-lg text-green-500">{bar.payload.dose2_display}</p>
          <p className="text-xs uppercase text-gray-400">Total</p>

          <p className="text-lg">{bar.payload.full_display}</p>
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
        <ReferenceArea x1={dosesData[dosesData.length - 7]["date"]} x2={dosesData[dosesData.length - 1]["date"]} fill="#4B5563" />
        <Text />
        <Bar dataKey="dose2_pfizer" stackId="a" fill="#34D399ff" radius={[0, 0, 2, 2]} onMouseOver={() => ((vtype = "pfizer"), (dose = "2nd"))}>
          {dosesData.map((entry, index) => (
            <Cell key={entry["date"]} fill={entry["projection"] ? "#34D39999" : "#34D399ff"} />
          ))}
        </Bar>
        <Bar dataKey="dose2_sino" stackId="a" fill="#34D399cc" onMouseOver={() => ((vtype = "sino"), (dose = "2nd"))}>
          {dosesData.map((entry, index) => (
            <Cell key={entry["date"]} fill={entry["projection"] ? "#34D39966" : "#34D399cc"} />
          ))}
        </Bar>
        <Bar dataKey="dose2_astra" stackId="a" fill="#34D39999" onMouseOver={() => ((vtype = "astra"), (dose = "2nd"))}>
          {dosesData.map((entry, index) => (
            <Cell key={entry["date"]} fill={entry["projection"] ? "#34D39933" : "#34D39999"} />
          ))}
        </Bar>
        <Bar dataKey="dose2_cansino" stackId="a" fill="#34D39999" onMouseOver={() => ((vtype = "cansino"), (dose = "2nd"))}>
          {dosesData.map((entry, index) => (
            <Cell key={entry["date"]} fill={entry["projection"] ? "#34D39922" : "#34D39966"} />
          ))}
        </Bar>
        <Bar dataKey="dose1_pfizer" stackId="a" fill="#60A5FAff" onMouseOver={() => ((vtype = "pfizer"), (dose = "1st"))}>
          {dosesData.map((entry, index) => (
            <Cell key={entry["date"]} fill={entry["projection"] ? "#60A5FA99" : "#60A5FAff"} />
          ))}
        </Bar>
        <Bar dataKey="dose1_sino" stackId="a" fill="#60A5FAcc" onMouseOver={() => ((vtype = "sino"), (dose = "1st"))}>
          {dosesData.map((entry, index) => (
            <Cell key={entry["date"]} fill={entry["projection"] ? "#60A5FA66" : "#60A5FAcc"} />
          ))}
        </Bar>
        <Bar dataKey="dose1_astra" stackId="a" fill="#60A5FA99" radius={[2, 2, 0, 0]} onMouseOver={() => ((vtype = "astra"), (dose = "1st"))}>
          {dosesData.map((entry, index) => (
            <Cell key={entry["date"]} fill={entry["projection"] ? "#60A5FA33" : "#60A5FA99"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
