/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--navy)',
        'navy-dark': 'var(--navy-dark)',
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        semble: 'var(--semble-blue)',
        'semble-light': 'var(--semble-light)',
        red: 'var(--red)',
        'red-light': 'var(--red-light)',
        amber: 'var(--amber)',
        'amber-light': 'var(--amber-light)',
        green: 'var(--green)',
        'green-light': 'var(--green-light)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-faint': 'var(--text-faint)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: { base: '14px' },
      borderRadius: { card: '8px', input: '6px', action: '12px' },
    },
  },
  plugins: [],
}
