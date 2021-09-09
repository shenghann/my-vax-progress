import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ReferenceLine, ResponsiveContainer } from "recharts";
import React, { useState } from "react";

export default function StateCharts({ stateData }) {
  const [focusBar, setFocusBar] = useState(null);
  const [mouseLeave, setMouseLeave] = useState(true);
  const dataKeyMap = {
    full: "Fully Vaccinated",
    partial: "First Dose Only",
    reg: "Registered",
    unreg: "Unregistered",
  };

  var tooltip;
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !tooltip) return null;
    for (const bar of payload) {
      const dataKey = bar.dataKey.split("_")[0];
      if (dataKey === tooltip)
        return (
          <div className="flex flex-col text-white bg-gray-900 p-2 text-sm">
            <p>{`${bar.payload.name}:`}</p>
            <p className="text-xs uppercase text-gray-400">{dataKeyMap[dataKey]}</p>
            <p className="text-lg">{bar.payload[`${dataKey}_display`]}</p>
            <p className="text-xs text-gray-400">({bar.payload[`${dataKey}_count`]})</p>
            <p className="text-xs uppercase text-gray-400 pt-2">80% Target:</p>
            <p className="text-lg">{bar.payload.herd_date_display}</p>
            <p>
              <span className="text-sm text-green-500 uppercase">
                {bar.payload.herd_n_days > 0 ? `in ${bar.payload.herd_n_days} days` : `${Math.abs(bar.payload.herd_n_days)} days ago`}
              </span>
            </p>
          </div>
        );
    }

    return null;
  };

  const renderCustomizedLabel = (props) => {
    const { x, y, width, height, value } = props;
    const radius = 10;

    return (
      <g>
        {/* <circle cx={x + width / 2} cy={y + height} r={radius} fill="#8884d8" /> */}
        <text x={x + width / 2} y={y + height + 20} fill="#ccc" textAnchor="middle" dominantBaseline="middle" fontSize="smaller">
          {value}
        </text>
      </g>
    );
  };

  const renderCustomizedPctLabel = (props) => {
    const { x, y, width, height, value } = props;

    return (
      <g>
        <rect x={x + width} y={y + height} width={40} height={30} fill="#fff" />
        <text x={x + width} y={y + height} fill="#000" textAnchor="middle" dominantBaseline="middle">
          {value}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={stateData}
        margin={{
          bottom: 20,
          top: 20,
        }}
        layout="vertical"
      >
        <YAxis
          dataKey="name_abbr"
          type="category"
          orientation="right"
          interval={0}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          // tick={<CustomYAxisTick />}
        />
        <XAxis type="number" hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#4B5563" }} wrapperStyle={{ display: "hidden" }} />
        <Bar dataKey="full" stackId="a" fill="#34D399" radius={[2, 0, 0, 2]} onMouseOver={() => (tooltip = "full")}></Bar>
        <Bar dataKey="partial" stackId="a" fill="#60A5FA" onMouseOver={() => (tooltip = "partial")}></Bar>
        <Bar dataKey="reg" stackId="a" fill="#6B7280" radius={[0, 2, 2, 0]} onMouseOver={() => (tooltip = "reg")}></Bar>
        <Bar dataKey="unreg" stackId="a" fill="#1F2937" onMouseOver={() => (tooltip = "unreg")}></Bar>

        <ReferenceLine
          x={0.8}
          label={{
            value: "80%",
            position: "top",
            fill: "#34D399",
            fontSize: 10,
          }}
          stroke="#34D399"
          strokeDasharray="3 3"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
