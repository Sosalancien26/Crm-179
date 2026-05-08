/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50:  '#FFFFFF',  // surfaces (cards) — blanc pur
          100: '#FBFAF7',  // fond global — blanc cassé très clair
          200: '#F2EFE8',  // hover/séparation subtile
          300: '#E8E2D3',  // bordures
          400: '#C9BFA8'   // bordures fortes/séparateurs
        },
        ink: {
          50:  '#F8F8F7',
          100: '#EDEBE7',
          200: '#C7C2B8',
          300: '#8C8579',
          400: '#605A4E',
          500: '#3D382F',
          600: '#2A2620',
          700: '#1A1814',
          800: '#0F0E0B',
          900: '#070705'
        },
        copper: {
          50:  '#FBF3EB',
          100: '#F4E3D0',
          200: '#E5C39E',
          300: '#D29F69',
          400: '#B8651D',
          500: '#9C5217',
          600: '#7C4112'
        },
        glacier: {
          50:  '#F0F5F8', 100:'#DDE8EE', 200:'#B5CDD9',
          300: '#7FA9BD', 400:'#4D839A', 500:'#345E72', 600:'#1F4253'
        },
        forest: {
          50:  '#EFF5F0', 100:'#D8E5DA', 200:'#A8C4AC',
          300: '#6F9876', 400:'#3F6D4E', 500:'#2C5239', 600:'#1E3B29'
        },
        brick: {
          50:  '#F8EFEC', 100:'#EDD5CD', 200:'#D6A292',
          300: '#B8654E', 400:'#A33A2A', 500:'#822E22'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', '"Source Serif Pro"', 'Georgia', 'serif'],
        serif: ['"Source Serif Pro"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        sm:'4px', md:'6px', lg:'8px', xl:'10px', '2xl':'12px'
      },
      boxShadow: {
        paper:  '0 1px 2px 0 rgba(60,50,30,.04), 0 2px 6px -2px rgba(60,50,30,.06)',
        page:   '0 4px 16px -4px rgba(60,50,30,.10), 0 1px 3px 0 rgba(60,50,30,.05)',
        sharp:  '0 0 0 1px rgba(60,50,30,.06)',
        ring:   '0 0 0 3px rgba(184,101,29,.18)',
        soft:   '0 8px 24px -10px rgba(60,50,30,.12)'
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg,#B8651D 0%,#9C5217 100%)',
        'gradient-cool': 'linear-gradient(135deg,#345E72 0%,#1F4253 100%)'
      },
      letterSpacing: { editorial: '0.18em' },
      animation: {
        'fade-in':  'fadeIn .35s ease-out',
        'slide-up': 'slideUp .35s cubic-bezier(.21,1.02,.73,1)',
        'shimmer':  'shimmer 1.6s infinite linear'
      },
      keyframes: {
        fadeIn:  { '0%':{opacity:0}, '100%':{opacity:1} },
        slideUp: { '0%':{opacity:0, transform:'translateY(8px)'}, '100%':{opacity:1, transform:'translateY(0)'} },
        shimmer: { '0%':{backgroundPosition:'-400px 0'}, '100%':{backgroundPosition:'400px 0'} }
      }
    }
  },
  plugins: []
}
