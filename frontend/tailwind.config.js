/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff0f3",
          100: "#ffe0e8",
          400: "#f4527a",
          500: "#e8305a",
          600: "#d01a45",
          900: "#6b0020",
        }
      }
    },
  },
  plugins: [],
}
