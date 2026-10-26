/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF8F1',
          100: '#D5EEDD',
          200: '#A9DCBA',
          500: '#1F9D55',
          600: '#178246',
          700: '#11683A',
          800: '#0E5230',
          900: '#0A3D24',
        },
        accent: {
          50: '#FFF6E8',
          100: '#FFE7C2',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        surface: '#FAF6EF',
        card: '#FFFFFF',
        ink: '#1C1917',
        muted: '#78716C',
        line: '#E7E0D4',
        night: {
          50: '#EEF0FF',
          100: '#E0E4FF',
          700: '#2E2A6B',
          800: '#1E1B4B',
          900: '#14122E',
        },
        danger: '#B91C1C',
      },
    },
  },
  plugins: [],
};
