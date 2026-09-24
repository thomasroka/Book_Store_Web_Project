/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      paper: '#FAF7F2',
      surface: '#FFFFFF',
      ink: '#211D18',
      body: '#3A352E',
      muted: '#6F695F',
      faint: '#9B958A',
      line: '#E3DDD3',
      'line-strong': '#CFC7B9',
      accent: {
        DEFAULT: '#2E4A3A',
        dark: '#22382B',
        deep: '#182B20',
        soft: '#E8EDE8',
        hover: '#26402F',
      },
      success: {
        DEFAULT: '#2F6B3C',
        soft: '#E6F0E7',
      },
      warning: {
        DEFAULT: '#9A6B1D',
        soft: '#FAF1DF',
      },
      danger: {
        DEFAULT: '#A33A2B',
        soft: '#F7E8E5',
      },
      info: {
        DEFAULT: '#33526E',
        soft: '#E9EFF4',
      },
      neutral: {
        50: '#F7F6F3',
        100: '#EFEDE8',
        200: '#E0DDD5',
        300: '#C9C4B9',
        400: '#AAA394',
        500: '#8A8374',
        600: '#6B6559',
        700: '#4C473E',
        800: '#2E2B26',
        900: '#191714',
      },
    },
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '3px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      menu: '0 2px 10px rgba(33, 29, 24, 0.08)',
      lifted: '0 6px 18px rgba(33, 29, 24, 0.10)',
      modal: '0 16px 48px rgba(33, 29, 24, 0.20)',
    },
    extend: {
      maxWidth: {
        shell: '1280px',
      },
      fontSize: {
        'display-lg': ['2.75rem', { lineHeight: '1.1' }],
        display: ['2.25rem', { lineHeight: '1.15' }],
        'heading-lg': ['1.75rem', { lineHeight: '1.25' }],
        heading: ['1.4rem', { lineHeight: '1.3' }],
        'title-lg': ['1.15rem', { lineHeight: '1.35' }],
        title: ['1rem', { lineHeight: '1.4' }],
        small: ['0.875rem', { lineHeight: '1.45' }],
        'x-small': ['0.78rem', { lineHeight: '1.4' }],
      },
      letterSpacing: {
        tightest: '-0.01em',
      },
    },
  },
  plugins: [],
};