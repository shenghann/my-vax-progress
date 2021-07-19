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
    name: "National",
    full: 0.132,
    full_label: "FULLY VACCINATED",
    full_display: "13.18%",
    partial: 0.153,
    partial_label: "FIRST DOSE",
    partial_display: "15.3%",
    reg: 0.288,
    reg_label: "REGISTERED",
    reg_display: "28.8%",
    unreg: 0.426,
    unreg_label: "UNREGISTERED",
    unreg_display: "42.6%",
  },
];

export default function ProgressBarRc() {
  const [focusBar, setFocusBar] = useState(null);
  const [mouseLeave, setMouseLeave] = useState(true);

  var tooltip;
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !tooltip) return null;
    for (const bar of payload)
      if (bar.dataKey === tooltip)
        return (
          <div className="flex rounded-md text-white bg-yellow-300 p-3">{`${(
            bar.value * 100
          ).toFixed(2)}%`}</div>
        );
    return null;
  };

  const renderCustomizedLabel = (props) => {
    const { x, y, width, height, value } = props;
    const radius = 10;

    return (
      <g>
        {/* <circle cx={x + width / 2} cy={y + height} r={radius} fill="#8884d8" /> */}
        <text
          x={x + width / 2}
          y={y + height + 20}
          fill="#ccc"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="smaller"
        >
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
        <text
          x={x + width}
          y={y + height}
          fill="#000"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <div className="py-5">
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={data}
          margin={{
            bottom: 20,
            top: 20,
          }}
          layout="vertical"
          // onMouseMove={(state) => {
          //   if (state.isTooltipActive) {
          //     setFocusBar(state.activeTooltipIndex);
          //     setMouseLeave(false);
          //   } else {
          //     setFocusBar(null);
          //     setMouseLeave(true);
          //   }
          // }}
        >
          <YAxis dataKey="name" type="category" hide />
          <XAxis type="number" hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
            wrapperStyle={{ display: "hidden" }}
          />
          <Bar
            dataKey="full"
            stackId="a"
            fill="#82ca9d"
            onMouseOver={() => (tooltip = "full")}
          >
            {/* {data.map((entry, index) => (
              <Cell
                fill={focusBar === index ? "#82ca9d" : "#82ca9d80"} 
              />
            ))} */}
            <LabelList dataKey="full_label" content={renderCustomizedLabel} />
            {/* <LabelList dataKey="full_display" content={renderCustomizedPctLabel} /> */}
          </Bar>
          <Bar
            dataKey="partial"
            stackId="a"
            fill="#8884d8"
            onMouseOver={() => (tooltip = "partial")}
          >
            {/* {data.map((entry, index) => (
              <Cell
                fill={focusBar === index ? "#8884d8" : "#8884d880"} 
              />
            ))} */}
            <LabelList
              dataKey="partial_label"
              content={renderCustomizedLabel}
            />
          </Bar>
          <Bar
            dataKey="reg"
            stackId="a"
            fill="#6B7280"
            onMouseOver={() => (tooltip = "reg")}
          >
            <LabelList dataKey="reg_label" content={renderCustomizedLabel} />
          </Bar>
          <Bar
            dataKey="unreg"
            stackId="a"
            fill="#374151"
            onMouseOver={() => (tooltip = "unreg")}
          >
            <LabelList dataKey="unreg_label" content={renderCustomizedLabel} />
          </Bar>
          <ReferenceLine
            x={0.4}
            label={{ value: "40%", position: "top", fill: "white" }}
            stroke="white"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            x={0.6}
            label={{ value: "60%", position: "top", fill: "white" }}
            stroke="white"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            x={0.8}
            label={{ value: "80%", position: "top", fill: "yellow" }}
            stroke="yellow"
            strokeDasharray="3 3"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
