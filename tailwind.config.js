import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D0E16', // Black (was Nigerian blue)
          600: '#1a1a1a',
        },
        accent: '#FFC107', // Gold/Yellow as accent
        neutral: {
          900: '#0D0E16',
          800: '#1a1a1a',
          700: '#4B5563',
          600: '#4a4a4a',
          500: '#666666',
          400: '#999999',
          300: '#cccccc',
          200: '#e5e5e5',
          100: '#f5f5f5',
          50: '#fafafa',
        },
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#ffc107',
        info: '#17a2b8',
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.5rem', {
          lineHeight: '1.2'
        }], // 40px with responsive scaling
        'h2': ['2rem', {
          lineHeight: '1.3'
        }], // 32px
        'h3': ['1.5rem', {
          lineHeight: '1.4'
        }], // 24px
        'h4': ['1.25rem', {
          lineHeight: '1.5'
        }], // 20px
      },
      borderRadius: {
        'md': '12px',
        'lg': '20px',
      },
      maxWidth: {
        'container': '1200px',
        'screen': '100vw',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [
    typography,
  ],
}