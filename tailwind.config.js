/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      colors: {
        fluent: {
          blue: '#0F6CBD',
          blueHover: '#115EA3',
          blueLight: '#EBF3FC',
          crimson: '#C50F1F',
          amber: '#D83B01',
          emerald: '#107C41',
          purple: '#5C2E91',
          borderLight: '#E1DFDD',
          borderDark: '#323130',
          surfaceLight: '#FAF9F8',
          surfaceDark: '#1B1A19',
          cardDark: '#252423',
        },
      },
    },
  },
  plugins: [],
};
