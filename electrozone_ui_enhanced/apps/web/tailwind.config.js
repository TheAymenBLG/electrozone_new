/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ez: {
          bg: "#0a0a1a", "bg-secondary": "#12121f", "bg-tertiary": "#1a1a2e",
          accent: "#ffd700", "accent-hover": "#e6c200",
          text: "#ffffff", "text-secondary": "#d0d0e0", "text-muted": "#6b6b8c",
          border: "#1e1e32", "border-hover": "#2a2a42",
          success: "#4ade80", danger: "#f87171",
        },
        navy: {
          DEFAULT: "var(--color-navy)",
          deep: "var(--color-navy-deep)",
          card: "var(--color-navy-card)",
          tile: "var(--color-navy-tile)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          bright: "var(--color-gold-bright)",
          soft: "var(--color-gold-soft)",
        },
        edge: "var(--color-edge)",
        cloud: {
          DEFAULT: "var(--color-cloud)",
          muted: "var(--color-cloud-muted)",
        },
        brand: { DEFAULT: "#e11b22", dark: "#b3141a", light: "#ff4d52" },
        ink: {
          DEFAULT: "var(--color-ink)",
          light: "var(--color-ink-light)",
        },
        mint: { DEFAULT: "#66e2c3", dark: "#3fcfae", bg: "#f4f7f6" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        head: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
