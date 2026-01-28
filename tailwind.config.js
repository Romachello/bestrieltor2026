module.exports = {
  content: ["./*.html", "./src/**/*.html"],
  theme: {
    extend: {
      colors: {
        brand: "#1e40af",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
