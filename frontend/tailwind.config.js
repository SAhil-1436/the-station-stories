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
          DEFAULT: '#F7F1E8', // Main Website Background
          50: '#FDFBF8',
          100: '#F7F1E8',
          200: '#EFE7DC',
          300: '#E3D5C4',
        },
        plum: {
          DEFAULT: '#45213F', // Royal Plum
          royal: '#45213F',
          dark: '#32172F',   // Dark Plum for Hero / Footer / Visual areas
          light: '#5A2C52',
          950: '#220D1E',
          900: '#32172F',
          800: '#45213F',
          700: '#5A2C52',
          600: '#743B6A',
          500: '#914F85',
        },
        gold: {
          DEFAULT: '#C5A16B', // Champagne Gold
          light: '#DFCA9B',
          dark: '#9D7B48',
          300: '#E8D7B5',
          400: '#D6BE90',
          500: '#C5A16B',
          600: '#B28D55',
          700: '#8F6E3B',
        },
        lavender: {
          DEFAULT: '#E9DDEB', // Soft Lavender (secondary bg & cards)
          50: '#FAF7FA',
          100: '#F4EDF5',
          200: '#E9DDEB',
          300: '#D6C2D9',
        },
        rose: {
          muted: '#B88E9D',  // Muted Rose accents
        },
        body: {
          DEFAULT: '#332A35', // Body Text
          muted: '#685C6A',
          subtle: '#8B7D8D',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Manrope', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(69, 33, 63, 0.08)',
        'luxury': '0 12px 35px -5px rgba(69, 33, 63, 0.12), 0 4px 12px -2px rgba(197, 161, 107, 0.08)',
        'elevated': '0 20px 45px -10px rgba(50, 23, 47, 0.18)',
      },
      maxWidth: {
        'site': '1480px',
        '8xl': '1480px',
      },
    },
  },
  plugins: [],
}
