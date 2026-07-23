/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/design-system/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#000000",
          1: "#0a0a0b",
          2: "#111113",
          3: "#19191b",
          4: "#1f1f23",
          5: "#26262b",
          6: "#2e2e34",
        },
        border: {
          DEFAULT: "#1f1f23",
          subtle: "#161618",
          strong: "#2e2e34",
        },
        muted: "#88888d",
        accent: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
          muted: "rgba(99,102,241,0.12)",
          glow: "rgba(99,102,241,0.25)",
        },
        success: {
          DEFAULT: "#22c55e",
          muted: "rgba(34,197,94,0.12)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          muted: "rgba(245,158,11,0.12)",
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "rgba(239,68,68,0.12)",
        },
        info: {
          DEFAULT: "#3b82f6",
          muted: "rgba(59,130,246,0.12)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        "display": ["3rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        "heading": ["1.5rem", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "-0.01em" }],
        "subheading": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.4" }],
        "kpi": ["2rem", { lineHeight: "1", fontWeight: "700", letterSpacing: "-0.02em", fontFeatureSettings: '"tnum"' }],
        "kpi-lg": ["2.5rem", { lineHeight: "1", fontWeight: "700", letterSpacing: "-0.02em", fontFeatureSettings: '"tnum"' }],
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        "glow": "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.2)",
        "card": "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        "elevated": "0 4px 12px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        "xs": "2px",
      },
    },
  },
  plugins: [],
};
