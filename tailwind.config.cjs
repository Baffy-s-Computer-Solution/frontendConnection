// tailwind.config.cjs
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8fafc',
          subtle:  '#f1f5f9',
          border:  '#e2e8f0',
          inverse: '#0f172a',
        },
        success: { light:'#dcfce7', DEFAULT:'#16a34a', dark:'#166534' },
        warning: { light:'#fef3c7', DEFAULT:'#d97706', dark:'#92400e' },
        danger:  { light:'#fee2e2', DEFAULT:'#dc2626', dark:'#991b1b' },
        info:    { light:'#dbeafe', DEFAULT:'#2563eb', dark:'#1e40af' },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card:  '0 1px 2px 0 rgb(15 23 42 / 0.05), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        pop:   '0 10px 24px -6px rgb(15 23 42 / 0.12)',
        focus: '0 0 0 3px rgb(99 102 241 / 0.35)',
      },
      borderRadius: { xl2: '1rem' },
      spacing: { 18: '4.5rem', 22: '5.5rem' },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in .2s cubic-bezier(0.16,1,0.3,1)' },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};