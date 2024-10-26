/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        // primary: 'var(--text-primary)',
        // secondary: 'var(--bg-secondary)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'button-primary': 'var(--button-primary)',
        'button-hover': 'var(--button-hover)',
        'accent-color': 'var(--accent-color)',
        'hover-bg': 'var(--hover-bg)',
        'box-primary': 'var(--box-primary)',
        'dark-primary': 'var(--bg-primary)',
        'dark-secondary': 'var(--bg-secondary)',
        'dark-tertiary': 'var(--bg-tertiary)',
        'dark-text-primary': 'var(--text-primary)',
        'dark-text-secondary': 'var(--text-secondary)',
        'dark-button-primary': 'var(--button-primary)',
        'dark-button-hover': 'var(--button-hover)',
        'dark-accent-color': 'var(--accent-color)',
        'dark-hover-bg': 'var(--hover-bg)',
      },
    },
  },
  plugins: [],
};
