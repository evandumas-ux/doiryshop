/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#c9354d',
          DEFAULT: '#A8192B', // Rouge cramoisi (couleur de l'aigle)
          dark: '#7d1220',
        },
        accent: {
          light: '#e8d5a3',
          DEFAULT: '#C9A84C', // Or égyptien
          dark: '#9e7e2a',
        },
        background: {
          DEFAULT: '#0A0A0A', // Noir profond
          light: '#141414',
          card: '#1A1A1A',
        },
        surface: {
          DEFAULT: '#1A1A1A',
          light: '#222222',
          border: '#2A2A2A',
        },
        text: {
          DEFAULT: '#F0EDE8', // Blanc cassé/crème
          light: '#9A9590',
          muted: '#6B6560',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cinzel', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      letterSpacing: {
        tightest: '-.075em',
        tighter: '-.05em',
        tight: '-.025em',
        normal: '0',
        wide: '.05em',
        wider: '.1em',
        widest: '.25em',
        premium: '.15em',
      },
      backgroundImage: {
        'hieroglyphs': "url('/bg_texture.png')",
      },
      boxShadow: {
        'glow-red': '0 0 30px rgba(168, 25, 43, 0.15)',
        'glow-gold': '0 0 30px rgba(201, 168, 76, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
