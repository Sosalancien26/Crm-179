/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === Backgrounds Gris Dior — taupe champagne ===
        paper: {
          50:  '#FFFFFF',  // surfaces (cards) — blanc pur couture
          100: '#F5F1EA',  // fond global — champagne ivoire chaud
          200: '#EBE5D8',  // hover/séparation taupe pâle
          300: '#D6CCBB',  // bordures Gris Montaigne
          400: '#B5A893'   // séparateurs profonds taupe
        },
        // === Textes — charbon couture progressif ===
        ink: {
          50:  '#FAF9F6',
          100: '#ECE8DF',
          200: '#BAB3A6',
          300: '#857F73',  // texte secondaire
          400: '#54504A',  // texte body
          500: '#2F2D29',  // texte primaire
          600: '#1C1B19',  // titres
          700: '#0E0E0C'   // ultra
        },
        // === Champagne — accent unique, sobre, luxueux ===
        // (variable nommée 'copper' pour stabilité du code, valeurs champagne)
        copper: {
          50:  '#F8F1E2',
          100: '#EEE2C5',
          200: '#DDC79A',
          300: '#C5A572',  // SIGNATURE Gris Dior champagne
          400: '#A78652',  // hover/active
          500: '#8A6A3F',
          600: '#6D5230'
        },
        // === Glacier — gris froid pour badges secondaires ===
        glacier: {
          50:  '#F0F2F4', 100:'#DFE2E7', 200:'#B7BDC6',
          300: '#7E8794', 400:'#535B66', 500:'#363B43', 600:'#1C1F23'
        },
        // === Forêt — vert sombre pour OK / signé ===
        forest: {
          50:  '#EEF1ED', 100:'#D4DBD2', 200:'#A2B0A1',
          300: '#6B7E6E', 400:'#3F4F40', 500:'#2C3A2E', 600:'#1E2920'
        },
        // === Brique — rouge sombre pour erreurs (jamais flashy) ===
        brick: {
          50:  '#F4ECE9', 100:'#E5D2CC', 200:'#C99F92',
          300: '#A66856', 400:'#824032', 500:'#612D22'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Cormorant"', 'Didot', '"Bodoni 72"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        sm:'2px', md:'4px', lg:'6px', xl:'8px', '2xl':'10px'
      },
      boxShadow: {
        // Couture : presque invisible, juste un voile
        paper: '0 1px 0 0 rgba(28,27,25,.04), 0 0 0 1px rgba(28,27,25,.04)',
        page:  '0 4px 16px -8px rgba(28,27,25,.08), 0 0 0 1px rgba(28,27,25,.04)',
        sharp: '0 0 0 1px rgba(28,27,25,.06)',
        ring:  '0 0 0 3px rgba(197,165,114,.20)',
        soft:  '0 12px 32px -16px rgba(28,27,25,.10)'
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg,#C5A572 0%,#A78652 100%)',
        'gradient-cool': 'linear-gradient(135deg,#535B66 0%,#363B43 100%)'
      },
      letterSpacing: {
        editorial: '0.22em',  // un peu plus large pour le couture
        tight: '-0.01em'
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
