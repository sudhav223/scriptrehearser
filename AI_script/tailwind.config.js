/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: '#030014',
        secondary: '#151312',
        light:{
          100: '#D6C6FF',
          200: '#A8B5DB',
        }
      }
    },
  },
  plugins: [],
}