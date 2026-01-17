/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        islamic: {
          green: '#0a5c36',
          gold: '#d4af37',
          blue: '#1e3a8a',
          cream: '#fef3c7'
        }
      },
      fontFamily: {
        arabic: ['"Noto Sans Arabic"', 'sans-serif'],
        'arabic-heading': ['"Amiri"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      backgroundImage: {
        'islamic-pattern': "url('/images/pattern.svg')",
        'gradient-holy': 'linear-gradient(135deg, #0a5c36 0%, #1e3a8a 100%)',
      }
    },
  },
  plugins: [],
}