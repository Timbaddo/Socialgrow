/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5B4EFF",
          dark: "#4338CA",
          light: "#8B7FFF",
        },
        growmint: "#1FD1A1",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        popIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        popIn: "popIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
