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
        'rose-gold-dark': '#a05a65',
        'charcoal': '#36454F',
        'champagne': '#F7E7CE',
        'sage': '#BCB88A',
      },
      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
        script: ['Great Vibes', 'cursive'],
      },
    },
  },
  plugins: [],
}