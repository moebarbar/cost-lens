/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E6FFF7",
          100: "#B3FFE8",
          200: "#80FFD9",
          300: "#4DFFCA",
          400: "#1AFFBB",
          500: "#00D4AA",
          600: "#00A882",
          700: "#007D5A",
          800: "#005232",
          900: "#00270A",
        },
        dark: {
          900: "#0A0F1C",
          800: "#0D1322",
          700: "#121828",
          600: "#1A2138",
          500: "#242D45",
          400: "#2E3A52",
        },
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
