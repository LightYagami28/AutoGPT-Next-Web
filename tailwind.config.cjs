/** @type {import("tailwindcss").Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "300px",
        "sm-h": { raw: "(min-height: 700px)" },
        "md-h": { raw: "(min-height: 800px)" },
        "lg-h": { raw: "(min-height: 1000px)" },
        ...defaultTheme.screens,
      },
      boxShadow: {
        "3xl": "0 40px 70px -15px rgba(0, 0, 0, 0.40)",
      },
      borderRadius: {
        lg: "0.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-radix")],
};
