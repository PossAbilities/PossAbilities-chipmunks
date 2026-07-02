import type { Config } from 'tailwindcss';

/**
 * PossAbilities brand tokens — sampled directly from the Brand Manual 1.1
 * artwork. Values live in app/globals.css as CSS custom properties; the
 * email templates mirror them in lib/email/templates.ts.
 *
 *   pink    #E43092  logo bar / "Poss" / primary actions
 *   indigo  #362B74  wave + "Abilities" / headings
 *   teal    #4BC1B9  logo circle / wave highlight
 *   duck    #D6EEEE  approved pale background
 *   plum    #7B3179  pink×teal overlap in the logo / warnings
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: 'rgb(var(--pa-pink) / <alpha-value>)',
        'pink-deep': 'rgb(var(--pa-pink-deep) / <alpha-value>)',
        indigo: 'rgb(var(--pa-indigo) / <alpha-value>)',
        'indigo-deep': 'rgb(var(--pa-indigo-deep) / <alpha-value>)',
        teal: 'rgb(var(--pa-teal) / <alpha-value>)',
        duck: 'rgb(var(--pa-duck) / <alpha-value>)',
        mist: 'rgb(var(--pa-mist) / <alpha-value>)',
        plum: 'rgb(var(--pa-plum) / <alpha-value>)',
        ink: 'rgb(var(--pa-ink) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Quicksand', '"Baloo 2"', 'system-ui', 'sans-serif'],
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
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-rev': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        blob: {
          '0%, 100%': { borderRadius: '46% 54% 60% 40% / 45% 44% 56% 55%' },
          '50%': { borderRadius: '58% 42% 40% 60% / 55% 58% 42% 45%' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(0.7) rotate(0deg)', opacity: '0.4' },
          '50%': { transform: 'scale(1.15) rotate(18deg)', opacity: '1' },
        },
        'wave-drift': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-2.5%)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        wiggle: 'wiggle 2.2s ease-in-out infinite',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'tail-swish': 'tail-swish 3s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        'marquee-rev': 'marquee-rev 34s linear infinite',
        blob: 'blob 9s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2.4s ease-in-out infinite',
        sparkle: 'sparkle 2.8s ease-in-out infinite',
        'wave-drift': 'wave-drift 14s ease-in-out infinite',
        'spin-slow': 'spin-slow 24s linear infinite',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgb(54 43 116 / 0.18)',
        lift: '0 18px 40px -16px rgb(54 43 116 / 0.30)',
        pink: '0 14px 30px -12px rgb(228 48 146 / 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
