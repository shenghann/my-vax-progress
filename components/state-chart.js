import {
  BarChart,
  Bar,
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
    full: 0.3961144578313253,
    full_display: "39.61%",
    partial: 0.19273092369477912,
    partial_display: "19.27%",
    reg: 0.013755020080321286,
    reg_display: "1.38%",
    unreg: 0.3973995983935743,
    unreg_display: "39.74%",
    name: "W.P. Labuan",
    name_abbr: "LBN",
  },
  {
    full: 0.3209090909090909,
    full_display: "32.09%",
    partial: 0.2945090909090909,
    partial_display: "29.45%",
    reg: 0.20116363636363635,
    reg_display: "20.12%",
    unreg: 0.1834181818181818,
    unreg_display: "18.34%",
    name: "W.P. Putrajaya",
    name_abbr: "PJY",
  },
  {
    full: 0.2905726966092668,
    full_display: "29.06%",
    partial: 0.249933960589384,
    partial_display: "24.99%",
    reg: 0.07618959701757501,
    reg_display: "7.62%",
    unreg: 0.38330374578377424,
    unreg_display: "38.33%",
    name: "Sarawak",
    name_abbr: "SWK",
  },
  {
    full: 0.26477081806393415,
    full_display: "26.48%",
    partial: 0.6682014996899137,
    partial_display: "66.82%",
    reg: 0.04388960929131195,
    reg_display: "4.39%",
    unreg: 0.02313807295484016,
    unreg_display: "2.31%",
    name: "W.P. Kuala Lumpur",
    name_abbr: "KUL",
  },
  {
    full: 0.24771675166732052,
    full_display: "24.77%",
    partial: 0.09846998823067869,
    partial_display: "9.85%",
    reg: 0.24170262848175755,
    reg_display: "24.17%",
    unreg: 0.4121106316202432,
    unreg_display: "41.21%",
    name: "Perlis",
    name_abbr: "PLS",
  },
  {
    full: 0.14205173635719348,
    full_display: "14.21%",
    partial: 0.21179394046775338,
    partial_display: "21.18%",
    reg: 0.3255767186392629,
    reg_display: "32.56%",
    unreg: 0.3205776045357902,
    unreg_display: "32.06%",
    name: "Negeri Sembilan",
    name_abbr: "NSN",
  },
  {
    full: 0.12429184089203388,
    full_display: "12.43%",
    partial: 0.118474321861263,
    partial_display: "11.85%",
    reg: 0.3913155355419749,
    reg_display: "39.13%",
    unreg: 0.36591830170472817,
    unreg_display: "36.59%",
    name: "Melaka",
    name_abbr: "MLK",
  },
  {
    full: 0.11804525355535195,
    full_display: "11.80%",
    partial: 0.09942955025295781,
    partial_display: "9.94%",
    reg: 0.3203441819702824,
    reg_display: "32.03%",
    unreg: 0.4621810142214078,
    unreg_display: "46.22%",
    name: "Perak",
    name_abbr: "PRK",
  },
  {
    full: 0.11711941813261163,
    full_display: "11.71%",
    partial: 0.1505085701398286,
    partial_display: "15.05%",
    reg: 0.3873731393775372,
    reg_display: "38.74%",
    unreg: 0.3449988723500226,
    unreg_display: "34.50%",
    name: "Pulau Pinang",
    name_abbr: "PNG",
  },
  {
    full: 0.11508548281408233,
    full_display: "11.51%",
    partial: 0.06948412462024185,
    partial_display: "6.95%",
    reg: 0.3225031274200274,
    reg_display: "32.25%",
    unreg: 0.49292726514564844,
    unreg_display: "49.29%",
    name: "Pahang",
    name_abbr: "PHG",
  },
  {
    full: 0.10610269051240363,
    full_display: "10.61%",
    partial: 0.054812503277914724,
    partial_display: "5.48%",
    reg: 0.21376094823517072,
    reg_display: "21.38%",
    unreg: 0.625323857974511,
    unreg_display: "62.53%",
    name: "Kelantan",
    name_abbr: "KTN",
  },
  {
    full: 0.10349241642182165,
    full_display: "10.35%",
    partial: 0.10048360200111173,
    partial_display: "10.05%",
    reg: 0.24872151195108394,
    reg_display: "24.87%",
    unreg: 0.5473024696259827,
    unreg_display: "54.73%",
    name: "Terengganu",
    name_abbr: "TRG",
  },
  {
    full: 0.10254359068234864,
    full_display: "10.25%",
    partial: 0.07667475172760972,
    partial_display: "7.67%",
    reg: 0.3253997528717221,
    reg_display: "32.54%",
    unreg: 0.49538190471831955,
    unreg_display: "49.54%",
    name: "Kedah",
    name_abbr: "KDH",
  },
  {
    full: 0.09829992065591113,
    full_display: "9.83%",
    partial: 0.07093493784713038,
    partial_display: "7.09%",
    reg: 0.44704046548532134,
    reg_display: "44.70%",
    unreg: 0.3837246760116372,
    unreg_display: "38.37%",
    name: "Johor",
    name_abbr: "JHR",
  },
  {
    full: 0.09591878250229428,
    full_display: "9.59%",
    partial: 0.19641037014377485,
    partial_display: "19.64%",
    reg: 0.4026486693178342,
    reg_display: "40.26%",
    unreg: 0.30502217803609666,
    unreg_display: "30.50%",
    name: "Selangor",
    name_abbr: "SGR",
  },
  {
    full: 0.08949980811052834,
    full_display: "8.95%",
    partial: 0.02888550594857362,
    partial_display: "2.89%",
    reg: 0.1330116412946143,
    reg_display: "13.30%",
    unreg: 0.7486030446462837,
    unreg_display: "74.86%",
    name: "Sabah",
    name_abbr: "SBH",
  },
];

export default function StateCharts() {
  const [focusBar, setFocusBar] = useState(null);
  const [mouseLeave, setMouseLeave] = useState(true);

  var tooltip;
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !tooltip) return null;
    for (const bar of payload) {
      if (bar.dataKey === tooltip)
        return (
          <div className="flex flex-col rounded-md text-white bg-gray-700 p-2 text-sm">
            <p>{`${bar.payload.name}:`}</p>
            {`${bar.dataKey} ${(bar.value * 100).toFixed(2)}%`}
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
    <ResponsiveContainer width="100%" height="100%">
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
        <YAxis
          dataKey="name_abbr"
          type="category"
          orientation="right"
          interval={0}
          tick={{ fontSize: 10 }}
        />
        <XAxis type="number" hide />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "#4B5563" }}
          wrapperStyle={{ display: "hidden" }}
        />
        <Bar
          dataKey="full"
          stackId="a"
          fill="#34D399"
          radius={[2, 0, 0, 2]}
          onMouseOver={() => (tooltip = "full")}
        >
          {/* {data.map((entry, index) => (
                <Cell
                  fill={focusBar === index ? "#82ca9d" : "#82ca9d80"} 
                />
              ))} */}
        </Bar>
        <Bar
          dataKey="partial"
          stackId="a"
          fill="#60A5FA"
          onMouseOver={() => (tooltip = "partial")}
        >
          {/* {data.map((entry, index) => (
                <Cell
                  fill={focusBar === index ? "#8884d8" : "#8884d880"} 
                />
              ))} */}
        </Bar>
        <Bar
          dataKey="reg"
          stackId="a"
          fill="#6B7280"
          radius={[0, 2, 2, 0]}
          onMouseOver={() => (tooltip = "reg")}
        ></Bar>
        <Bar
          dataKey="unreg"
          stackId="a"
          fill="#1F2937"
          onMouseOver={() => (tooltip = "unreg")}
        ></Bar>
        {/* <ReferenceLine
          x={0.4}
          label={{ value: "40%", position: "top", fill: "gray" }}
          stroke="white"
          strokeDasharray="3 3"
        />
        <ReferenceLine
          x={0.6}
          label={{ value: "60%", position: "top", fill: "gray" }}
          stroke="white"
          strokeDasharray="3 3"
        /> */}
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
