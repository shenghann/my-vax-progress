import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StateCharts from "../components/StateChart";
import DailyByVaxCharts from "../components/DailyDosesByVaxChart";
import dynamic from "next/dynamic";
import BarLoader from "react-spinners/BarLoader";
import { getAllData } from "../lib/data";
import useSWR from "swr";
import { useRouter } from "next/router";
// import Tour from "reactour";
// import ReactTooltip from "react-tooltip";

const fetcher = (url) =>
  fetch(url).then(async (res) => {
    const resp = await res.json();
    return resp;
  });

export async function getStaticProps() {
  const allData = await getAllData();
  return {
    props: { allData },
  };
}

const ReactTooltip = dynamic(() => import("react-tooltip"), {
  ssr: false,
});

const Tour = dynamic(() => import("reactour"), {
  ssr: false,
});

const TIMELINE_CONST = {
  Y_PCT: "50%",
  IN_CIRCLE_R: 2,
  OUT_CIRCLE_R: 5,
  TICK_FULL_Y1: 30,
  TICK_FULL_Y2: 20,
};

const STATES_LIST = [
  "Malaysia",
  "Johor",
  "Kedah",
  "Kelantan",
  "Klang Valley",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Pulau Pinang",
  "Perak",
  "Perlis",
  "Terengganu",
  "Sabah",
  "Sarawak",
  "W.P. Labuan",
];

const TARGET_HIT_STATES = ["Malaysia", "Negeri Sembilan", "Melaka", "Sarawak", "Klang Valley", "Terengganu", "Perlis", "W.P. Labuan"];

const STATE_ABBR = {
  jhr: "Johor",
  kdh: "Kedah",
  ktn: "Kelantan",
  mlk: "Melaka",
  nsn: "Negeri Sembilan",
  phg: "Pahang",
  prk: "Perak",
  pls: "Perlis",
  png: "Pulau Pinang",
  sbh: "Sabah",
  swk: "Sarawak",
  trg: "Terengganu",
  lbn: "W.P. Labuan",
  kv: "Klang Valley",
  my: "Malaysia",
};

const STATE_ABBR_REV = {
  Johor: "jhr",
  Kedah: "kdh",
  Kelantan: "ktn",
  Melaka: "mlk",
  "Negeri Sembilan": "nsn",
  Pahang: "phg",
  Perak: "prk",
  Perlis: "pls",
  "Pulau Pinang": "png",
  Sabah: "sbh",
  Sarawak: "swk",
  Terengganu: "trg",
  "W.P. Labuan": "lbn",
  "Klang Valley": "kv",
  Malaysia: "my",
};

const TOOLTIP_BG = "#111827";
const PBAR_MIN_PCT = 0.02;
const steps = [
  {
    selector: "#days-left",
    content: () => (
      <div>
        <p className="text-base mb-3">
          <b>Oh no, why did the dates move?</b>
        </p>
        <p>
          <b>Update 22/8/2021:</b> Projections are now improved with the addition of CITF data by vaccine types!
        </p>
        <br />
        <p>Estimated dates are based on average 1st dose rates for past 7 days. If the rates drop, projections will be pushed out.</p>
        <br />
        <p>So, check back from time to time!</p>
      </div>
    ),
    style: {
      fontFamily: "B612 Mono, monospace",
      fontSize: "0.8rem",
    },
  },
  {
    selector: "#main-title",
    content: () => (
      <div>
        <p className="text-base mb-3">
          <b>No herd immunity?</b>
        </p>
        <p>
          Yes, it has become increasingly clear that 'Herd Immunity' of Covid-19 may not be attainable. The usage of the term on this dashboard has always been
          in a non-medical sense. But this has caused some confusion, so I have removed it for good.
        </p>
      </div>
    ),
    action: (node) => {
      window.gtag("event", "see-second-tour");
    },
    style: {
      fontFamily: "B612 Mono, monospace",
      fontSize: "0.8rem",
    },
  },
  {
    selector: "#state-text-btn",
    content: "View projections for your state by tapping here. You can share your state's link with your friends!",
    style: {
      fontFamily: "B612 Mono, monospace",
      fontSize: "0.8rem",
    },
  },
];

export default function Home(props) {
  // fetch data from API
  const { data: refreshedData, error, mutate, size, setSize, isValidating } = useSWR("/api/refresh", fetcher, { initialData: props.allData });

  if (isValidating) {
    console.log("data refreshing...");
    window.gtag("event", "data_refresh");
  }

  const { by_state: byStateData, state: stateData, top_states: topStatesData } = refreshedData;

  const [isShowMenu, setisShowMenuState] = useState(false);
  const [selectedState, setSelectedState] = useState("Malaysia");
  const [useTotalPop, setUsePopState] = useState(true);
  const [popGroup, setPopGroup] = useState("total");
  const [isTourOpen, setIsTourOpen] = useState(true);

  // get state and totalpop from url
  const router = useRouter();
  useEffect(() => {
    const stateQuery = router.query.state;
    if (stateQuery != "" && stateQuery in STATE_ABBR) {
      // console.log("router state param:", stateQuery);
      // console.log("router state param:", STATE_ABBR[router.query.state]);
      setSelectedState(STATE_ABBR[router.query.state]);
    }
  }, [router.query.state]);
  useEffect(() => {
    const totalPopQuery = router.query.totalpop;
    if (typeof totalPopQuery != "undefined") {
      setUsePopState(totalPopQuery === "true");
    }
  }, [router.query.totalpop]);

  let { progress: progressData, timeline: timelineData, doses_byvax: dosesByVaxData } = byStateData[selectedState];

  let progressDataState = useTotalPop ? progressData.total : progressData.adult;
  let timelineDataState = useTotalPop ? timelineData.total : timelineData.adult;
  let stateDataState = useTotalPop ? stateData.total : stateData.adult;
  let topStatesDataState = useTotalPop ? topStatesData.total : topStatesData.adult;

  const remapData = () => {
    progressDataState = useTotalPop ? progressData.total : progressData.adult;
    timelineDataState = useTotalPop ? timelineData.total : timelineData.adult;
    stateDataState = useTotalPop ? stateData.total : stateData.adult;
    topStatesDataState = useTotalPop ? topStatesData.total : topStatesData.adult;
  };

  // population type switching
  const handleSetPopChange = (event) => {
    const checked = event.target.checked;
    router.query.totalpop = checked;
    router.push({ pathname: "", query: router.query }, undefined, {
      shallow: true,
    });
    window.gtag("event", "toggle_pop", { is_total_pop: useTotalPop });
  };

  // state selection menu
  const showMenu = (event) => {
    event.preventDefault();
    let isOpen = !isShowMenu;
    setisShowMenuState(isOpen);
  };

  const selectItem = (selected) => {
    setisShowMenuState(false);
    // push state via url param
    router.query.state = STATE_ABBR_REV[selected];
    router.push({ pathname: "", query: router.query }, undefined, {
      shallow: true,
    });
    window.gtag("event", "change_state", { selected_state: selected });
  };

  // handle menu external click
  useEffect(() => {
    const onClick = (e) => {
      // If the active element exists and is clicked outside of
      setisShowMenuState(!isShowMenu);
    };

    // If the item is active (ie open) then listen for clicks outside
    if (isShowMenu) {
      window.addEventListener("click", onClick);
    }

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [isShowMenu]);

  // readjust progress pct labels
  let total_pct = progressDataState.full + progressDataState.partial;
  let guide_pct = {
    forty: "40%",
    sixty: "60%",
    eighty: "80%",
    hundred: "100%",
  };
  if (total_pct > 1.0) {
    console.log(total_pct);
    guide_pct.forty = `${(0.4 / total_pct) * 100}%`;
    guide_pct.sixty = `${(0.6 / total_pct) * 100}%`;
    guide_pct.eighty = `${(0.8 / total_pct) * 100}%`;
    guide_pct.hundred = `${(1 / total_pct) * 100}%`;
  }

  return (
    <div className="bg-gray-800 text-gray-300 font-b612-mono flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>MY Vax Tracker</title>
        <link rel="icon" href="/favicon.ico" />

        {/* <!-- Primary Meta Tags --> */}
        <meta name="title" content="MY Vax Tracker" />
        <meta name="description" content="Malaysia's progress to 80% vaccination target tracker. How soon can we return to normallity?" />

        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vax.tehcpeng.net/" />
        <meta property="og:title" content="MY Vax Tracker" />
        <meta property="og:description" content="Malaysia's progress to 80% vaccination target tracker. How soon can we return to normallity?" />
        <meta property="og:image" content="https://vax.tehcpeng.net/images/vaxappv3.png" />

        {/* <!-- Twitter --> */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="https://vax.tehcpeng.net/" />
        <meta property="twitter:title" content="MY Vax Tracker" />
        <meta property="twitter:description" content="Malaysia's progress to 80% vaccination target tracker. How soon can we return to normallity?" />
        <meta property="twitter:image" content="https://vax.tehcpeng.net/images/vaxappv3.png" />
      </Head>

      <main className="flex flex-col w-full flex-1 p-10 md:px-20 md:pt-10">
        {/* credits */}
        <div className="absolute flex space-x-1 left-2 top-2" data-tip data-for="credits-hover">
          <a
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400 uppercase opacity-80 hover:opacity-100"
            href="https://www.linkedin.com/in/shenghan/"
            target="_blank"
          >
            ln
          </a>

          <a
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400 uppercase opacity-80 hover:opacity-100"
            href="https://twitter.com/embr"
            target="_blank"
          >
            tw
          </a>

          <a
            className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400 uppercase opacity-80 hover:opacity-100"
            href="https://github.com/CITF-Malaysia/citf-public"
            target="_blank"
          >
            ci
          </a>

          <a
            className="p-1.5 w-6 h-6 rounded bg-gray-700 text-gray-400 uppercase opacity-80 hover:opacity-100"
            href="https://www.buymeacoffee.com/shenghan"
            target="_blank"
          >
            <FontAwesomeIcon icon="mug-hot" />
          </a>
          <ReactTooltip id="credits-hover" type="dark" place="right" backgroundColor={TOOLTIP_BG}>
            <p className="text-xs text-gray-400">citf + py + reactjs + tailwindcss</p>
            <p className="text-xs text-gray-400">feedback: shenghan@gmail.com</p>
          </ReactTooltip>
        </div>
        {/* big header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl md:text-6xl font-bold uppercase">
            <span
              className="cursor-pointer rounded bg-gray-600 md:bg-gray-600 md:px-2 hover:bg-gray-500 hover:text-gray-100"
              onClick={showMenu}
              data-tip
              data-for="state-hover"
              id="state-text-btn"
              // ref={(ref) => (stateHoverRef = ref)}
            >
              {selectedState}
            </span>
            <span id="main-title" data-tip data-for="days-hover">
              {progressDataState.herd_days <= 0
                ? `: ${useTotalPop ? "80%" : "80% Adults"} Fully Vaccinated target `
                : `: ${useTotalPop ? "80%" : "80% Adults"} Fully Vaccinated in `}
            </span>
            <span id="days-left" className="inline-flex flex-col text-green-500" data-tip data-for="days-hover">
              <span className="flex">
                {progressDataState.herd_days <= 0
                  ? "reached"
                  : progressDataState.herd_days == 1
                  ? progressDataState.herd_days + " day"
                  : progressDataState.herd_days + " days"}{" "}
                <span className="w-4 md:w-5 opacity-80">
                  {progressDataState.is_rate_avg_incr ? (
                    <FontAwesomeIcon className="text-green-500" icon="caret-up" />
                  ) : (
                    <FontAwesomeIcon className="text-red-500" icon="caret-down" />
                  )}
                </span>
              </span>

              <p className="text-sm text-green-700 text-right tracking-normal">
                <span className="w-4"></span> {progressDataState.herd_date_dp}
              </p>
            </span>
          </h1>
          {isShowMenu ? (
            <div className="absolute top-24 md:top-32 flex flex-col rounded w-auto opacity-90 bg-tooltip-black text-2xl md:text-2xl z-10">
              {STATES_LIST.map((stateName) => (
                <button className="text-left uppercase hover:bg-gray-700" onClick={() => selectItem(stateName)} key={stateName}>
                  {stateName}
                </button>
              ))}
            </div>
          ) : (
            ""
          )}

          {/* adult total switch */}
          <div id="pop-switch" className="flex flex-col items-center space-y-3" data-tip data-for="pop-option-hover">
            <p className="uppercase text-xs text-gray-300 p-2">Adult</p>
            <label htmlFor="useTotalPop" className="flex items-center cursor-pointer rotate-90">
              <div className="relative">
                <input type="checkbox" checked={!!useTotalPop} onChange={handleSetPopChange} id="useTotalPop" className="sr-only" />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
              </div>
            </label>
            <p className="uppercase text-xs text-gray-300 p-2">Total</p>
          </div>
          <ReactTooltip className="tooltip" id="pop-option-hover" type="dark" backgroundColor={TOOLTIP_BG}>
            <p className="w-40">Switch between ADULT (&gt; 18 yo) or TOTAL population estimates</p>
          </ReactTooltip>
        </div>

        <ReactTooltip
          id="days-hover"
          type="dark"
          className="w-[50%]"
          afterShow={() => {
            window.gtag("event", "view_disclaimer");
          }}
          backgroundColor={TOOLTIP_BG}
        >
          <p>
            Estimated based on current first dose rate (past 7-day average) to achieve 80% full vaccination of {progressDataState.total_pop_dp}{" "}
            {useTotalPop ? " people" : " Adults"}. Projections will adapt to changes in latest daily rate of doses administered and reported by CITF.
          </p>
          {/* <p className="text-xs text-gray-300 italic">
            *The term 'herd immunity' is being loosely used to indicate this 80%
            target and does not necessarily imply so in a medical sense
          </p> */}
        </ReactTooltip>
        <ReactTooltip id="state-hover" type="dark" place="top" backgroundColor={TOOLTIP_BG}>
          <p>Tap to change state!</p>
        </ReactTooltip>

        {/* <Tour
          steps={steps}
          isOpen={isTourOpen}
          rounded={4}
          onRequestClose={() => setIsTourOpen(false)}
          showNumber={false}
          showNavigation={false}
        /> */}
        {/* auto refresh loader */}
        <div className="flex">
          <BarLoader color="#ccc" loading={isValidating} size="200px" height={2} />
        </div>

        {/* css progress bar  */}
        <div className="hidden md:inline py-4">
          {/* percentage labels */}
          <div className="relative h-5 text-xs">
            <div className="absolute uppercase text-gray-500 hidden sm:block">National Progress</div>
            <div
              style={{
                left: guide_pct.forty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute"
            >
              <div className="relative left-[-50%]">40%</div>
            </div>
            <div
              style={{
                left: guide_pct.sixty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute"
            >
              <div className="relative left-[-50%]">60%</div>
            </div>
            <div
              style={{
                left: guide_pct.eighty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute text-green-500"
            >
              <div className="relative left-[-50%]">80%</div>
            </div>
            {total_pct > 1.1 ? (
              <div
                style={{
                  left: guide_pct.hundred,
                  transition: `width 0.5s ease-out`,
                }}
                className="absolute"
              >
                <div className="relative left-[-50%]">100%</div>
              </div>
            ) : (
              ""
            )}
          </div>
          {/* dotted lines */}
          <div className="relative h-3 text-xs">
            <div
              style={{
                left: guide_pct.forty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute"
            >
              <div className="relative left-[-50%] h-10 md:h-12 border-r-2 border-dashed"></div>
            </div>
            <div
              style={{
                left: guide_pct.sixty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute"
            >
              <div className="relative left-[-50%] h-10 md:h-12 border-r-2 border-dashed"></div>
            </div>
            <div
              style={{
                left: guide_pct.eighty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute text-green-500"
            >
              <div className="relative left-[-50%] h-10 md:h-12 border-r-2 border-dashed border-green-500"></div>
            </div>
            {total_pct > 1.1 ? (
              <div
                style={{
                  left: guide_pct.hundred,
                  transition: `width 0.5s ease-out`,
                }}
                className="absolute text-green-500"
              >
                <div className="relative left-[-50%] h-10 md:h-12 border-r-2 border-dashed"></div>
              </div>
            ) : (
              ""
            )}
          </div>

          {/* actual bars */}
          <div className="overflow-hidden h-8 md:h-10 text-xs flex rounded bg-gray-600">
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
          </div>
          {/* bar labels */}
          <div className="overflow-hidden h-8 text-xs flex uppercase text-gray-400">
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
              Partially Vaccinated
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
              {progressDataState.reg > 0 ? "Registered" : ""}
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
              {progressDataState.unreg > 0 ? "Unregistered" : ""}
            </div>
          </div>

          {/* vaccine type breakdown */}
          <div className="group">
            <div className="overflow-hidden h-5 md:h-5 text-xs flex rounded bg-gray-700 opacity-75 group-hover:opacity-100">
              {/* FULL PFIZER */}
              <div
                style={{
                  width: progressDataState.full_pf_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pf-2nd hover:opacity-80"
                data-tip
                data-for="prog-full-pf-hover"
              >
                {progressDataState.full_pf_bar > PBAR_MIN_PCT ? progressDataState.full_pf_dp : ""}
              </div>

              {/* FULL SINOVAC */}
              <div
                style={{
                  width: progressDataState.full_sn_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sn-2nd hover:opacity-80"
                data-tip
                data-for="prog-full-sn-hover"
              >
                {progressDataState.full_sn_bar > PBAR_MIN_PCT ? progressDataState.full_sn_dp : ""}
              </div>

              {/* FULL AZ */}
              <div
                style={{
                  width: progressDataState.full_az_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-az-2nd hover:opacity-80"
                data-tip
                data-for="prog-full-az-hover"
              >
                {progressDataState.full_az_bar > PBAR_MIN_PCT ? progressDataState.full_az_dp : ""}
              </div>

              {/* FULL CANSINO */}
              <div
                style={{
                  width: progressDataState.full_cn_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cn-2nd hover:opacity-80"
                data-tip
                data-for="prog-full-cn-hover"
              >
                {progressDataState.full_cn_bar > PBAR_MIN_PCT ? progressDataState.full_cn_dp : ""}
              </div>

              {/* PARTIAL PFIZER */}
              <div
                style={{
                  width: progressDataState.partial_pf_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pf-1st hover:opacity-80"
                data-tip
                data-for="prog-partial-pf-hover"
              >
                {progressDataState.partial_pf_bar > PBAR_MIN_PCT ? progressDataState.partial_pf_dp : ""}
              </div>

              {/* PARTIAL SINOVAC */}
              <div
                style={{
                  width: progressDataState.partial_sn_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sn-1st hover:opacity-80"
                data-tip
                data-for="prog-partial-sn-hover"
              >
                {progressDataState.partial_sn_bar > PBAR_MIN_PCT ? progressDataState.partial_sn_dp : ""}
              </div>

              {/* PARTIAL AZ */}
              <div
                style={{
                  width: progressDataState.partial_az_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-az-1st hover:opacity-80"
                data-tip
                data-for="prog-partial-az-hover"
              >
                {progressDataState.partial_az_bar > PBAR_MIN_PCT ? progressDataState.partial_az_dp : ""}
              </div>
            </div>

            {/* labels for vaccine type breakdown */}
            <div className="overflow-hidden h-8 text-xs flex uppercase text-gray-400  opacity-75 group-hover:opacity-100">
              {/* FULL PFIZER */}
              <div
                style={{
                  width: progressDataState.full_pf_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center justify-center"
                data-tip
                data-for="prog-full-pf-hover"
              >
                {progressDataState.full_pf_bar > PBAR_MIN_PCT ? "Pfizer" : ""}
              </div>

              {/* FULL SINOVAC */}
              <div
                style={{
                  width: progressDataState.full_sn_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center justify-center"
                data-tip
                data-for="prog-full-sn-hover"
              >
                {progressDataState.full_sn_bar > PBAR_MIN_PCT ? "Sinovac" : ""}
              </div>

              {/* FULL AZ */}
              <div
                style={{
                  width: progressDataState.full_az_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center justify-center"
                data-tip
                data-for="prog-full-az-hover"
              >
                {progressDataState.full_az_bar > PBAR_MIN_PCT ? "AZ" : ""}
              </div>

              {/* FULL CANSINO */}
              <div
                style={{
                  width: progressDataState.full_cn_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center justify-center"
                data-tip
                data-for="prog-full-cn-hover"
              >
                {progressDataState.full_cn_bar > PBAR_MIN_PCT ? "CanSino" : ""}
              </div>

              {/* PARTIAL PFIZER */}

              <div
                style={{
                  width: progressDataState.partial_pf_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center justify-center"
                data-tip
                data-for="prog-partial-pf-hover"
              >
                {progressDataState.partial_pf_bar > PBAR_MIN_PCT ? "Pfizer" : ""}
              </div>

              {/* PARTIAL SINOVAC */}

              <div
                style={{
                  width: progressDataState.partial_sn_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center justify-center"
                data-tip
                data-for="prog-partial-sn-hover"
              >
                {progressDataState.partial_sn_bar > PBAR_MIN_PCT ? "Sinovac" : ""}
              </div>

              {/* PARTIAL AZ */}

              <div
                style={{
                  width: progressDataState.partial_az_bar_dp,
                  transition: `width 0.5s ease-out`,
                }}
                className="shadow-none flex flex-col text-center justify-center"
                data-tip
                data-for="prog-partial-az-hover"
              >
                {progressDataState.partial_az_bar > PBAR_MIN_PCT ? "AZ" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* css progress bar vertical */}
        <div className="flex h-80 md:hidden justify-center space-x-2 my-8 md:my-5">
          {/* percentage labels */}
          <div className="relative flex-grow w-4 text-xs">
            {/* <div className="absolute uppercase text-gray-500 hidden sm:block">
              National Progress
            </div> */}
            {total_pct > 1.1 ? (
              <div
                style={{
                  bottom: guide_pct.hundred,
                  transition: `width 0.5s ease-out`,
                }}
                className="absolute right-0"
              >
                <div className="absolute -translate-y-2 right-2">100%</div>
              </div>
            ) : (
              ""
            )}
            <div
              style={{
                bottom: guide_pct.eighty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute right-0 text-green-500"
            >
              <div className="absolute -translate-y-2 right-2">80%</div>
            </div>
            <div
              style={{
                bottom: guide_pct.sixty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute right-0"
            >
              <div className="absolute -translate-y-2 right-2">60%</div>
            </div>
            <div
              style={{
                bottom: guide_pct.forty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute right-0"
            >
              <div className="absolute -translate-y-2 right-2">40%</div>
            </div>
          </div>
          {/* dotted lines */}
          <div className="relative w-2">
            {total_pct > 1.1 ? (
              <div
                style={{
                  bottom: guide_pct.hundred,
                  transition: `width 0.5s ease-out`,
                }}
                className="absolute text-green-500"
              >
                <div className="relative w-32 border-t-2 border-dashed"></div>
              </div>
            ) : (
              ""
            )}
            <div
              style={{
                bottom: guide_pct.eighty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute text-green-500"
            >
              <div className="relative w-32 border-t-2 border-dashed border-green-500"></div>
            </div>
            <div
              style={{
                bottom: guide_pct.sixty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute"
            >
              <div className="relative w-32 border-t-2 border-dashed"></div>
            </div>
            <div
              style={{
                bottom: guide_pct.forty,
                transition: `width 0.5s ease-out`,
              }}
              className="absolute"
            >
              <div className="relative w-32 border-t-2 border-dashed"></div>
            </div>
          </div>

          {/* vax type bar labels */}
          <div className="w-6 text-xs flex-grow-0 flex-col uppercase text-gray-400">
            <div
              style={{
                height: progressDataState.unreg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
            ></div>
            <div
              style={{
                height: progressDataState.reg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
            ></div>

            <div
              style={{
                height: progressDataState.partial_az_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
              data-tip
              data-for="prog-partial-az-hover"
            >
              AZ
            </div>

            <div
              style={{
                height: progressDataState.partial_sn_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
              data-tip
              data-for="prog-partial-sn-hover"
            >
              Sinovac
            </div>

            <div
              style={{
                height: progressDataState.partial_pf_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
              data-tip
              data-for="prog-partial-pf-hover"
            >
              Pfizer
            </div>

            <div
              style={{
                height: progressDataState.full_cn_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
              data-tip
              data-for="prog-full-cn-hover"
            >
              CanSino
            </div>
            <div
              style={{
                height: progressDataState.full_az_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
              data-tip
              data-for="prog-full-az-hover"
            >
              AZ
            </div>
            <div
              style={{
                height: progressDataState.full_sn_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
              data-tip
              data-for="prog-full-sn-hover"
            >
              Sinovac
            </div>
            <div
              style={{
                height: progressDataState.full_pf_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-end items-center"
              data-tip
              data-for="prog-full-pf-hover"
            >
              Pfizer
            </div>
          </div>

          {/* vax type bars */}
          <div className="overflow-hidden w-4 text-xs flex-grow-0 flex-col items-end rounded bg-gray-700">
            <div
              style={{
                height: progressDataState.reg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-600 content-center hover:opacity-80"
            ></div>
            <div
              style={{
                height: progressDataState.unreg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-600 content-center hover:opacity-80"
            ></div>

            <div
              style={{
                height: progressDataState.partial_az_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-az-1st content-center hover:opacity-80"
              data-tip
              data-for="prog-partial-az-hover"
            >
              {/* {progressDataState.partial_az_dp} */}
            </div>

            <div
              style={{
                height: progressDataState.partial_sn_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sn-1st content-center hover:opacity-80"
              data-tip
              data-for="prog-partial-sn-hover"
            >
              {/* {progressDataState.partial_sn_dp} */}
            </div>

            <div
              style={{
                height: progressDataState.partial_pf_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pf-1st content-center hover:opacity-80"
              data-tip
              data-for="prog-partial-pf-hover"
            >
              {/* {progressDataState.partial_pf_dp} */}
            </div>
            <div
              style={{
                height: progressDataState.full_cn_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cn-2nd content-center hover:opacity-80"
              data-tip
              data-for="prog-full-cn-hover"
            >
              {/* {progressDataState.full_cn_dp} */}
            </div>
            <div
              style={{
                height: progressDataState.full_az_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-az-2nd content-center hover:opacity-80"
              data-tip
              data-for="prog-full-az-hover"
            >
              {/* {progressDataState.full_az_dp} */}
            </div>
            <div
              style={{
                height: progressDataState.full_sn_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sn-2nd content-center hover:opacity-80"
              data-tip
              data-for="prog-full-sn-hover"
            >
              {/* {progressDataState.full_sn_dp} */}
            </div>
            <div
              style={{
                height: progressDataState.full_pf_bar_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pf-2nd content-center hover:opacity-80"
              data-tip
              data-for="prog-full-pf-hover"
            >
              {/* {progressDataState.full_pf_dp} */}
            </div>
          </div>

          {/* actual bars */}
          <div className="overflow-hidden w-14 text-xs flex-grow-0 flex-col rounded bg-gray-600">
            <div
              style={{
                height: progressDataState.unreg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-700 content-center hover:opacity-80"
              data-tip
              data-for="prog-unreg-hover"
            >
              {progressDataState.unreg > 0 ? progressDataState.unreg_dp : ""}
            </div>

            <div
              style={{
                height: progressDataState.reg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500 content-center hover:opacity-80"
              data-tip
              data-for="prog-reg-hover"
            >
              {progressDataState.reg > 0 ? progressDataState.reg_dp : ""}
            </div>

            <div
              style={{
                height: progressDataState.partial_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400 content-center hover:opacity-80"
              data-tip
              data-for="prog-partial-hover"
            >
              {progressDataState.partial_dp}
            </div>

            <div
              style={{
                height: progressDataState.full_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-400 content-center hover:opacity-80"
              data-tip
              data-for="prog-full-hover"
            >
              {progressDataState.full_dp}
            </div>
          </div>

          {/* bar labels */}
          <div className="w-8 text-xs flex-grow flex-col uppercase text-gray-400">
            <div
              style={{
                height: progressDataState.unreg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-left justify-start items-center"
              data-tip
              data-for="prog-unreg-hover"
            >
              {progressDataState.unreg > 0 ? "Unregistered" : ""}
            </div>
            <div
              style={{
                height: progressDataState.reg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-left justify-start items-center"
              data-tip
              data-for="prog-reg-hover"
            >
              {progressDataState.reg > 0 ? "Registered" : ""}
            </div>

            <div
              style={{
                height: progressDataState.partial_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-left justify-start items-center"
              data-tip
              data-for="prog-partial-hover"
            >
              Partially Vaccinated
            </div>
            <div
              style={{
                height: progressDataState.full_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-left justify-start items-center"
              data-tip
              data-for="prog-full-hover"
            >
              Fully Vaccinated
            </div>
          </div>
        </div>

        {/* progress bar tooltips */}
        <span>
          <ReactTooltip id="prog-full-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <p className="text-xl">{progressDataState.full_count_dp}</p> <p>received 2 doses or 1 CanSino dose</p>
          </ReactTooltip>
          <ReactTooltip id="prog-partial-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <p className="text-xl">{progressDataState.partial_count_dp}</p> <p>waiting for 2nd dose</p>
            <p>for double-dose vaccines</p>
            {/* <p className="text-xl">{progressDataState.total_dose1_dp}</p> <p>received at least 1 dose</p> */}
          </ReactTooltip>
          <ReactTooltip id="prog-reg-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <p className="text-xl">{progressDataState.reg_count_dp}</p> <p>registered for vaccination and waiting for 1st dose</p>
            <p className="text-xl">{progressDataState.total_reg_count_dp}</p> <p>total registered for vaccination so far</p>
          </ReactTooltip>
          <ReactTooltip id="prog-unreg-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <p className="text-xl">{progressDataState.unreg_count_dp}</p> <p>have not registered for vaccination nor received their doses</p>
          </ReactTooltip>
        </span>
        <span>
          <ReactTooltip id="prog-full-pf-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <span>
              <p className="text-xl">
                {progressDataState.full_pf_count_dp} ({progressDataState.full_pf_dp})
              </p>
              <p>fully vaccinated with Pfizer</p>
            </span>
          </ReactTooltip>
          <ReactTooltip id="prog-full-sn-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <span>
              <p className="text-xl">
                {progressDataState.full_sn_count_dp} ({progressDataState.full_sn_dp})
              </p>
              <p>fully vaccinated with Sinovac</p>
            </span>
          </ReactTooltip>
          <ReactTooltip id="prog-full-az-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <span>
              <p className="text-xl">
                {progressDataState.full_az_count_dp} ({progressDataState.full_az_dp})
              </p>
              <p>fully vaccinated with AstraZeneca</p>
            </span>
          </ReactTooltip>
          <ReactTooltip id="prog-full-cn-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <span>
              <p className="text-xl">
                {progressDataState.full_cn_count_dp} ({progressDataState.full_cn_dp})
              </p>
              <p>fully vaccinated with CanSino</p>
            </span>
          </ReactTooltip>
          <ReactTooltip id="prog-partial-pf-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <span>
              <p className="text-xl">
                {progressDataState.partial_pf_count_dp} ({progressDataState.partial_pf_dp})
              </p>
              <p>partially vaccinated with Pfizer</p>
            </span>
          </ReactTooltip>
          <ReactTooltip id="prog-partial-sn-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <span>
              <p className="text-xl">
                {progressDataState.partial_sn_count_dp} ({progressDataState.partial_sn_dp})
              </p>
              <p>partially vaccinated with Sinovac</p>
            </span>
          </ReactTooltip>
          <ReactTooltip id="prog-partial-az-hover" className="tooltip text-center" type="dark" backgroundColor={TOOLTIP_BG}>
            <span>
              <p className="text-xl">
                {progressDataState.partial_az_count_dp} ({progressDataState.partial_az_dp})
              </p>
              <p>partially vaccinated with AstraZeneca</p>
            </span>
          </ReactTooltip>
        </span>

        {/* charts */}
        <div className="flex flex-wrap justify-between space-y-9 lg:space-y-0 items-center">
          <div className="w-full lg:w-2/5 h-52 md:h-72 opacity-80">
            <StateCharts stateData={stateDataState} />
            <p className="uppercase text-xs text-gray-500">By State</p>
          </div>

          {/* fastest state progress */}
          <div className="flex flex-col" data-tip data-for="top-state-hover">
            <ReactTooltip className="tooltip" id="top-state-hover" type="dark">
              <p>Tap to change state!</p>
            </ReactTooltip>
            <p className="text-xs uppercase text-gray-400">Top 5 states:</p>
            {topStatesDataState.map((state) => (
              <div className="flex cursor-pointer justify-start" onClick={() => selectItem(state.name)} key={state.name}>
                <div className="w-2 h-2 text-right m-2">
                  <FontAwesomeIcon className={state.herd_n_days <= 30 ? "text-green-500" : "text-yellow-500"} icon="caret-up" />
                </div>
                <div>
                  <p>{state.name}</p>
                  <p className="text-xs uppercase text-gray-400">
                    {state.herd_n_days == 0 ? "Today! " : `in ${state.herd_n_days} days `}({state.herd_date_dp})
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* daily doses */}
          <div className="w-full lg:w-2/5 h-52 md:h-72 opacity-80">
            <DailyByVaxCharts dosesData={dosesByVaxData} />
            <p className="uppercase text-xs text-gray-500 text-right">
              Daily + <span className="text-yellow-300">Projected</span> Doses
            </p>
          </div>
        </div>
      </main>
      {/* bottom section */}
      <div className="flex flex-col items-center justify-center w-full pb-5">
        {/* timeline labels */}

        <div id="nat-timeline" className="relative h-10 w-full uppercase">
          <p className="absolute left-10 top-[100%] text-center text-xs text-gray-500 hidden sm:block">National Timeline</p>
          {timelineDataState.map((milestone) => (
            <div style={{ left: milestone.x_pct }} className="absolute text-center text-sm" key={milestone.name}>
              <div className="relative flex flex-col left-[-50%] pb-20" data-tip={milestone.name} data-for="timeline-hover">
                <div className={" " + (milestone.name == "80pct" ? "text-green-600" : "")}>{milestone.name_display}</div>
                <div className={milestone.name == "80pct" ? "text-green-600" : "text-gray-500"}>{milestone.date_display}</div>
              </div>
            </div>
          ))}
        </div>
        <ReactTooltip
          className="text-center"
          id="timeline-hover"
          type="dark"
          backgroundColor={TOOLTIP_BG}
          getContent={(dataTip) => {
            if (dataTip == null) {
              return;
            }
            let milestone = timelineDataState.find((o) => o.name === dataTip);
            if (typeof milestone !== "undefined") {
              if (milestone.name === "begin")
                return (
                  <div>
                    <p className="w-32">The Malaysian COVID-19 National Immunisation Programme kick-started on 24th February, 2021</p>
                    <p className="uppercase text-green-500 font-bold text-xl">{milestone.n_days} days ago</p>
                  </div>
                );
              else
                return (
                  <div>
                    <p className="text-3xl font-bold">{milestone.name_display}</p>
                    <p>or</p>
                    <p className="text-3xl font-bold">{milestone.n_count}</p>
                    <p>{useTotalPop ? "population" : "adults"} vaccinated</p>
                    <p className="uppercase text-green-500 font-bold text-xl">
                      {milestone.has_past ? (milestone.n_days == 0 ? "today" : `${milestone.n_days} days ago`) : `in ${milestone.n_days} days`}
                    </p>
                  </div>
                );
            }
          }}
        />

        {/* svg timeline */}
        <svg width="100%" height="50px">
          {/* mainline */}
          <line id="timeline-bg" x1={0} y1={TIMELINE_CONST.Y_PCT} x2={"100%"} y2={TIMELINE_CONST.Y_PCT} stroke="#4B5563" />
          <line id="timeline-main" x1={0} y1={TIMELINE_CONST.Y_PCT} x2={"50%"} y2={TIMELINE_CONST.Y_PCT} stroke="white" strokeWidth="2" />

          {/* ticks */}
          {timelineDataState.map((milestone) => (
            <g key={milestone.name}>
              <line x1={milestone.x_pct} y1={25} x2={milestone.x_pct} y2={15} stroke={milestone.name == "80pct" ? "green" : "white"} />
              <circle
                cx={milestone.x_pct}
                cy={TIMELINE_CONST.Y_PCT}
                r={TIMELINE_CONST.OUT_CIRCLE_R}
                fill="#1F2937"
                stroke={milestone.name == "80pct" ? "green" : "white"}
              />
              {milestone.has_past ? <circle cx={milestone.x_pct} cy={TIMELINE_CONST.Y_PCT} r={TIMELINE_CONST.IN_CIRCLE_R} fill="white" /> : ""}
            </g>
          ))}

          <line x1={"50%"} y1={TIMELINE_CONST.TICK_FULL_Y1} x2={"50%"} y2={TIMELINE_CONST.TICK_FULL_Y2} stroke="white" />
        </svg>

        {/* bottom status */}
        <div className="flex flex-wrap justify-center sm:justify-between space-x-2 sm:space-x-0 w-full px-10 items-end">
          {/* 7 day rate */}
          <div className="flex flex-col group">
            <div className="flex flex-col items-center justify-center pt-2" data-tip data-for="avg-rate-hover">
              <div className="flex items-center">
                <p className="text-3xl">{progressDataState.rate_avg}</p>
                <p className="w-2 ml-2">
                  {progressDataState.is_rate_avg_incr ? (
                    <FontAwesomeIcon className="text-green-500" icon="caret-up" />
                  ) : (
                    <FontAwesomeIcon className="text-red-500" icon="caret-down" />
                  )}
                </p>
              </div>
              <p className="text-xs uppercase text-gray-500 pt-1">Avg Daily Doses</p>
            </div>
            <ReactTooltip id="avg-rate-hover" type="dark" effect="solid" place="top" backgroundColor={TOOLTIP_BG}>
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
                <p className="text-xs uppercase text-gray-200 pt-1">doses per 100 people</p>
              </div>
            </ReactTooltip>
          </div>

          {/* today status */}
          <div className="flex flex-col items-center justify-center order-first md:order-none w-full md:w-min" data-tip data-for="today-status-hover">
            <p className="uppercase">{progressDataState.today_date_dp}</p>
            <p className="text-5xl font-bold text-green-500">{progressDataState.full_count_dp}</p>
            <p className="">({progressDataState.full_dp})</p>
            <p className="text-xs uppercase text-gray-500 pt-1">People Fully Vaccinated</p>
            <ReactTooltip id="today-status-hover" type="dark" effect="solid" place="top" backgroundColor={TOOLTIP_BG}>
              <div className="flex flex-col items-center mb-3">
                <p className="text-5xl font-bold">{progressDataState.total_dose1_dp}</p>
                <p className="text-xs uppercase text-gray-200 pt-1">Total Individuals Vaccinated</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-5xl font-bold">{progressDataState.total_count_dp}</p>
                <p className="text-xs uppercase text-gray-200 pt-1">Total Doses Administered</p>
              </div>
            </ReactTooltip>
          </div>
          {/* latest rate */}
          <div className="flex flex-col group">
            <div className="flex flex-col items-center justify-center pt-2" data-tip data-for="latest-rate-hover">
              <div className="flex items-center">
                <p className="text-3xl">{progressDataState.rate_latest}</p>
                <p className="w-2 ml-2">
                  {progressDataState.is_rate_latest_incr ? (
                    <FontAwesomeIcon className="text-green-500" icon="caret-up" />
                  ) : (
                    <FontAwesomeIcon className="text-red-500" icon="caret-down" />
                  )}
                </p>
              </div>

              <p className="text-xs uppercase text-gray-500 pt-1">Latest Daily Doses</p>
            </div>
            <ReactTooltip id="latest-rate-hover" type="dark" effect="solid" place="top" backgroundColor={TOOLTIP_BG}>
              <div className="flex flex-col items-center">
                {/* by dose */}
                <div className="flex space-x-2">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">1st Dose</p>

                    <p className="text-lg">{progressDataState.rate_latest_d1}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs uppercase text-gray-500">2nd Dose</p>

                    <p className="text-lg">{progressDataState.rate_latest_d2}</p>
                  </div>
                </div>
                <p className="text-3xl">{progressDataState.rate_latest_100}</p>
                <p className="text-xs uppercase text-gray-200 pt-1">doses per 100 people</p>
              </div>
            </ReactTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
