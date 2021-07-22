import Head from "next/head";
import React, { useState } from "react";
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

// const timelineData = {
//   total: [
//     {
//       name: "begin",
//       name_display: "Start",
//       milestone_label: "",
//       x_pct: "20%",
//       x_pct_val: 0,
//       n_days: 148,
//       date_display: "24 Feb",
//       x_pct_tw: "left-[20.00%]",
//       has_past: true,
//       n_count: "0",
//     },
//     {
//       name: "10pct",
//       name_display: "10%",
//       milestone_label: "NRP Phase 1 \u2192 2",
//       x_pct_val: 0.1,
//       n_days: 13,
//       n_count: "3,190,789",
//       date_display: "09 Jul",
//       x_pct: "46.84%",
//       x_pct_tw: "left-[46.84%]",
//       has_past: true,
//     },
//     {
//       name: "40pct",
//       name_display: "40%",
//       milestone_label: "NRP Phase 2 \u2192 3",
//       x_pct_val: 0.4,
//       n_days: 60,
//       date_display: "20 Sep",
//       x_pct: "64.56%",
//       x_pct_tw: "left-[64.56%]",
//       has_past: false,
//       n_count: "13,062,960",
//     },
//     {
//       name: "60pct",
//       name_display: "60%",
//       milestone_label: "NRP Phase 3 \u2192 4",
//       x_pct_val: 0.6,
//       n_days: 109,
//       date_display: "08 Nov",
//       x_pct: "76.46%",
//       x_pct_tw: "left-[76.46%]",
//       has_past: false,
//       n_count: "19,594,440",
//     },
//     {
//       name: "80pct",
//       name_display: "80%",
//       milestone_label: "Herd Immunity Target",
//       x_pct_val: 0.8,
//       n_days: 157,
//       date_display: "26 Dec",
//       x_pct: "88.11%",
//       x_pct_tw: "left-[88.11%]",
//       has_past: false,
//       n_count: "26,125,920",
//     },
//   ],
//   adult: [
//     {
//       name: "begin",
//       name_display: "Start",
//       milestone_label: "",
//       x_pct: "20%",
//       x_pct_val: 0,
//       n_days: 148,
//       date_display: "24 Feb",
//       x_pct_tw: "left-[20.00%]",
//       has_past: true,
//       n_count: "0",
//     },
//     {
//       name: "10pct",
//       name_display: "10%",
//       milestone_label: "NRP Phase 1 \u2192 2",
//       x_pct_val: 0.1,
//       n_days: 13,
//       n_count: "3,190,789",
//       date_display: "09 Jul",
//       x_pct: "45.26%",
//       x_pct_tw: "left-[45.26%]",
//       has_past: true,
//     },
//     {
//       name: "40pct",
//       name_display: "40%",
//       milestone_label: "NRP Phase 2 \u2192 3",
//       x_pct_val: 0.4,
//       n_days: 32,
//       date_display: "23 Aug",
//       x_pct: "61.68%",
//       x_pct_tw: "left-[61.68%]",
//       has_past: false,
//       n_count: "9,363,840",
//     },
//     {
//       name: "60pct",
//       name_display: "60%",
//       milestone_label: "NRP Phase 3 \u2192 4",
//       x_pct_val: 0.6,
//       n_days: 67,
//       date_display: "27 Sep",
//       x_pct: "74.45%",
//       x_pct_tw: "left-[74.45%]",
//       has_past: false,
//       n_count: "14,045,760",
//     },
//     {
//       name: "80pct",
//       name_display: "80%",
//       milestone_label: "Herd Immunity Target",
//       x_pct_val: 0.8,
//       n_days: 102,
//       date_display: "01 Nov",
//       x_pct: "87.23%",
//       x_pct_tw: "left-[87.23%]",
//       has_past: false,
//       n_count: "18,727,680",
//     },
//   ],
// };

export default function Home({
  progressData,
  timelineData,
  stateData,
  dosesData,
}) {
  const [useTotalPop, setUsePopState] = useState(false);
  const [progressDataState, setProgressDataState] = useState(
    progressData.adult
  );
  const [timelineDataState, setTimelineDataState] = useState(
    timelineData.adult
  );
  const [stateDataState, setStateDataState] = useState(stateData.adult);
  const handleSetPopChange = (event) => {
    const checked = event.target.checked;
    setUsePopState(checked);
    setProgressDataState(checked ? progressData.total : progressData.adult);
    setTimelineDataState(checked ? timelineData.total : timelineData.adult);
    setStateDataState(checked ? stateData.total : stateData.adult);
    window.gtag("event", "toggle_pop", { is_total_pop: checked });
  };
  return (
    <div className="bg-gray-800 text-gray-300 font-b612-mono flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>MY Vax Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-full flex-1 p-10 md:px-20 md:pt-20">
        {/* credits */}
        <div className="absolute left-2 top-2">
          <a
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400 uppercase opacity-80 hover:opacity-100"
            href="https://www.linkedin.com/in/shenghan/"
            data-tip
            data-for="credits-hover"
          >
            by
          </a>
          <ReactTooltip id="credits-hover" type="dark" place="right">
            <p className="text-xs text-gray-400">
              citf + py + reactjs + tailwindcss
            </p>
            <p className="text-xs text-gray-400">
              feedback: shenghan@gmail.com
            </p>
          </ReactTooltip>
        </div>
        {/* big header */}
        <div className="flex items-center justify-between">
          <h1
            className="text-4xl md:text-6xl font-bold uppercase"
            data-tip
            data-for="days-hover"
          >
            Malaysia: Herd Immunity in{" "}
            <span className="inline-flex flex-col text-green-500">
              {progressDataState.herd_days} days
              <p className="text-sm text-green-700 text-right">
                <span className="w-4">
                  {/* <FontAwesomeIcon icon="calendar" /> */}
                </span>{" "}
                {progressDataState.herd_date_dp}
              </p>
            </span>
          </h1>
          <div
            className="flex items-center"
            data-tip
            data-for="pop-option-hover"
          >
            <p className="uppercase text-xs text-gray-300 p-2">Adult</p>
            <label
              htmlFor="useTotalPop"
              className="flex items-center cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={!!useTotalPop}
                  onChange={handleSetPopChange}
                  id="useTotalPop"
                  className="sr-only"
                />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
              </div>
            </label>
            <p className="uppercase text-xs text-gray-300 p-2">Total</p>
          </div>
          <ReactTooltip id="pop-option-hover" type="dark">
            <p className="w-40">
              Figures based on adult population (&gt; 18 yo) or total population
            </p>
          </ReactTooltip>
        </div>

        <ReactTooltip id="days-hover" type="dark" effect="solid" place="top">
          <p>
            Estimated based on current vaccination rate (past 7-day average) to
            achieve
            <br /> 80% full vaccination of {progressDataState.total_pop_dp}{" "}
            Malaysian{useTotalPop ? "s" : " Adults"}
          </p>
        </ReactTooltip>
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
              style={{
                width: progressDataState.full_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-400 hover:opacity-80"
              data-tip
              data-for="prog-full-hover"
            >
              {progressDataState.full_dp}
            </div>
            <ReactTooltip
              id="prog-full-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressDataState.full_count_dp}</p>{" "}
              <p>received 2 doses</p>
            </ReactTooltip>
            <div
              style={{
                width: progressDataState.partial_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400 hover:opacity-80"
              data-tip
              data-for="prog-partial-hover"
            >
              {progressDataState.partial_dp}
            </div>
            <ReactTooltip
              id="prog-partial-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressDataState.partial_count_dp}</p>{" "}
              <p>received only 1 dose</p>
              <p className="text-xl">{progressDataState.total_count_dp}</p>{" "}
              <p>received at least 1 dose</p>
            </ReactTooltip>
            <div
              style={{
                width: progressDataState.reg_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500 hover:opacity-80"
              data-tip
              data-for="prog-reg-hover"
            >
              {progressDataState.reg_dp}
            </div>
            <ReactTooltip
              id="prog-reg-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressDataState.reg_count_dp}</p>{" "}
              <p>
                registered for vaccination but haven't received their doses yet
              </p>
              <p className="text-xl">{progressDataState.total_reg_count_dp}</p>{" "}
              <p>total registered for vaccination so far</p>
            </ReactTooltip>
            <div
              style={{
                width: progressDataState.unreg_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-700 hover:opacity-80"
              data-tip
              data-for="prog-unreg-hover"
            >
              {progressDataState.unreg_dp}
            </div>
            <ReactTooltip
              id="prog-unreg-hover"
              type="dark"
              className="text-center"
            >
              <p className="text-xl">{progressDataState.unreg_count_dp}</p>{" "}
              <p>
                have not registered for vaccination nor received their doses
              </p>
            </ReactTooltip>
          </div>
          {/* bar labels */}
          <div className="overflow-hidden h-8 text-xs flex uppercase text-gray-300">
            <div
              style={{
                width: progressDataState.full_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center justify-center"
              data-tip
              data-for="prog-full-hover"
            >
              Fully Vaccinated
            </div>
            <div
              style={{
                width: progressDataState.partial_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center justify-center"
              data-tip
              data-for="prog-partial-hover"
            >
              First Dose Only
            </div>
            <div
              style={{
                width: progressDataState.reg_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap justify-center"
              data-tip
              data-for="prog-reg-hover"
            >
              Registered
            </div>
            <div
              style={{
                width: progressDataState.unreg_dp,
                transition: `width 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap justify-center"
              data-tip
              data-for="prog-unreg-hover"
            >
              Unregistered
            </div>
          </div>
        </div>
        {/* charts */}
        <div className="flex flex-wrap justify-between space-y-9 md:space-y-0">
          <div className="w-full md:w-2/5 h-52 md:h-72 opacity-80">
            <StateCharts stateData={stateDataState} />
            <p className="uppercase text-xs text-gray-500">By State</p>
          </div>
          <div className="w-full md:w-2/5 h-52 md:h-72 opacity-80">
            <DailyCharts dosesData={dosesData} />
            <p className="uppercase text-xs text-gray-500 text-right">
              Daily Doses
            </p>
          </div>
        </div>
      </main>
      {/* bottom section */}
      <div className="flex flex-col items-center justify-center w-full pb-5">
        {/* timeline labels */}
        <div className="relative h-10 w-full uppercase">
          {timelineDataState.map((milestone) => (
            <div
              className={
                "absolute text-center text-sm " + milestone["x_pct_tw"]
              }
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
        <ReactTooltip
          id="timeline-hover"
          type="dark"
          className="text-center"
          getContent={(dataTip) => {
            if (dataTip == null) {
              return;
            }
            let milestone = timelineDataState.find((o) => o.name === dataTip);
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
                  <p>{milestone.milestone_label}</p>
                  <p className="text-3xl font-bold">{milestone.name_display}</p>
                  <p>or</p>
                  <p className="text-3xl font-bold">{milestone.n_count}</p>
                  <p>{useTotalPop ? "population" : "adults"} vaccinated</p>
                  <p className="uppercase text-green-500 font-bold text-xl">
                    {milestone.has_past
                      ? `${milestone.n_days} days ago`
                      : `in ${milestone.n_days} days`}
                  </p>
                </div>
              );
          }}
        />

        {/* svg timeline */}
        <svg width="100%" height="50px">
          {/* mainline */}
          <line
            id="timeline-bg"
            x1={0}
            y1={TIMELINE_CONST.Y_PCT}
            x2={"100%"}
            y2={TIMELINE_CONST.Y_PCT}
            stroke="#4B5563"
          />
          <line
            id="timeline-main"
            x1={0}
            y1={TIMELINE_CONST.Y_PCT}
            x2={"50%"}
            y2={TIMELINE_CONST.Y_PCT}
            stroke="white"
            strokeWidth="2"
          />

          {/* ticks */}
          {timelineDataState.map((milestone) => (
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
                <p className="text-3xl">{progressDataState.rate_avg}</p>
                <p className="w-2 ml-2">
                  {progressDataState.is_rate_avg_incr ? (
                    <FontAwesomeIcon
                      className="text-green-500"
                      icon="caret-up"
                    />
                  ) : (
                    <FontAwesomeIcon
                      className="text-red-500"
                      icon="caret-down"
                    />
                  )}
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

                    <p className="text-lg">{progressDataState.rate_avg_d1}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">2nd Dose</p>

                    <p className="text-lg">{progressDataState.rate_avg_d2}</p>
                  </div>
                </div>
                <p className="text-3xl">{progressDataState.rate_avg_100}</p>
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
            <p className="uppercase">{progressDataState.today_date_dp}</p>
            <p className="text-5xl font-bold text-green-500">
              {progressDataState.full_count_dp}
            </p>
            <p className="">({progressDataState.full_dp})</p>
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
                  {progressDataState.total_count_dp}
                </p>
                <p className="text-xs uppercase text-gray-200 pt-1">
                  Total Doses Administered
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
                <p className="text-3xl">{progressDataState.rate_latest}</p>
                <p className="w-2 ml-2">
                  {progressDataState.is_rate_latest_incr ? (
                    <FontAwesomeIcon
                      className="text-green-500"
                      icon="caret-up"
                    />
                  ) : (
                    <FontAwesomeIcon
                      className="text-red-500"
                      icon="caret-down"
                    />
                  )}
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

                    <p className="text-lg">
                      {progressDataState.rate_latest_d1}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">2nd Dose</p>

                    <p className="text-lg">
                      {progressDataState.rate_latest_d2}
                    </p>
                  </div>
                </div>
                <p className="text-3xl">{progressDataState.rate_latest_100}</p>
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
