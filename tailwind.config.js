/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        "on-accent": "var(--on-accent)",
        accent2: "var(--accent2)",
        good: "var(--good)",
        warn: "var(--warn)",
        bad: "var(--bad)",
        info: "var(--info)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        data: "var(--font-data)",
      },
      borderRadius: {
        tpl: "var(--radius)",
      },
      boxShadow: {
        card: "var(--card-shadow)",
      },
      backdropBlur: {
        glass: "18px",
      }
    },
  },
  plugins: [],
}

