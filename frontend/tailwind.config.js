export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#245fbd',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: '#3b82f6',
        academyGreen: '#087f5b',
        academyDark: '#0b1220',
        academyCard: '#142238',
        surface: {
          DEFAULT: '#142238',
          light: '#ffffff',
          muted: '#f4f7fb',
        },
      },
      boxShadow: {
        soft: '0 4px 18px rgba(15, 23, 42, 0.06)',
        card: '0 12px 32px rgba(2, 8, 23, 0.12)',
        lift: '0 18px 42px rgba(2, 8, 23, 0.16)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
