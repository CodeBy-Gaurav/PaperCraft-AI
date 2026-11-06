/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        ink: '#0F172A',
        muted: '#475569',
        line: '#E2E8F0',
        primary: '#4F46E5',
        teal: '#0D9488'
      }
    }
  },
  plugins: []
};
