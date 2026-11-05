/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#080d1a',
          800: '#0f172a',
          700: '#1e293b',
        },
        lunar: {
          light: '#f1f5f9',
          silver: '#94a3b8',
          glow: '#e2e8f0',
        },
        mars: {
          light: '#fb923c',
          rust: '#ea580c',
          dark: '#9a3412',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
