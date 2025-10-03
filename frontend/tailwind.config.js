/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#FAF8F5",
          100: "#F4F1EC",
          200: "#E9E4DA",
          300: "#DDD6C7",
          400: "#CFC6B5",
          500: "#BEB29A",
          600: "#9F937C",
          700: "#7E7562",
          800: "#5F594B",
          900: "#4A463E"
        },
        stoneink: "#2A2A2A",
        accent: "#7A9E9F",      // desaturated teal
        blush: "#EBD9CF",       // soft blush for highlights
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)",
        card: "0 6px 18px rgba(0,0,0,0.07)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)"
      },
      backdropBlur: {
        xs: "2px"
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-hover': 'scaleHover 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}