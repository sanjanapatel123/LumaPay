/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: "#FAF8FF",
          100: "#F0EBFF",
          200: "#E2D8FF",
          300: "#C9B7FF",
          400: "#AC91F5",
          500: "#9274E8",
          600: "#7957D5",
          700: "#6343B5",
          800: "#4C3588",
        },
        ink: {
          900: "#211B35",
          700: "#514A65",
          500: "#888197",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      boxShadow: {
        premium: "0 12px 40px rgba(79, 55, 137, 0.07)",
        card: "0 4px 18px rgba(79, 55, 137, 0.045)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
