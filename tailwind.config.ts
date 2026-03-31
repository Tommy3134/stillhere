import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'look-around': 'lookAround 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'twinkle-delay': 'twinkle 2s ease-in-out infinite 1s',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'translateX(-50%) scale(1)' },
          '50%': { transform: 'translateX(-50%) scale(1.05)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(-8px)' },
        },
        lookAround: {
          '0%, 100%': { transform: 'translateX(-50%) rotate(0deg)' },
          '25%': { transform: 'translateX(-50%) rotate(-5deg)' },
          '75%': { transform: 'translateX(-50%) rotate(5deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateX(-50%) translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
