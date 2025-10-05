/**** Tailwind configuration for dark + red gradient theme ****/
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffe5e7',
          100: '#f9bdbf',
          200: '#f28f93',
          300: '#eb5f65',
          400: '#e63342',
          500: '#cc1a29',
          600: '#a50f1d',
          700: '#7d0713',
          800: '#54020a',
          900: '#2b0004'
        }
      },
      backgroundImage: theme => ({
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      })
    }
  },
  plugins: []
};
