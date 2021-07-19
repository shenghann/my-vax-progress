// import 'tailwindcss/tailwind.css'
import "../styles/global.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";

library.add(faCaretUp);

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
