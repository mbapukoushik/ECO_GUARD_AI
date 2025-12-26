/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          dark: '#0a0e1a',
          darker: '#05070d',
          panel: '#1a1f2e',
          border: '#2d3748',
          accent: '#3b82f6',
          warning: '#fbbf24',
          critical: '#ef4444',
          normal: '#10b981',
        },
      },
    },
  },
  plugins: [],
}

