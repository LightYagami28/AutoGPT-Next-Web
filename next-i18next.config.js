module.exports = {
  i18n: {
    defaultLocale: "zh",
    locales: ["zh", "en"],
  },
  localePath:
    globalThis.window == undefined
      ? require("node:path").resolve("./public/locales")
      : "/locales",
  // debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  ns: ["common", "help", "settings", "chat"],
};
