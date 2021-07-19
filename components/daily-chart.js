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

const data = [
  {
    date: "2021-07-03",
    dose1: 142484,
    dose1_display: "142,484",
    dose2: 76786,
    dose2_display: "76,786",
  },
  {
    date: "2021-07-04",
    dose1: 127525,
    dose1_display: "127,525",
    dose2: 78797,
    dose2_display: "78,797",
  },
  {
    date: "2021-07-05",
    dose1: 198129,
    dose1_display: "198,129",
    dose2: 117415,
    dose2_display: "117,415",
  },
  {
    date: "2021-07-06",
    dose1: 209380,
    dose1_display: "209,380",
    dose2: 133489,
    dose2_display: "133,489",
  },
  {
    date: "2021-07-07",
    dose1: 211094,
    dose1_display: "211,094",
    dose2: 168504,
    dose2_display: "168,504",
  },
  {
    date: "2021-07-08",
    dose1: 224268,
    dose1_display: "224,268",
    dose2: 154227,
    dose2_display: "154,227",
  },
  {
    date: "2021-07-09",
    dose1: 214152,
    dose1_display: "214,152",
    dose2: 124261,
    dose2_display: "124,261",
  },
  {
    date: "2021-07-10",
    dose1: 215386,
    dose1_display: "215,386",
    dose2: 110878,
    dose2_display: "110,878",
  },
  {
    date: "2021-07-11",
    dose1: 191072,
    dose1_display: "191,072",
    dose2: 101166,
    dose2_display: "101,166",
  },
  {
    date: "2021-07-12",
    dose1: 264920,
    dose1_display: "264,920",
    dose2: 157577,
    dose2_display: "157,577",
  },
  {
    date: "2021-07-13",
    dose1: 260846,
    dose1_display: "260,846",
    dose2: 163900,
    dose2_display: "163,900",
  },
  {
    date: "2021-07-14",
    dose1: 281942,
    dose1_display: "281,942",
    dose2: 155304,
    dose2_display: "155,304",
  },
  {
    date: "2021-07-15",
    dose1: 304772,
    dose1_display: "304,772",
    dose2: 155351,
    dose2_display: "155,351",
  },
  {
    date: "2021-07-16",
    dose1: 276905,
    dose1_display: "276,905",
    dose2: 129858,
    dose2_display: "129,858",
  },
];

export default function DailyCharts() {
  const CustomTooltip = ({ active, payload }) => {
    if (!active) return null;
    for (const bar of payload) {
      return (
        <div className="flex flex-col rounded-md text-white bg-gray-700 p-2 text-sm">
          <p>{`${bar.payload.date}:`}</p>
          <p>{`1st Dose ${bar.payload.dose1_display}`}</p>
          <p>{`2nd Dose ${bar.payload.dose2_display}`}</p>
        </div>
      );
    }

    return null;
  };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          bottom: 20,
          top: 20,
        }}
      >
        <YAxis type="number" tick={{ fontSize: 12 }} />
        <XAxis type="category" dataKey="date" hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#4B5563" }} />
        <Bar dataKey="dose2" stackId="a" fill="#34D399" radius={[0, 0, 2, 2]} />
        <Bar dataKey="dose1" stackId="a" fill="#60A5FA" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
