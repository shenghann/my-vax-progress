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
  {
    date: "2021-07-17",
    dose1: 253830,
    dose1_display: "253,830",
    dose2: 126610,
    dose2_display: "126,610",
  },
  {
    date: "2021-07-18",
    dose1: 244761,
    dose1_display: "244,761",
    dose2: 100200,
    dose2_display: "100,200",
  },
  {
    date: "2021-07-19",
    dose1: 282106,
    dose1_display: "282,106",
    dose2: 142830,
    dose2_display: "142,830",
  },
];

export default function DailyCharts() {
  const CustomTooltip = ({ active, payload }) => {
    if (!active) return null;
    for (const bar of payload) {
      return (
        <div className="flex flex-col text-white bg-black p-2 text-sm">
          <p>{`${bar.payload.date}:`}</p>
          <div className="flex flex-col">
            <p className="text-xs uppercase text-gray-400">1st Dose</p>

            <p className="text-lg">{bar.payload.dose1_display}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-xs uppercase text-gray-400">2nd Dose</p>

            <p className="text-lg">{bar.payload.dose2_display}</p>
          </div>
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
