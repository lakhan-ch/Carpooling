/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: '#c8f04a', light: '#d8f76a', pale: '#edfab0' },
        ink: { DEFAULT: '#0a0a0a', 60: 'rgba(10,10,10,0.6)', 30: 'rgba(10,10,10,0.3)' },
        paper: { DEFAULT: '#ffffff', warm: '#fafaf8', grey: '#f2f2f0' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        '10xl': ['9rem', { lineHeight: '0.92' }],
        '9xl':  ['7rem', { lineHeight: '0.93' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
      },
    },
  },
  plugins: [],
}
