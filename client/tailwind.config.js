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
          DEFAULT: '#471ca8',
          hover: '#3a158b',
          purple: '#884ab2',
          orange: '#ff8008',
          sand: '#e9c46a',
          glow: 'rgba(71, 28, 168, 0.3)',
        },
        brand: {
          indigo: '#471ca8',
          purple: '#884ab2',
          orange: '#ff8008',
          sand: '#e9c46a',
        },
        coral: {
          DEFAULT: '#ff6363',
          glow: 'rgba(255, 99, 99, 0.2)',
        },
        amber: {
          DEFAULT: '#ff8008',
          glow: 'rgba(255, 128, 8, 0.25)',
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
      backgroundImage: {
        'project-gradient': 'linear-gradient(135deg, #471ca8 0%, #884ab2 50%, #ff8008 100%)',
        'primary-gradient': 'linear-gradient(135deg, #471ca8 0%, #884ab2 50%, #ff8008 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #471ca8 0%, #ff8008 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(71, 28, 168, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(136, 74, 178, 0.35)',
        'glow-orange': '0 0 25px -5px rgba(255, 128, 8, 0.35)',
        'glow-coral': '0 0 25px -5px rgba(255, 99, 99, 0.3)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.3)',
      },
    },
  },
  plugins: [],
}
