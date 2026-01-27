/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#328ce7',
          light: '#5a7690',
          dark: '#2870b9',
        },
        background: {
          light: '#f6f7f8',
          dark: '#111921',
          card: '#1a2632',
        },
        surface: {
          dark: '#1a2632',
          medium: '#1e293b',
          border: '#344d65',
        },
        text: {
          primary: '#ffffff',
          secondary: '#93adc8',
          muted: '#5a7690',
        },
        accent: {
          blue: '#328ce7',
        }
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
