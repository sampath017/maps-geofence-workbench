import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0e14',
        panel: '#10141d',
        'panel-light': '#161b26',
        'panel-hover': '#1c2331',
        border: '#232a3a',
        'border-focus': '#364156',
        text: '#e8eaed',
        'text-dim': '#8b93a7',
        'text-muted': '#5c6479',
        amber: {
          DEFAULT: '#ff8a34',
          glow: '#ff8a3433',
          hover: '#ff9d54',
          dark: '#b35612',
        },
        cyan: {
          DEFAULT: '#4fd1c5',
          glow: '#4fd1c533',
          hover: '#6ee7b7',
          dark: '#1e8076',
        },
        emerald: {
          DEFAULT: '#10b981',
          glow: '#10b98133',
        },
        violet: {
          DEFAULT: '#8b5cf6',
          glow: '#8b5cf633',
        },
        crimson: {
          DEFAULT: '#f43f5e',
          glow: '#f43f5e33',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SF Mono', 'Cascadia Code', 'Consolas', 'Liberation Mono', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'hud-amber': '0 0 15px rgba(255, 138, 52, 0.2), 0 0 30px rgba(255, 138, 52, 0.08)',
        'hud-cyan': '0 0 15px rgba(79, 209, 197, 0.2), 0 0 30px rgba(79, 209, 197, 0.08)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
