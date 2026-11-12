/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0B0E11',
          900: '#12161A',
          800: '#1A2026',
          700: '#2A323D',
        },
        ivory: {
          50: '#FBF9F5',
          100: '#F5F0E6',
          200: '#EBE4D5',
        },
        gold: {
          500: '#D4AF37',
          600: '#C5A059',
          700: '#A6843D',
        },
        neon: {
          purple: '#9333EA',
          indigo: '#6366F1',
          violet: '#7C3AED',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
