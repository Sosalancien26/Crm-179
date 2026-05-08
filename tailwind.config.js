/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0A0A0F',
          850: '#0E0E14',
          800: '#13131B',
          700: '#1B1B25',
          600: '#262633',
          500: '#3A3A4A',
          400: '#5C5C70',
          300: '#8A8AA0',
          200: '#B8B8CC',
          100: '#E8E8F0'
        },
        brand: {
          violet: '#7C3AED',
          blue:   '#3B82F6',
          gold:   '#D4AF37'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '22px'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,58,237,.35), 0 8px 32px -8px rgba(124,58,237,.55)',
        soft: '0 8px 24px -10px rgba(0,0,0,.4), 0 2px 8px -2px rgba(0,0,0,.25)',
        card: '0 1px 0 0 rgba(255,255,255,.04) inset, 0 12px 32px -12px rgba(0,0,0,.6)'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg,#7C3AED 0%,#3B82F6 100%)',
        'gradient-gold':    'linear-gradient(135deg,#F2CB6B 0%,#D4AF37 100%)',
        'gradient-noise':
          'radial-gradient(ellipse at top, rgba(124,58,237,.08), transparent 60%),' +
          'radial-gradient(ellipse at bottom right, rgba(59,130,246,.06), transparent 55%)'
      },
      animation: {
        'fade-in':  'fadeIn .35s ease-out',
        'slide-up': 'slideUp .35s cubic-bezier(.21,1.02,.73,1)',
        'shimmer':  'shimmer 1.6s infinite linear',
        'pulse-glow':'pulseGlow 2.4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn:    { '0%':{opacity:0}, '100%':{opacity:1} },
        slideUp:   { '0%':{opacity:0, transform:'translateY(8px)'}, '100%':{opacity:1, transform:'translateY(0)'} },
        shimmer:   { '0%':{backgroundPosition:'-400px 0'}, '100%':{backgroundPosition:'400px 0'} },
        pulseGlow: { '0%,100%':{boxShadow:'0 0 0 0 rgba(124,58,237,.45)'}, '50%':{boxShadow:'0 0 0 8px rgba(124,58,237,0)'} }
      }
    }
  },
  plugins: []
}
