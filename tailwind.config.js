/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'claude-cream': '#F9F6F1',
        'claude-text': '#0A0A0A',
        'claude-accent': '#D97757',
        'claude-hover': '#C5654A',
        'claude-border': '#E8E3D9',
        'claude-card-bg': '#FFFFFF',
        'claude-sidebar': '#FFFFFF',
        'claude-secondary': '#4B535A',
        'claude-light-accent': '#FBF0ED',
        'claude-primary': '#0A2540',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      height: {
        '18': '4.5rem', // 72px header height
      },
    },
  },
  plugins: [],
}
