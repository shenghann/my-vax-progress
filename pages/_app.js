// import 'tailwindcss/tailwind.css'
import "../styles/global.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";

import { useRouter } from "next/router";
import { useEffect } from "react";

library.add(faCaretUp);

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
        page_path: url,
      });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp;
