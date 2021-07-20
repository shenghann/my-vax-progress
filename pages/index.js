import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StateCharts from "../components/state-chart";
import DailyCharts from "../components/daily-chart";
import dynamic from "next/dynamic";
import { getData } from "../lib/data";

const ReactTooltip = dynamic(() => import("react-tooltip"), {
  ssr: false,
});

export async function getStaticProps() {
  const allData = getData();
  return {
    props: {
      progressData: allData.progress,
      timelineData: allData.timeline,
      dosesData: allData.doses,
      stateData: allData.state,
    },
  };
}

const TIMELINE_CONST = {
  Y_PCT: "50%",
  IN_CIRCLE_R: 2,
  OUT_CIRCLE_R: 5,
  TICK_FULL_Y1: 30,
  TICK_FULL_Y2: 20,
};

const timelineData = [
  {
    name: "begin",
    name_display: "Start",
    x_pct: "20%",
    x_pct_val: 0,
    date_display: "24 Feb",
    x_pct_tw: "left-[20%]",
    has_past: true,
    n_days: 146,
    n_count: "0",
  },
  {
    name: "10pct",
    name_display: "10%",
    x_pct_val: 0.1,
    date_display: "09 Jul",
    x_pct: "45.90%",
    x_pct_tw: "left-[45.90%]",
    has_past: true,
    n_days: 11,
    n_count: "2,340,960",
  },
  {
    name: "40pct",
    name_display: "40%",
    x_pct_val: 0.4,
    date_display: "22 Aug",
    x_pct: "62.31%",
    x_pct_tw: "left-[62.31%]",
    has_past: false,
    n_days: 33,
    n_count: "9,363,840",
  },
  {
    name: "60pct",
    name_display: "60%",
    x_pct_val: 0.6,
    date_display: "25 Sep",
    x_pct: "75.00%",
    x_pct_tw: "left-[75.00%]",
    has_past: false,
    n_days: 67,
    n_count: "14,045,760",
  },
  {
    name: "80pct",
    name_display: "80%",
    x_pct_val: 0.8,
    date_display: "28 Oct",
    x_pct: "87.31%",
    x_pct_tw: "left-[87.31%]",
    has_past: false,
    n_days: 100,
    n_count: "18,727,680",
  },
];
export default function Home({
  progressData,
  // timelineData,
  stateData,
  dosesData,
}) {
  return (
    <div className="bg-gray-800 text-gray-300 font-b612-mono flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>MY Vax Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-full flex-1 p-10 md:p-20">
        <div className="flex">
          {/* credits */}
          <div className="absolute right-2 top-2">
            <a
              className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400 uppercase opacity-80 hover:opacity-100"
              href="mailto:shenghan@gmail.com"
              data-tip
              data-for="credits-hover"
            >
              by
            </a>
            <ReactTooltip id="credits-hover" type="dark" place="left">
              <p className="text-xs text-gray-400">
                citf + py + reactjs + tailwindcss
              </p>
              <p className="text-xs text-gray-400">
                feedback: shenghan@gmail.com
              </p>
            </ReactTooltip>
          </div>
          {/* big header */}
          <h1
            className="text-4xl md:text-6xl font-bold uppercase"
            data-tip
            data-for="days-hover"
          >
            Malaysia: Herd Immunity in{" "}
            <span className="inline-flex flex-col text-green-500">
              {progressData.herd_days} days
              <p className="text-sm text-green-700 text-right">
                {progressData.herd_date_dp}
              </p>
            </span>
          </h1>
          <ReactTooltip id="days-hover" type="dark" effect="solid" place="top">
            <p>
              Estimated based on current vaccination rate (past 7-day average)
              to achieve
              <br /> 80% full vaccination of {progressData.adult_pop_dp}{" "}
              Malaysian Adults
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
          <div className="relative h-2 text-xs">
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
          <div className="overflow-hidden h-12 text-xs flex rounded bg-gray-600">
            <div
              style={{ width: progressData.full_dp }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-400 hover:opacity-80"
              data-tip
              data-for="prog-full-hover"
            >
              {progressData.full_dp}
            </div>
            <ReactTooltip
              id="prog-full-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressData.full_count_dp}</p>{" "}
              <p>received 2 doses</p>
            </ReactTooltip>
            <div
              style={{ width: progressData.partial_dp }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400 hover:opacity-80"
              data-tip
              data-for="prog-partial-hover"
            >
              {progressData.partial_dp}
            </div>
            <ReactTooltip
              id="prog-partial-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressData.partial_count_dp}</p>{" "}
              <p>received 1 dose</p>
              <p className="text-xl">{progressData.total_count_dp}</p>{" "}
              <p>received at least 1 dose</p>
            </ReactTooltip>
            <div
              style={{ width: progressData.reg_dp }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500 hover:opacity-80"
              data-tip
              data-for="prog-reg-hover"
            >
              {progressData.reg_dp}
            </div>
            <ReactTooltip
              id="prog-reg-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressData.reg_count_dp}</p>{" "}
              <p>
                registered for vaccination but haven't received their doses yet
              </p>
            </ReactTooltip>
            <div
              style={{ width: progressData.unreg_dp }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-700 hover:opacity-80"
              data-tip
              data-for="prog-unreg-hover"
            >
              {progressData.unreg_dp}
            </div>
            <ReactTooltip
              id="prog-unreg-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressData.unreg_count_dp}</p>{" "}
              <p>
                have not registered for vaccination nor received their doses
              </p>
            </ReactTooltip>
          </div>
          {/* bar labels */}
          <div className="overflow-hidden h-8 text-xs flex uppercase text-gray-300">
            <div
              style={{ width: progressData.full_dp }}
              className="shadow-none flex flex-col text-center justify-center"
              data-tip
              data-for="prog-full-hover"
            >
              Fully Vaccinated
            </div>
            <div
              style={{ width: progressData.partial_dp }}
              className="shadow-none flex flex-col text-center justify-center"
              data-tip
              data-for="prog-partial-hover"
            >
              First Dose
            </div>
            <div
              style={{ width: progressData.reg_dp }}
              className="shadow-none flex flex-col text-center whitespace-nowrap justify-center"
              data-tip
              data-for="prog-reg-hover"
            >
              Registered
            </div>
            <div
              style={{ width: progressData.unreg_dp }}
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
          <div className="w-full md:w-2/5 h-72 opacity-80">
            <StateCharts stateData={stateData} />
            <p className="uppercase text-xs text-gray-500">By State</p>
          </div>
          <div className="w-full md:w-2/5 h-72 opacity-80">
            <DailyCharts dosesData={dosesData} />
            <p className="uppercase text-xs text-gray-500 text-right">
              Daily Doses
            </p>
          </div>
        </div>
      </main>
      <div className="flex flex-col items-center justify-center w-full pb-5">
        {/* timeline labels */}
        <div className="relative h-10 w-full uppercase">
          {timelineData.map((milestone) => (
            <div
              className={"absolute text-center text-sm " + milestone.x_pct_tw}
            >
              <div
                className="relative flex flex-col left-[-50%] pb-20"
                data-tip={milestone.name}
                data-for="timeline-hover"
              >
                <div
                  className={milestone.name == "80pct" ? "text-green-600" : ""}
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
          ))}
        </div>
        {/* <ReactTooltip
          id="timeline-hover"
          type="dark"
          className="text-center"
          getContent={(dataTip) => {
            if (dataTip == null) {
              return;
            }
            let milestone = timelineData.find((o) => o.name === dataTip);
            if (milestone.name === "begin")
              return (
                <div>
                  <p className="w-32">
                    The Malaysian COVID-19 National Immunisation Programme
                    kick-started on 24th February, 2021
                  </p>
                  <p className="uppercase text-green-500 font-bold text-xl">
                    {milestone.n_days} days ago
                  </p>
                </div>
              );
            else
              return (
                <div>
                  <p className="text-3xl font-bold">{milestone.name_display}</p>
                  <p>or</p>
                  <p className="text-3xl font-bold">{milestone.n_count}</p>
                  <p>adults vaccinated</p>
                  <p className="uppercase text-green-500 font-bold text-xl">
                    {milestone.has_past
                      ? `${milestone.n_days} days ago`
                      : `in ${milestone.n_days} days`}
                  </p>
                </div>
              );
          }}
        /> */}

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
          {timelineData.map((milestone) => (
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
            <div
              className="flex flex-col items-center justify-center pt-2"
              data-tip
              data-for="avg-rate-hover"
            >
              <div className="flex items-center">
                <p className="text-3xl">395,696</p>
                <p className="w-2 ml-2 text-green-500">
                  <FontAwesomeIcon icon="caret-up" />
                </p>
              </div>
              <p className="text-xs uppercase text-gray-500 pt-1">7-Day Rate</p>
            </div>
            <ReactTooltip
              id="avg-rate-hover"
              type="dark"
              effect="solid"
              place="top"
            >
              <div className="flex flex-col items-center">
                {/* by dose */}
                <div className="flex space-x-2">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">1st Dose</p>

                    <p className="text-lg">{progressData.rate_avg_d1}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">2nd Dose</p>

                    <p className="text-lg">{progressData.rate_avg_d2}</p>
                  </div>
                </div>
                <p className="text-3xl">{progressData.rate_avg_100}</p>
                <p className="text-xs uppercase text-gray-200 pt-1">
                  doses per 100 people
                </p>
              </div>
            </ReactTooltip>
          </div>

          {/* today status */}
          <div
            className="flex flex-col items-center justify-center order-first md:order-none w-full md:w-min"
            data-tip
            data-for="today-status-hover"
          >
            <p>TODAY</p>
            <p className="text-5xl font-bold text-green-500">
              {progressData.full_count_dp}
            </p>
            <p className="">({progressData.full_dp})</p>
            <p className="text-xs uppercase text-gray-500 pt-1">
              Fully Vaccinated
            </p>
            <ReactTooltip
              id="today-status-hover"
              type="dark"
              effect="solid"
              place="top"
            >
              <div className="flex flex-col items-center">
                <p className="text-5xl font-bold">
                  {progressData.total_count_dp}
                </p>
                <p className="">({progressData.total_dp})</p>
                <p className="text-xs uppercase text-gray-200 pt-1">
                  Total Administered
                </p>
              </div>
            </ReactTooltip>
          </div>
          {/* latest rate */}
          <div className="flex flex-col group">
            <div
              className="flex flex-col items-center justify-center pt-2"
              data-tip
              data-for="latest-rate-hover"
            >
              <div className="flex items-center">
                <p className="text-3xl">{progressData.rate_latest}</p>
                <p className="w-2 ml-2 text-green-500">
                  <FontAwesomeIcon icon="caret-up" />
                </p>
              </div>

              <p className="text-xs uppercase text-gray-500 pt-1">
                Latest Rate
              </p>
            </div>
            <ReactTooltip
              id="latest-rate-hover"
              type="dark"
              effect="solid"
              place="top"
            >
              <div className="flex flex-col items-center">
                {/* by dose */}
                <div className="flex space-x-2">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">1st Dose</p>

                    <p className="text-lg">{progressData.rate_latest_d1}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">2nd Dose</p>

                    <p className="text-lg">{progressData.rate_latest_d2}</p>
                  </div>
                </div>
                <p className="text-3xl">{progressData.rate_latest_100}</p>
                <p className="text-xs uppercase text-gray-200 pt-1">
                  doses per 100 people
                </p>
              </div>
            </ReactTooltip>
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
