import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StateCharts from "../components/state-chart";
import DailyCharts from "../components/daily-chart";
import dynamic from "next/dynamic";

const ReactTooltip = dynamic(() => import("react-tooltip"), {
  ssr: false,
});

export async function getStaticProps() {
  const res = await fetch("https://api.github.com/repos/vercel/next.js");
  const json = await res.json();

  return {
    props: {
      stars: json.stargazers_count,
    },
  };
}

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
const TIMELINE_CONST = {
  Y_PCT: "50%",
  IN_CIRCLE_R: 2,
  OUT_CIRCLE_R: 5,
  TICK_FULL_Y1: 30,
  TICK_FULL_Y2: 20,
};
const timeline_data = [
  {
    name: "begin",
    name_display: "Start",
    x_pct: "20%",
    date_display: "24 Feb",
    x_pct_tw: "left-[20%]",
    has_past: true,
  },
  {
    name: "10pct",
    name_display: "10%",
    date_display: "09 Jul",
    x_pct: "46.35%",
    x_pct_tw: "left-[46.35%]",
    has_past: true,
  },
  {
    name: "40pct",
    name_display: "40%",
    date_display: "24 Aug",
    x_pct: "63.14%",
    x_pct_tw: "left-[63.14%]",
    has_past: false,
  },
  {
    name: "60pct",
    name_display: "60%",
    date_display: "27 Sep",
    x_pct: "75.55%",
    x_pct_tw: "left-[75.55%]",
    has_past: false,
  },
  {
    name: "80pct",
    name_display: "80%",
    date_display: "30 Oct",
    x_pct: "87.59%",
    x_pct_tw: "left-[87.59%]",
    has_past: false,
  },
];

export default function Home({ stars }) {
  return (
    <div className="bg-gray-800 text-gray-300 font-b612-mono flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-full flex-1 p-20">
        <div className="flex">
          {/* big header */}
          <h1
            className="text-6xl font-bold uppercase"
            data-tip
            data-for="days-hover"
          >
            Malaysia: Herd Immunity in{" "}
            <span className="inline-flex flex-col text-green-500">
              109 days
              <p className="text-sm text-green-700 text-right">
                29th October 2021
              </p>
            </span>
          </h1>
          <ReactTooltip id="days-hover" type="dark" effect="solid" place="top">
            <p>
              Estimated based on current vaccination rate (past 7-day average)
              to achieve
              <br /> 80% full vaccination of 23,409,600 Malaysian Adults
            </p>
          </ReactTooltip>
        </div>

        {/* css progress bar  */}
        <div className="relative py-5">
          {/* percentage labels */}
          <div className="relative h-4 text-xs">
            <div className="absolute uppercase text-gray-500">National</div>
            <div className="absolute left-[40%]">
              <div className="relative left-[-50%]">40%</div>
            </div>
            <div className="absolute left-[60%]">
              <div className="relative left-[-50%]">60%</div>
            </div>
            <div className="absolute left-[80%] text-green-500">
              <div className="relative left-[-50%]">80%</div>
            </div>
          </div>
          {/* dotted lines */}
          <div className="relative h-4 text-xs">
            <div className="absolute left-[40%]">
              <div className="relative left-[-50%] h-14 border-r-2 border-dashed"></div>
            </div>
            <div className="absolute left-[60%]">
              <div className="relative left-[-50%] h-14 border-r-2 border-dashed"></div>
            </div>
            <div className="absolute left-[80%] text-green-500">
              <div className="relative left-[-50%] h-14 border-r-2 border-dashed border-green-500"></div>
            </div>
          </div>

          {/* actual bars */}
          <div className="overflow-hidden h-10 text-xs flex rounded bg-gray-600">
            <div
              style={{ width: "13.8%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-400 hover:opacity-80"
              data-tip
              data-for="prog-full-hover"
            >
              13.8%
            </div>
            <ReactTooltip
              id="prog-full-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">4,531,550</p> <p>received 2 doses</p>
            </ReactTooltip>
            <div
              style={{ width: "15.3%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400 hover:opacity-80"
              data-tip
              data-for="prog-partial-hover"
            >
              15.3%
            </div>
            <ReactTooltip
              id="prog-partial-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">4,531,550</p> <p>received 1 dose</p>
              <p className="text-xl">14,531,550</p>{" "}
              <p>received at least 1 dose</p>
            </ReactTooltip>
            <div
              style={{ width: "28.8%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500 hover:opacity-80"
              data-tip
              data-for="prog-reg-hover"
            >
              28.8%
            </div>
            <ReactTooltip
              id="prog-reg-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">4,531,550</p>{" "}
              <p>
                registered for vaccination but haven't received their doses yet
              </p>
            </ReactTooltip>
            <div
              style={{ width: "42.6%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-700 hover:opacity-80"
              data-tip
              data-for="prog-unreg-hover"
            >
              42.6%
            </div>
            <ReactTooltip
              id="prog-unreg-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">4,531,550</p>{" "}
              <p>
                have not registered for vaccination nor received their doses
              </p>
            </ReactTooltip>
          </div>
          {/* bar labels */}
          <div className="overflow-hidden h-8 text-xs flex uppercase text-gray-300">
            <div
              style={{ width: "13.8%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap justify-center"
              data-tip
              data-for="prog-full-hover"
            >
              Fully Vaccinated
            </div>
            <div
              style={{ width: "15.3%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap justify-center"
              data-tip
              data-for="prog-partial-hover"
            >
              First Dose
            </div>
            <div
              style={{ width: "28.8%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap justify-center"
              data-tip
              data-for="prog-reg-hover"
            >
              Registered
            </div>
            <div
              style={{ width: "42.6%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap justify-center"
              data-tip
              data-for="prog-unreg-hover"
            >
              Unregistered
            </div>
          </div>
        </div>
        {/* charts */}
        <div className="flex flex-wrap justify-between">
          <div className="flex-initial w-96 h-72 opacity-60">
            <StateCharts />
            <p className="uppercase text-xs text-gray-500">By State</p>
          </div>
          <div className="w-96 h-72 opacity-60">
            <DailyCharts />
            <p className="uppercase text-xs text-gray-500 text-right">
              Daily Doses
            </p>
          </div>
        </div>
      </main>
      <div className="flex flex-col items-center justify-center w-full pb-5">
        {/* timeline labels */}
        <div className="relative h-10 w-full uppercase">
          {timeline_data.map((milestone) => (
            <>
              <div
                className={`absolute text-center text-sm ${milestone.x_pct_tw}`}
              >
                <div
                  className="relative flex flex-col left-[-50%]"
                  data-tip
                  data-for="timeline-hover"
                >
                  <div
                    className={
                      milestone.name == "80pct" ? "text-green-600" : ""
                    }
                  >
                    {milestone.date_display}
                  </div>
                  <div
                    className={
                      "text-xs " +
                      (milestone.name == "80pct"
                        ? "text-green-700"
                        : "text-gray-500")
                    }
                  >
                    {milestone.name_display}
                  </div>
                </div>
              </div>
              <ReactTooltip
                id="timeline-hover"
                type="dark"
                effect="solid"
                place="top"
              >
                <p>40% fully vaccinated </p>
                <p>in 7 days</p>
              </ReactTooltip>
            </>
          ))}
        </div>

        {/* svg timeline */}
        <svg width="100%" height="50px">
          {/* mainline */}
          <line
            x1={0}
            y1={TIMELINE_CONST.Y_PCT}
            x2={"50%"}
            y2={TIMELINE_CONST.Y_PCT}
            stroke="white"
            strokeWidth="2"
          />
          <line
            x1={"50%"}
            y1={TIMELINE_CONST.Y_PCT}
            x2={"100%"}
            y2={TIMELINE_CONST.Y_PCT}
            stroke="#444"
          />

          {/* ticks */}
          {timeline_data.map((milestone) => (
            <>
              <line
                x1={milestone.x_pct}
                y1={25}
                x2={milestone.x_pct}
                y2={15}
                stroke={milestone.name == "80pct" ? "green" : "white"}
              />
              <circle
                cx={milestone.x_pct}
                cy={TIMELINE_CONST.Y_PCT}
                r={TIMELINE_CONST.OUT_CIRCLE_R}
                fill="#1F2937"
                stroke={milestone.name == "80pct" ? "green" : "white"}
              />
              {milestone.has_past ? (
                <circle
                  cx={milestone.x_pct}
                  cy={TIMELINE_CONST.Y_PCT}
                  r={TIMELINE_CONST.IN_CIRCLE_R}
                  fill="white"
                />
              ) : (
                ""
              )}
            </>
          ))}

          <line
            x1={"50%"}
            y1={TIMELINE_CONST.TICK_FULL_Y1}
            x2={"50%"}
            y2={TIMELINE_CONST.TICK_FULL_Y2}
            stroke="white"
          />
        </svg>

        {/* bottom status */}
        <div className="flex flex-wrap justify-between w-full px-10 items-end">
          {/* 7 day rate */}
          <div className="flex flex-col group">
            {/* by dose */}
            <div className="flex space-x-2 opacity-10 group-hover:opacity-100">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs uppercase text-gray-500">1st Dose</p>

                <p className="text-md text-gray-400">256,549</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs uppercase text-gray-500">2nd Dose</p>

                <p className="text-md text-gray-400">139,147</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-2 opacity-80 group-hover:opacity-100">
              <div className="flex items-center">
                <p className="text-3xl">395,696</p>
                <p className="w-2 ml-2 text-green-500">
                  <FontAwesomeIcon icon="caret-up" />
                </p>
              </div>
              <p className="text-xs uppercase text-gray-500 pt-1">7-Day Rate</p>
            </div>
          </div>

          {/* today status */}
          <div className="flex flex-col items-center justify-center">
            <p>TODAY</p>
            <p className="text-5xl font-bold text-green-500">4,531,550</p>
            <p className="">(13.7%)</p>
            <p className="text-xs uppercase text-gray-500 pt-1">
              Fully Vaccinated
            </p>
          </div>
          {/* latest rate */}
          <div className="flex flex-col group">
            {/* by dose */}
            <div className="flex space-x-2 opacity-10 group-hover:opacity-100">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs uppercase text-gray-500">1st Dose</p>

                <p className="text-md text-gray-400">256,549</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs uppercase text-gray-500">2nd Dose</p>

                <p className="text-md text-gray-400">139,147</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-2 opacity-80 group-hover:opacity-100">
              <div className="flex items-center">
                <p className="text-3xl">344,961</p>
                <p className="w-2 ml-2 text-green-500">
                  <FontAwesomeIcon icon="caret-up" />
                </p>
              </div>

              <p className="text-xs uppercase text-gray-500 pt-1">
                Latest Rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <footer className="flex items-center justify-center w-full h-24">
        <a
          className="flex items-center justify-center"
          href="https://twitter.com/embr"
          target="_blank"
          rel="noopener noreferrer"
        >
          By embr
        </a>
      </footer> */}
    </div>
  );
}
