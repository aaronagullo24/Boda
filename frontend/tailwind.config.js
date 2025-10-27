const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ivory': '#FFFFF0',
        'rose-water': '#F4E1E1',
        'rose-gold': '#B76E79',
        'charcoal': '#36454F',
      },
      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
        script: ['Great Vibes', 'cursive'],
      },
    },
  },
  plugins: [],
}