/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FAF6F0',
          100: '#F7F1E8', // Approved Primary Warm Ivory
          200: '#EFE7DC',
          300: '#E5D9C8',
        },
        plum: {
          950: '#220D1E',
          900: '#33142D',
          800: '#45213F', // Approved Primary Royal Plum
          700: '#5D2F55',
          600: '#773E6E',
          500: '#935089',
        },
        gold: {
          300: '#E6D3B3',
          400: '#D8B986',
          500: '#C5A16B', // Approved Primary Champagne Gold
          600: '#B08B53',
          700: '#8E6D3B',
        },
        charcoal: {
          950: '#121013',
          900: '#1A181B',
          800: '#242025',
          700: '#363038',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
