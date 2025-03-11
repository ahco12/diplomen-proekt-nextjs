import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      scale: {
        '102': '1.02',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'game-dark': '#1a1740',
        'game-light': '#2a1f6f',
        customOrange: '#FFA500',
        customBlue: '#4169E1',
        customGrey: '#2C2C2C',
      },
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'], // ✅ FIXED: Closed `var(--font-manrope)`
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            backgroundSize: '200% 200%',
            backgroundPosition: 'left center',
          },
          '50%': {
            backgroundSize: '200% 200%',
            backgroundPosition: 'right center',
          },
        },
        float: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 1s ease-in-out',
        'gradient-x': 'gradient-x 3s ease infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite'
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/forms'),
  ]
} satisfies Config;
