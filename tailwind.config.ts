import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050b1a",
        panel: "rgba(255,255,255,0.06)",
        line: "rgba(255,255,255,0.10)",
        text: "#eaf0ff",
        muted: "rgba(234,240,255,0.72)",
        accent: "#2b5cff",
        danger: "#ff3b3b",
      },
      borderRadius: {
        xl: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
