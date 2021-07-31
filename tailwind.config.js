module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        "b612-mono": ['"B612 Mono"', "monospace"],
      },
      colors: {
        "tooltip-black": "#222",
      },
    },
  },
  variants: {
    extend: {},
  },
};
