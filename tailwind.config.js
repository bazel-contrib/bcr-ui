/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playwrite: ['Playwrite US Modern', 'sans-serif'],
      },
      colors: {
        'bzl-green': '#00701a',
        'bzl-green-dark': '#004300',
        'bzl-green-med': '#43a047',
        'bzl-green-light': '#77d175',
        'link-color': '#004300',
        'link-color-hover': '#43a046',
      },
    },
  },
  plugins: [],
}
