import type { Config } from 'tailwindcss';

/**
 * Brand tokens live in app/globals.css as CSS custom properties.
 * When the official PossAbilities brand guidelines arrive, update the
 * values there once and every page, component and email preview follows.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-deep': 'rgb(var(--brand-deep) / <alpha-value>)',
        acorn: 'rgb(var(--acorn) / <alpha-value>)',
        leaf: 'rgb(var(--leaf) / <alpha-value>)',
        sunshine: 'rgb(var(--sunshine) / <alpha-value>)',
        sky: 'rgb(var(--sky) / <alpha-value>)',
        cream: 'rgb(var(--cream) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        blob: '2.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-18px) rotate(3deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(14px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'tail-swish': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '30%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-6deg)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        wiggle: 'wiggle 2.2s ease-in-out infinite',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'tail-swish': 'tail-swish 3s ease-in-out infinite',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgb(46 42 71 / 0.18)',
        lift: '0 18px 40px -16px rgb(46 42 71 / 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
