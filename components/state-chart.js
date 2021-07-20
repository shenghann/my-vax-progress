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
    full: 0.6458832116788321,
    full_display: "64.59%",
    partial: 0.22833576642335768,
    partial_display: "22.83%",
    reg: -0.04712408759124088,
    reg_display: "-4.71%",
    unreg: 0.17290510948905113,
    unreg_display: "17.29%",
    name: "W.P. Labuan",
    name_abbr: "LBN",
  },
  {
    full: 0.4567146423850786,
    full_display: "45.67%",
    partial: 0.31651392764478387,
    partial_display: "31.65%",
    reg: 0.03187252166250551,
    reg_display: "3.19%",
    unreg: 0.194898908307632,
    unreg_display: "19.49%",
    name: "Sarawak",
    name_abbr: "SWK",
  },
  {
    full: 0.3643598233995585,
    full_display: "36.44%",
    partial: 0.13316225165562914,
    partial_display: "13.32%",
    reg: 0.28971854304635763,
    reg_display: "28.97%",
    unreg: 0.21275938189845478,
    unreg_display: "21.28%",
    name: "Perlis",
    name_abbr: "PLS",
  },
  {
    full: 0.20753771778981864,
    full_display: "20.75%",
    partial: 0.44325216573115733,
    partial_display: "44.33%",
    reg: 0.3358469874436261,
    reg_display: "33.58%",
    unreg: 0.013363129035397936,
    unreg_display: "1.34%",
    name: "Klang Valley",
    name_abbr: "KV",
  },
  {
    full: 0.2057134086444008,
    full_display: "20.57%",
    partial: 0.3425601669941061,
    partial_display: "34.26%",
    reg: 0.3485523084479371,
    reg_display: "34.86%",
    unreg: 0.10317411591355596,
    unreg_display: "10.32%",
    name: "Negeri Sembilan",
    name_abbr: "NSN",
  },
  {
    full: 0.18519191024505463,
    full_display: "18.52%",
    partial: 0.17682462356067316,
    partial_display: "17.68%",
    reg: 0.4677428402716268,
    reg_display: "46.77%",
    unreg: 0.17024062592264544,
    unreg_display: "17.02%",
    name: "Melaka",
    name_abbr: "MLK",
  },
  {
    full: 0.17856259277585354,
    full_display: "17.86%",
    partial: 0.1585823849579416,
    partial_display: "15.86%",
    reg: 0.3365165759524988,
    reg_display: "33.65%",
    unreg: 0.3263384463137061,
    unreg_display: "32.63%",
    name: "Terengganu",
    name_abbr: "TRG",
  },
  {
    full: 0.17284402109202246,
    full_display: "17.28%",
    partial: 0.10259993196121789,
    partial_display: "10.26%",
    reg: 0.4154516074162273,
    reg_display: "41.55%",
    unreg: 0.30910443953053235,
    unreg_display: "30.91%",
    name: "Pahang",
    name_abbr: "PHG",
  },
  {
    full: 0.16981799061640512,
    full_display: "16.98%",
    partial: 0.10000161786118751,
    partial_display: "10.00%",
    reg: 0.2879299466105808,
    reg_display: "28.79%",
    unreg: 0.4422504449118265,
    unreg_display: "44.23%",
    name: "Kelantan",
    name_abbr: "KTN",
  },
  {
    full: 0.1628523111612176,
    full_display: "16.29%",
    partial: 0.14995007247543887,
    partial_display: "15.00%",
    reg: 0.38716379449186666,
    reg_display: "38.72%",
    unreg: 0.30003382187147687,
    unreg_display: "30.00%",
    name: "Perak",
    name_abbr: "PRK",
  },
  {
    full: 0.1622505851375073,
    full_display: "16.23%",
    partial: 0.21810269163253365,
    partial_display: "21.81%",
    reg: 0.4412624341720304,
    reg_display: "44.13%",
    unreg: 0.17838428905792858,
    unreg_display: "17.84%",
    name: "Pulau Pinang",
    name_abbr: "PNG",
  },
  {
    full: 0.14898740750357004,
    full_display: "14.90%",
    partial: 0.13262300402440608,
    partial_display: "13.26%",
    reg: 0.40884200960664674,
    reg_display: "40.88%",
    unreg: 0.3095475788653771,
    unreg_display: "30.95%",
    name: "Kedah",
    name_abbr: "KDH",
  },
  {
    full: 0.14024964047346877,
    full_display: "14.02%",
    partial: 0.11690880932187765,
    partial_display: "11.69%",
    reg: 0.5616877465983259,
    reg_display: "56.17%",
    unreg: 0.1811538036063277,
    unreg_display: "18.12%",
    name: "Johor",
    name_abbr: "JHR",
  },
  {
    full: 0.13280959976798143,
    full_display: "13.28%",
    partial: 0.04885730858468677,
    partial_display: "4.89%",
    reg: 0.16578705046403713,
    reg_display: "16.58%",
    unreg: 0.6525460411832946,
    unreg_display: "65.25%",
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
          <div className="flex flex-col text-white bg-black p-2 text-sm">
            <p>{`${bar.payload.name}:`}</p>
            <p className="text-lg">{`${bar.dataKey} ${(bar.value * 100).toFixed(
              2
            )}%`}</p>
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
