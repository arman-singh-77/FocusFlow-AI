/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF8F5',
          200: '#F3EFEA',
          300: '#EAE3DA',
          400: '#D8CEBE',
        },
        mint: {
          50: '#F2F8F5',
          100: '#E8F3EE',
          200: '#D5E8DE',
          300: '#B8D8C7',
          400: '#86BCA0',
          500: '#539E79',
          600: '#3D7D5E',
        },
        forest: {
          50: '#EEF6F1',
          100: '#DCEDE2',
          200: '#BBDAC7',
          300: '#8FBFA3',
          400: '#5C9E7B',
          500: '#3D7D5D',
          600: '#2F6449',
          700: '#28533E',
          800: '#204332',
          900: '#173326',
          950: '#0C1C15',
        },
        charcoal: {
          800: '#232E28',
          850: '#1C2621',
          900: '#161F1A',
          950: '#101713',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(23, 51, 38, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(23, 51, 38, 0.07), 0 4px 10px -2px rgba(23, 51, 38, 0.03)',
        'soft-dark': '0 4px 20px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
