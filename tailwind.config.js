/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        secondary: "#FAFAFA",
        border: "#E5E7EB",
        foreground: "#111827",
        muted: "#6B7280",
        accent: {
          DEFAULT: "#2563EB",
          hover: "#1d4ed8",
        },
        success: "#16A34A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        premium: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }
    },
  },
  plugins: [],
}
