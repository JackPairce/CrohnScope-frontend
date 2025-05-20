/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class", // or 'media' for OS preference based dark mode
  theme: {
    extend: {
      colors: {
        // You can define theme colors here to use in Tailwind classes
        // These will complement the CSS variables
      },
    },
  },
  plugins: [],
};
