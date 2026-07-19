/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slide: {
          '0%': { backgroundPosition: '0 center' },
          '100%': { backgroundPosition: '110px center' },
        },
      },
      animation: {
        slide: 'slide 2s linear infinite',
      },
    },
  },
  plugins: [],
}
