/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bzl-green': '#0C713A',
        'link-color': '#0C713A',
        'link-color-hover': '#00AC5B',
      },
    },
  },
  plugins: [],
}
