/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
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
  safelist: [
    'from-blue-50',
    'via-white',
    'to-purple-50',
    'from-blue-100',
    'to-purple-100',
    'bg-white/70',
    'bg-white/50',
    'bg-white/80',
    'bg-white/90',
    'backdrop-blur-md',
    'backdrop-blur-sm',
    'border-white/20',
    'border-white/30',
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-200',
    'text-gray-600',
    'text-gray-700',
    'text-gray-800',
    'text-gray-900',
    'border-gray-200',
    'border-gray-300',
  ],
}

