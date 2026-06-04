/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C9082A',
          dark: '#9e0621',
        },
      },
    },
  },
  plugins: [],
}
