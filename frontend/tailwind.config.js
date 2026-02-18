/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#000000',
        'bg-secondary': '#1E293B',
        'accent-primary': '#F97316',
        'accent-secondary': '#FB923C',
        'primary-blue': '#1E40AF',
        'primary-blue-light': '#3B82F6',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'success': '#22c55e',
        'error': '#ef4444',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        float1: 'float1 20s ease-in-out infinite',
        float2: 'float2 20s ease-in-out infinite reverse',
        shake: 'shake 0.3s ease-in-out',
      },
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(1rem, -1rem) scale(1.05)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-0.75rem, 0.75rem) scale(1.03)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-0.25rem)' },
          '75%': { transform: 'translateX(0.25rem)' },
        }
      }
    },
  },
  plugins: [],
}
