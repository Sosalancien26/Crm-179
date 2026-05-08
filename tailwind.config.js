/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fond crème / ivoire — comme du papier épais
        paper: {
          50:  '#FBFAF6',  // ivoire très clair (surfaces)
          100: '#F7F4EE',  // crème principal (fond)
          200: '#EFEAE0',  // crème ombré
          300: '#E4DCC9',  // bord doux
          400: '#C9BFA8'   // séparateur
        },
        // Texte anthracite pour contraste papier
        ink: {
          50:  '#F5F5F5',
          100: '#E8E6E3',
          200: '#B5B0A8',
          300: '#7A7468',
          400: '#5C564B',
          500: '#3D382F',
          600: '#2A2620',
          700: '#1F1C18',
          800: '#15130F',
          900: '#0A0908'
        },
        // Accent chaleur — cuivre brûlé (énergie/PAC)
        copper: {
          50:  '#FBF3EB',
          100: '#F4E3D0',
          200: '#E5C39E',
          300: '#D29F69',
          400: '#B8651D',  // accent principal
          500: '#9C5217',
          600: '#7C4112',
          700: '#5D300D'
        },
        // Accent froid — bleu glacier (eau)
        glacier: {
          50:  '#F0F5F8',
          100: '#DDE8EE',
          200: '#B5CDD9',
          300: '#7FA9BD',
          400: '#4D839A',
          500: '#345E72',
          600: '#1F4253'
        },
        // Vert sapin pour éco/succès
        forest: {
          50:  '#EFF5F0',
          100: '#D8E5DA',
          200: '#A8C4AC',
          300: '#6F9876',
          400: '#3F6D4E',
          500: '#2C5239',
          600: '#1E3B29'
        },
        // Rouge brique pour erreurs/perdu
        brick: {
          50:  '#F8EFEC',
          100: '#EDD5CD',
          200: '#D6A292',
          300: '#B8654E',
          400: '#A33A2A',
          500: '#822E22'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', '"Source Serif Pro"', 'Georgia', 'serif'],
        serif: ['"Source Serif Pro"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        sm:  '4px',
        md:  '6px',
        lg:  '8px',
        xl:  '10px',
        '2xl': '12px'
      },
      boxShadow: {
        // Ombres douces "papier sur table"
        paper:  '0 1px 0 0 rgba(184,101,29,.05), 0 4px 12px -4px rgba(60,50,30,.10)',
        page:   '0 2px 0 0 rgba(184,101,29,.04), 0 12px 28px -10px rgba(60,50,30,.14)',
        sharp:  '0 0 0 1px rgba(60,50,30,.08)',
        ring:   '0 0 0 3px rgba(184,101,29,.18)',
        inset:  'inset 0 1px 0 0 rgba(255,255,255,.6)',
        soft:   '0 8px 24px -10px rgba(60,50,30,.18)'
      },
      backgroundImage: {
        'paper-grain':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.32 0 0 0 0 0.18 0 0 0 .035 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        'gradient-warm':
          'linear-gradient(135deg,#B8651D 0%,#9C5217 100%)',
        'gradient-cool':
          'linear-gradient(135deg,#345E72 0%,#1F4253 100%)'
      },
      letterSpacing: {
        editorial: '0.18em'
      },
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
