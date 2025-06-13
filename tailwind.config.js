/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bzl-green': '#45ADA8',
        'link-color': '#547980',
        'link-color-hover': '#007940',
      },
    },
  },
  plugins: [],
}
