import type { Config } from "tailwindcss";



export default {
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
        customOrange: '#FFA500',
        customBlue: '#4169E1',
        customGrey:'#2C2C2C',
      },
      fontFamily: {
        manrope: ['var(--font-manrope', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 1s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
