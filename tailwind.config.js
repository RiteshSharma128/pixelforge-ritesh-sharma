/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        violet: {
          50:'#f5f3ff', 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd',
          400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed',
          700:'#6d28d9', 800:'#5b21b6', 900:'#4c1d95'
        },
        brand: {
          bg:'#07070f',
          bg2:'#0f0f1a',
          bg3:'#161625',
          bg4:'#1e1e30',
          border:'rgba(124,58,237,0.18)'
        }
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['Inter','sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'spin-slow': 'spin 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          from:{ opacity:'0' },
          to:{ opacity:'1' }
        },
        slideUp: {
          from:{ opacity:'0', transform:'translateY(10px)' },
          to:{ opacity:'1', transform:'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}