/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/design-system/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orbitiq: {
          primary: "#6366f1",
          "primary-hover": "#4f46e5",
          secondary: "#10b981",
          accent: "#f59e0b",
          danger: "#ef4444",
          warning: "#f59e0b",
          success: "#10b981",
          bg: "#ffffff",
          "bg-secondary": "#f8fafc",
          text: "#0f172a",
          "text-secondary": "#64748b",
          border: "#e2e8f0",
          "sidebar-bg": "#1e293b",
          "sidebar-text": "#f1f5f9",
        },
      },
    },
  },
  plugins: [],
};
