/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Sidebar
        sidebar: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          active: '#334155',
          border: '#1e293b',
        },
        // Priority colors
        priority: {
          critical: { light: '#fef2f2', DEFAULT: '#dc2626', dark: '#991b1b' },
          high: { light: '#fff7ed', DEFAULT: '#ea580c', dark: '#9a3412' },
          medium: { light: '#fefce8', DEFAULT: '#ca8a04', dark: '#854d0e' },
          low: { light: '#f0fdf4', DEFAULT: '#16a34a', dark: '#166534' },
        },
        // Status colors
        status: {
          open: { light: '#fef2f2', DEFAULT: '#ef4444', dark: '#b91c1c' },
          inprogress: { light: '#fffbeb', DEFAULT: '#f59e0b', dark: '#b45309' },
          resolved: { light: '#ecfdf5', DEFAULT: '#10b981', dark: '#047857' },
          closed: { light: '#f1f5f9', DEFAULT: '#64748b', dark: '#334155' },
          pending: { light: '#faf5ff', DEFAULT: '#a855f7', dark: '#7e22ce' },
        },
        // Dashboard accent
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      spacing: {
        'sidebar': '16rem',       // 256px — expanded sidebar
        'sidebar-collapsed': '5rem', // 80px — collapsed sidebar
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
