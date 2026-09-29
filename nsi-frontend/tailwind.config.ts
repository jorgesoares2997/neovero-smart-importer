import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neovero: {
          blue: {
            DEFAULT: "#074166",
            dark: "#052e49",
            medium: "#0d5277",
            light: "#2ea3f2",
            soft: "#e8f1f5",
          },
          orange: {
            DEFAULT: "#ff6600",
            coral: "#ff5133",
            hover: "#e55b00",
            soft: "#fff3eb",
          },
          alert: {
            red: "#e02b20",
            bg: "#ffc7ce",
            text: "#9c0006",
          },
          neutral: {
            50: "#fafafa",
            100: "#f4f6f8",
            200: "#eeeeee",
            800: "#333333",
            900: "#1a1a1a",
          }
        },
      },
      fontFamily: {
        sans: ["Open Sans", "Helvetica", "Arial", "sans-serif"],
        display: ["Abel", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(7, 65, 102, 0.08)",
        cardHover: "0 10px 25px -4px rgba(7, 65, 102, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
