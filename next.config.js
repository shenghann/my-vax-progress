const path = require("path");
// const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "serverless",
  trailingSlash: true,
  exportPathMap: function () {
    return {
      "/": { page: "/" },
    };
  },
  webpack: (config, { dev, isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    // copy files you're interested in
    // if (!dev) {
    //   config.plugins.push(
    //     new CopyPlugin({
    //       patterns: [{ from: "data", to: "data" }],
    //     })
    //   );
    // }

    return config;
  },
};
