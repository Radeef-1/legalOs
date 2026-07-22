import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Surface System ── */
        surface: {
          DEFAULT: "#f8f9ff",
          dim: "#cbdbf5",
          bright: "#f8f9ff",
          "container-lowest": "#ffffff",
          "container-low": "#eff4ff",
          container: "#e5eeff",
          "container-high": "#dce9ff",
          "container-highest": "#d3e4fe",
        },
        "on-surface": {
          DEFAULT: "#0b1c30",
          variant: "#44474c",
        },
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",

        /* ── Outline ── */
        outline: {
          DEFAULT: "#74777d",
          variant: "#c4c6cd",
        },

        /* ── Primary (Deep Navy) ── */
        primary: {
          DEFAULT: "#041627",
          container: "#1a2b3c",
          "on-container": "#8192a7",
          fixed: "#d2e4fb",
          "fixed-dim": "#b7c8de",
        },
        "on-primary": "#ffffff",

        /* ── Secondary (Emerald Green) ── */
        secondary: {
          DEFAULT: "#1b6d24",
          container: "#a0f399",
          "on-container": "#217128",
          fixed: "#a3f69c",
          "fixed-dim": "#88d982",
        },
        "on-secondary": "#ffffff",

        /* ── Tertiary (Deep Blue) ── */
        tertiary: {
          DEFAULT: "#00162a",
          container: "#002b4b",
          "on-container": "#3d95e2",
          fixed: "#d0e4ff",
          "fixed-dim": "#9ccaff",
        },

        /* ── Error ── */
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },

        /* ── Status Tones ── */
        status: {
          ongoing: "#0077C2",
          action: "#D32F2F",
          warning: "#F59E0B",
        },
      },
      fontFamily: {
        "heading": ["'IBM Plex Sans Arabic'", "system-ui", "sans-serif"],
        "body": ["'Inter'", "system-ui", "sans-serif"],
        "arabic": ["'IBM Plex Sans Arabic'", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "60px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "title-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "500", letterSpacing: "0.01em" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.05em" }],
      },
      borderRadius: {
        "soft": "0.25rem",
        "card": "0.5rem",
        "pill": "9999px",
      },
      spacing: {
        "sidebar": "280px",
        "gutter": "24px",
        "container-max": "1440px",
      },
      boxShadow: {
        "level-1": "0 1px 3px rgba(11, 28, 48, 0.05)",
        "level-2": "0 4px 12px rgba(11, 28, 48, 0.10)",
        "interactive": "0 6px 20px rgba(11, 28, 48, 0.12)",
      },
      maxWidth: {
        "container": "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
