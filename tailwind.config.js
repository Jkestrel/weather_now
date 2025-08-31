/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.35)"
      }
    },
  },
  plugins: [],
}
