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
        background: 'var(--bg-color)',
        canvas: 'var(--canvas-color)',
        card: 'var(--card-color)',
        'card-hover': 'var(--card-hover-color)',
        border: 'var(--border-color)',
        'border-muted': 'var(--border-subtle)',
        primary: {
          DEFAULT: '#8b5cf6', // Electric violet
          hover: '#7c3aed',
          glow: 'rgba(139, 92, 246, 0.25)',
        },
        coral: {
          DEFAULT: '#ff6363',
          glow: 'rgba(255, 99, 99, 0.2)',
        },
        amber: {
          DEFAULT: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.2)',
        },
        teal: {
          DEFAULT: '#14b8a6',
          glow: 'rgba(20, 184, 166, 0.2)',
        },
        mint: {
          DEFAULT: '#10b981',
          glow: 'rgba(16, 185, 129, 0.2)',
        },
        plum: {
          900: 'var(--plum-900)',
          800: 'var(--plum-800)',
          700: 'var(--plum-700)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-coral': '0 0 25px -5px rgba(255, 99, 99, 0.3)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.3)',
      },
    },
  },
  plugins: [],
}
