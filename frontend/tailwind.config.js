/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: '#fcfcfd',
        'ground-muted': '#f3f4f6',
        panel: '#ffffff',
        ink: '#16191f',
        'ink-secondary': '#454c58',
        rule: '#dde0e6',
        accent: '#074ce0',
        'on-accent': '#ffffff',
        field: '#16191f',
        'on-field': '#fcfcfd',
        'on-field-secondary': '#d0d4dd',
      },
      fontFamily: {
        display: ['"Host Grotesk"', 'sans-serif'],
        sans: ['"Instrument Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        panel: '12px',
      },
      boxShadow: {
        panel: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'panel-elevated': '0 10px 25px -5px rgba(22, 25, 31, 0.06), 0 8px 10px -6px rgba(22, 25, 31, 0.04)',
        accent: '0 4px 14px 0 rgba(7, 76, 224, 0.25)',
      },
      transitionTimingFunction: {
        'dp-ease': 'ease-out',
      },
      transitionDuration: {
        'dp-motion': '160ms',
      }
    },
  },
  plugins: [],
}
