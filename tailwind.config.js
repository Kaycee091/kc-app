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
        kc: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB', // Primary KC Blue
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
        },
        purpleAccent: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B',
          darker: '#0F172A',
        },
        online: '#22C55E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-kc': '0 0 20px -3px rgba(37, 99, 235, 0.3)',
        'card-soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1.0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        popEmoji: {
          '0%': { transform: 'scale(0.8) translateY(10px)', opacity: 0 },
          '100%': { transform: 'scale(1) translateY(0)', opacity: 1 },
        }
      },
      animation: {
        'bounce-dot-1': 'bounceDot 1.4s infinite ease-in-out both',
        'bounce-dot-2': 'bounceDot 1.4s infinite ease-in-out both 0.2s',
        'bounce-dot-3': 'bounceDot 1.4s infinite ease-in-out both 0.4s',
        'pulse-slow': 'pulseGlow 2s infinite ease-in-out',
        'pop-emoji': 'popEmoji 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      }
    },
  },
  plugins: [],
}
