/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This line is crucial
  ],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(to right, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
      },
    },
  },

  plugins: [],
}