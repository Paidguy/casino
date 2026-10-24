/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        stake: {
          bg: '#070b14',
          panel: '#0d1322',
          elevated: '#131c31',
          border: '#24324f',
          hover: '#1d2a47',
          input: '#070b14',
          green: '#f59e0b',
          greenHover: '#fbbf24',
          blue: '#10b981',
          text: '#ffffff',
          muted: '#94a3b8',
          subtle: '#64748b',
          danger: '#f43f5e',
          warning: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
