/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#e6f4ff',
          100: '#b3dfff',
          200: '#80caff',
          300: '#4db5ff',
          400: '#1a9fff',
          500: '#00d4ff',
          600: '#00a8cc',
          700: '#1e3a5f',
          800: '#152a47',
          900: '#0d1a2d',
          950: '#08101c',
        },
        heat: {
          1: '#0ea5e9',
          2: '#22c55e',
          3: '#eab308',
          4: '#f97316',
          5: '#ef4444',
        }
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
