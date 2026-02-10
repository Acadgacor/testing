import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#F7C948",
          "primary-hover": "#E0B12F",
          secondary: "#FFFBEA",
          dark: "#1A1A1A",
          light: "#4A4A4A",
        },
        success: "#22C55E",
        error: "#EF4444",
      },
      borderRadius: {
        "2xl": "1.5rem",
      },
    },
  },
};

export default config;
