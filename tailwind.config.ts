import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind scans these files and only includes CSS classes that are actually used.
  // This keeps your final CSS bundle tiny.
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  darkMode: "class", // We toggle dark mode by adding class="dark" to <html>
  theme: {
    extend: {
      // ── Brand colours ──────────────────────────────────────────────────────
      colors: {
        brand: {
          gold: "#13795B",
          "gold-lt": "#D7F2E8",
          earth: "#EBEFEA",
          "earth-2": "#F8FBF8",
          bark: "#5F6D63",
          ash: "#8EA195",
        },
        prov: {
          WC: "#C4562A",
          GP: "#B84020",
          KZN: "#CF8B50",
          MP: "#C87040",
          LP: "#D4904A",
          EC: "#D4734A",
          NW: "#D4A86A",
          NC: "#E8C88A",
          FS: "#EAD39C",
        },
      },
      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      // ── Spacing extras ─────────────────────────────────────────────────────
      maxWidth: {
        content: "960px",
      },
    },
  },
  plugins: [],
};

export default config;
