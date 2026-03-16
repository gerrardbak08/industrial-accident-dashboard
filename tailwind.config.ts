import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          high: '#ef4444',    // red-500
          medium: '#f97316',  // orange-500
          low: '#eab308',     // yellow-500
          none: '#6b7280',    // gray-500
        },
      },
    },
  },
  plugins: [],
}

export default config
