/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0a1e36',
          950: '#071525',
        },
        alert: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: { 500: '#eab308' },
        safe:    { 500: '#22c55e' },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(14,165,233,0.3), 0 0 60px rgba(14,165,233,0.1)',
        'glow-alert': '0 0 20px rgba(239,68,68,0.3), 0 0 60px rgba(239,68,68,0.1)',
        'glass':      '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg':   '0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'float 8s ease-in-out infinite',
        'float-delay': 'float 7s ease-in-out 2s infinite',
        'glow-pulse':  'glow-pulse 3s ease-in-out infinite',
        'gradient':    'gradient-shift 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
