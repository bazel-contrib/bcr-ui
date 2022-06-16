/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bzl-green': "#5d9e52",
        'link-color': "#00AC5B",
        'link-color-hover': "#007940",
      }
    },
  },
  plugins: [],
}
