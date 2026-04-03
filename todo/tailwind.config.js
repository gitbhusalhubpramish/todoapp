/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // for Next.js app dir
    "./components/**/*.{js,ts,jsx,tsx}" // your components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
