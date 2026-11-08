/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        thumb: ['Anton', 'Impact', 'sans-serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
      },
      colors: {
        yt: {
          red: '#ff0000',
          brand: '#cc0000',
          text: '#0f0f0f',
          sub: '#606060',
          muted: '#909090',
          border: '#e5e5e5',
          line: 'rgba(0,0,0,0.1)',
          hover: '#f2f2f2',
          bg: '#f9f9f9',
          blue: '#065fd4',
          chart: '#2793e8',
          green: '#0f9d58',
          up: '#2ba640',
          down: '#cc0000',
        },
      },
      boxShadow: {
        menu: '0 4px 32px 0 rgba(0,0,0,0.1), 0 0 2px rgba(0,0,0,0.12)',
        dialog: '0 16px 24px 2px rgba(0,0,0,0.14), 0 6px 30px 5px rgba(0,0,0,0.12), 0 8px 10px -5px rgba(0,0,0,0.4)',
        card: '0 1px 2px rgba(0,0,0,0.04)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': { from: { opacity: '0', transform: 'scale(0.97) translateY(-4px)' }, to: { opacity: '1', transform: 'none' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        'slide-left': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        pulse2: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        tick: { '0%': { transform: 'translateY(60%)', opacity: '0' }, '100%': { transform: 'none', opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'pop-in': 'pop-in 140ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        'slide-left': 'slide-left 220ms cubic-bezier(0.2,0,0,1)',
        pulse2: 'pulse2 1.6s ease-in-out infinite',
        tick: 'tick 300ms ease-out',
      },
    },
  },
  plugins: [],
};
