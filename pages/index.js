import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StateCharts from "../components/StateChart";
import DailyCharts from "../components/DailyDosesChart";
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

const steps = [
  {
    selector: "#state-text-btn",
    content:
      "View projections for your state by tapping here. You can share your state's link with your friends!",
    style: {
      fontFamily: "B612 Mono, monospace",
      fontSize: "0.8rem",
    },
  },
  {
    selector: "#days-left",
    content: () => (
      <div>
        <p>
          <b>Oh no, why are the projection dates moving?</b>
        </p>
        <p>
          Estimated dates are based on average 1st dose rates for past 7 days.
          If the rates drop, projections will be pushed out.
        </p>
        <p>
          Hence, the estimated dates are not fixed, so don't save the date on
          your calendar just yet! It is a live projection that responds to
          latest dosing rates, to answer the question - based on today's rates,
          when can we achieve 80%?
        </p>
        <br />
        <p>So, check back from time to time!</p>
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
  // {
  //   selector: "#pop-switch",
  //   content: "Toggle between Adult (>18yo) or Total population",
  //   style: {
  //     fontFamily: "B612 Mono, monospace",
  //   },
  // },
  // {
  //   selector: "#nat-timeline",
  //   content:
  //     "Timeline progress: tap or hover over each milestone for more info",
  //   style: {
  //     fontFamily: "B612 Mono, monospace",
  //   },
  // },
];

export default function Home(props) {
  // fetch data from API
  const {
    data: refreshedData,
    error,
    mutate,
    size,
    setSize,
    isValidating,
  } = useSWR("/api/refresh", fetcher, { initialData: props.allData });

  if (isValidating) {
    console.log("data refreshing...");
    window.gtag("event", "data_refresh");
  }

  const {
    by_state: byStateData,
    state: stateData,
    top_states: topStatesData,
  } = refreshedData;

  const [isShowMenu, setisShowMenuState] = useState(false);
  const [selectedState, setSelectedState] = useState("Malaysia");
  const [useTotalPop, setUsePopState] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(true);

  // get state from url
  const router = useRouter();
  useEffect(() => {
    const stateQuery = router.query.state;
    if (stateQuery != "" && stateQuery in STATE_ABBR) {
      // console.log("router state param:", stateQuery);
      // console.log("router state param:", STATE_ABBR[router.query.state]);
      setSelectedState(STATE_ABBR[router.query.state]);
    }
  }, [router.query.state]);

  let {
    progress: progressData,
    timeline: timelineData,
    doses: dosesData,
  } = byStateData[selectedState];

  let progressDataState = useTotalPop ? progressData.total : progressData.adult;
  let timelineDataState = useTotalPop ? timelineData.total : timelineData.adult;
  let stateDataState = useTotalPop ? stateData.total : stateData.adult;
  let topStatesDataState = useTotalPop
    ? topStatesData.total
    : topStatesData.adult;

  const remapData = () => {
    progressDataState = useTotalPop ? progressData.total : progressData.adult;
    timelineDataState = useTotalPop ? timelineData.total : timelineData.adult;
    stateDataState = useTotalPop ? stateData.total : stateData.adult;
    topStatesDataState = useTotalPop
      ? topStatesData.total
      : topStatesData.adult;
  };

  // population type switching
  const handleSetPopChange = (event) => {
    const checked = event.target.checked;
    setUsePopState(checked);
    remapData();

    window.gtag("event", "toggle_pop", { is_total_pop: useTotalPop });
  };

  // state selection menu
  const showMenu = (event) => {
    event.preventDefault();
    let isOpen = !isShowMenu;
    setisShowMenuState(isOpen);
  };

  const selectItem = (selected) => {
    // setSelectedState(selected);
    setisShowMenuState(false);
    // push state via url param
    router.push(`/?state=${STATE_ABBR_REV[selected]}`, undefined, {
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

  // let stateHoverRef = useRef(null);
  // useEffect(() => {
  //   if (isShowMenu) ReactTooltip.hide(stateHoverRef);
  //   else {
  //     ReactTooltip.show(stateHoverRef);
  //     setTimeout(function () {
  //       ReactTooltip.hide(stateHoverRef);
  //     }, 5000);
  //   }
  // });

  return (
    <div className="bg-gray-800 text-gray-300 font-b612-mono flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>MY Vax Tracker</title>
        <link rel="icon" href="/favicon.ico" />

        {/* <!-- Primary Meta Tags --> */}
        <meta name="title" content="MY Vax Tracker" />
        <meta
          name="description"
          content="Malaysia's progress to covid-19 herd immunity tracker. How soon can we return to normallity?"
        />

        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vax.tehcpeng.net/" />
        <meta property="og:title" content="MY Vax Tracker" />
        <meta
          property="og:description"
          content="Malaysia's progress to covid-19 herd immunity tracker. How soon can we return to normallity?"
        />
        <meta
          property="og:image"
          content="https://vax.tehcpeng.net/images/vaxappv2.png"
        />

        {/* <!-- Twitter --> */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="https://vax.tehcpeng.net/" />
        <meta property="twitter:title" content="MY Vax Tracker" />
        <meta
          property="twitter:description"
          content="Malaysia's progress to covid-19 herd immunity tracker. How soon can we return to normallity?"
        />
        <meta
          property="twitter:image"
          content="https://vax.tehcpeng.net/images/vaxappv2.png"
        />
      </Head>

      <main className="flex flex-col w-full flex-1 p-10 md:px-20 md:pt-10">
        {/* credits */}
        <div
          className="absolute flex space-x-1 left-2 top-2"
          data-tip
          data-for="credits-hover"
        >
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
          <ReactTooltip
            id="credits-hover"
            type="dark"
            place="right"
            backgroundColor={TOOLTIP_BG}
          >
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
            <span data-tip data-for="days-hover">
              {progressDataState.herd_days <= 0
                ? ": Herd Immunity target "
                : ": Herd Immunity in "}
            </span>
            <span
              id="days-left"
              className="inline-flex flex-col text-green-500"
              data-tip
              data-for="days-hover"
            >
              <span className="flex">
                {progressDataState.herd_days <= 0
                  ? "reached"
                  : progressDataState.herd_days + " days"}{" "}
                <span className="w-4 md:w-5 opacity-80">
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
                <button
                  className="text-left uppercase hover:bg-gray-700"
                  onClick={() => selectItem(stateName)}
                >
                  {stateName}
                </button>
              ))}
            </div>
          ) : (
            ""
          )}

          {/* adult total switch */}
          <div
            id="pop-switch"
            className="flex flex-col items-center space-y-3"
            data-tip
            data-for="pop-option-hover"
          >
            <p className="uppercase text-xs text-gray-300 p-2">Adult</p>
            <label
              htmlFor="useTotalPop"
              className="flex items-center cursor-pointer rotate-90"
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
          <ReactTooltip
            className="tooltip"
            id="pop-option-hover"
            type="dark"
            backgroundColor={TOOLTIP_BG}
          >
            <p className="w-40">
              Switch between ADULT (&gt; 18 yo) or TOTAL population estimates
            </p>
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
            Estimated based on current first dose rate (past 7-day average) to
            achieve 80% full vaccination of {progressDataState.total_pop_dp}{" "}
            {useTotalPop ? " people" : " Adults"}. Projections will adapt to
            changes in latest daily rate of doses administered and reported by
            CITF.
          </p>
          <p className="text-xs text-gray-300 italic">
            *The term 'herd immunity' is being loosely used to indicate this 80%
            target and does not necessarily imply so in a medical sense
          </p>
        </ReactTooltip>
        <ReactTooltip
          id="state-hover"
          type="dark"
          place="top"
          backgroundColor={TOOLTIP_BG}
        >
          <p>Tap to change state!</p>
        </ReactTooltip>

        <Tour
          steps={steps}
          isOpen={isTourOpen}
          rounded={4}
          onRequestClose={() => setIsTourOpen(false)}
          showNumber={false}
          showNavigation={false}
        />
        {/* auto refresh loader */}
        <div className="flex">
          <BarLoader
            color="#ccc"
            loading={isValidating}
            size="200px"
            height={2}
          />
        </div>

        {/* css progress bar  */}
        <div className="hidden md:inline py-5">
          {/* percentage labels */}
          <div className="relative h-4 text-xs">
            <div className="absolute uppercase text-gray-500 hidden sm:block">
              National Progress
            </div>
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
              <div className="relative left-[-50%] h-10 md:h-14 border-r-2 border-dashed"></div>
            </div>
            <div className="absolute left-[60%]">
              <div className="relative left-[-50%] h-10 md:h-14 border-r-2 border-dashed"></div>
            </div>
            <div className="absolute left-[80%] text-green-500">
              <div className="relative left-[-50%] h-10 md:h-14 border-r-2 border-dashed border-green-500"></div>
            </div>
          </div>

          {/* actual bars */}
          <div className="overflow-hidden h-8 md:h-12 text-xs flex rounded bg-gray-600">
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
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
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
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
            >
              <p className="text-xl">{progressDataState.partial_count_dp}</p>{" "}
              <p>received only 1 dose</p>
              <p className="text-xl">{progressDataState.total_dose1_dp}</p>{" "}
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
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
            >
              <p className="text-xl">{progressDataState.reg_count_dp}</p>{" "}
              <p>
                registered for vaccination and waiting for 1st dose
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
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
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
        </div>

        {/* css progress bar vertical */}
        <div className="flex h-80 md:hidden justify-center space-x-2 my-8 md:my-5">
          {/* percentage labels */}
          <div className="relative flex-grow w-4 text-xs">
            {/* <div className="absolute uppercase text-gray-500 hidden sm:block">
              National Progress
            </div> */}
            <div className="absolute bottom-[80%] right-0 text-green-500">
              <div className="absolute -translate-y-2 right-2">80%</div>
            </div>
            <div className="absolute bottom-[60%] right-0">
              <div className="absolute -translate-y-2 right-2">60%</div>
            </div>
            <div className="absolute bottom-[40%] right-0">
              <div className="absolute -translate-y-2 right-2">40%</div>
            </div>
          </div>
          {/* dotted lines */}
          <div className="relative w-2">
            <div className="absolute bottom-[80%] text-green-500">
              <div className="relative w-20 border-t-2 border-dashed border-green-500"></div>
            </div>
            <div className="absolute bottom-[60%]">
              <div className="relative w-20 border-t-2 border-dashed"></div>
            </div>
            <div className="absolute bottom-[40%]">
              <div className="relative w-20 border-t-2 border-dashed"></div>
            </div>
          </div>

          {/* actual bars */}
          <div className="overflow-hidden w-16 text-xs flex-grow-0 flex-col rounded bg-gray-600">
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
            <ReactTooltip
              id="prog-unreg-hover"
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
            >
              <p className="text-xl">{progressDataState.unreg_count_dp}</p>{" "}
              <p>
                have not registered for vaccination nor received their doses
              </p>
            </ReactTooltip>
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
            <ReactTooltip
              id="prog-reg-hover"
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
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
                height: progressDataState.partial_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-400 content-center hover:opacity-80"
              data-tip
              data-for="prog-partial-hover"
            >
              {progressDataState.partial_dp}
            </div>
            <ReactTooltip
              id="prog-partial-hover"
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
            >
              <p className="text-xl">{progressDataState.partial_count_dp}</p>{" "}
              <p>received only 1 dose</p>
              <p className="text-xl">{progressDataState.total_dose1_dp}</p>{" "}
              <p>received at least 1 dose</p>
            </ReactTooltip>

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
            <ReactTooltip
              id="prog-full-hover"
              className="tooltip text-center"
              type="dark"
              backgroundColor={TOOLTIP_BG}
            >
              <p className="text-xl">{progressDataState.full_count_dp}</p>{" "}
              <p>received 2 doses</p>
            </ReactTooltip>
          </div>
          {/* bar labels */}
          <div className="w-8 text-xs flex-grow flex-col uppercase text-gray-300">
            <div
              style={{
                height: progressDataState.unreg_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-start items-center"
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
              className="shadow-none flex text-center justify-start items-center"
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
              className="shadow-none flex text-center justify-start items-center"
              data-tip
              data-for="prog-partial-hover"
            >
              First Dose Only
            </div>
            <div
              style={{
                height: progressDataState.full_dp,
                transition: `height 0.5s ease-out`,
              }}
              className="shadow-none flex text-center justify-start items-center"
              data-tip
              data-for="prog-full-hover"
            >
              Fully Vaccinated
            </div>
          </div>
        </div>
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
              <div
                className="flex cursor-pointer justify-start"
                onClick={() => selectItem(state.name)}
              >
                <div className="w-2 h-2 text-right m-2">
                  <FontAwesomeIcon
                    className={
                      state.herd_n_days <= 30
                        ? "text-green-500"
                        : "text-yellow-500"
                    }
                    icon="caret-up"
                  />
                </div>
                <div>
                  <p>{state.name}</p>
                  <p className="text-xs uppercase text-gray-400">
                    {state.herd_n_days == 0
                      ? "Today! "
                      : `in ${state.herd_n_days} days `}
                    ({state.herd_date_dp})
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-2/5 h-52 md:h-72 opacity-80">
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

        <div id="nat-timeline" className="relative h-10 w-full uppercase">
          <p className="absolute left-10 top-[100%] text-center text-xs text-gray-500 hidden sm:block">
            National Timeline
          </p>
          {timelineDataState.map((milestone) => (
            <div
              style={{ left: milestone.x_pct }}
              className="absolute text-center text-sm"
            >
              <div
                className="relative flex flex-col left-[-50%] pb-20"
                data-tip={milestone.name}
                data-for="timeline-hover"
              >
                <div
                  className={
                    " " + (milestone.name == "80pct" ? "text-green-600" : "")
                  }
                >
                  {milestone.name_display}
                </div>
                <div
                  className={
                    milestone.name == "80pct"
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  {milestone.date_display}
                </div>
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
                      ? milestone.n_days == 0
                        ? "today"
                        : `${milestone.n_days} days ago`
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
        <div className="flex flex-wrap justify-center sm:justify-between space-x-2 sm:space-x-0 w-full px-10 items-end">
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
              <p className="text-xs uppercase text-gray-500 pt-1">
                Avg Daily Doses
              </p>
            </div>
            <ReactTooltip
              id="avg-rate-hover"
              type="dark"
              effect="solid"
              place="top"
              backgroundColor={TOOLTIP_BG}
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
              People Fully Vaccinated
            </p>
            <ReactTooltip
              id="today-status-hover"
              type="dark"
              effect="solid"
              place="top"
              backgroundColor={TOOLTIP_BG}
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
                Latest Daily Doses
              </p>
            </div>
            <ReactTooltip
              id="latest-rate-hover"
              type="dark"
              effect="solid"
              place="top"
              backgroundColor={TOOLTIP_BG}
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
    </div>
  );
}
