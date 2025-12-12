/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#fdfbf7',
                'bg-secondary': '#f5f0e6',
                'text-primary': '#4a4036',
                'text-secondary': '#8c7b6c',
                'accent-wa': '#c2a878',
                'accent-jp': '#8b5e3c',
                'accent-fusion': '#a68a64',
                'glass-bg': 'rgba(255, 255, 255, 0.7)',
                'glass-border': 'rgba(194, 168, 120, 0.2)',
            },
            fontFamily: {
                main: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'pattern': "url('/bg-pattern.png')",
                'logo-mask': "url('/logo.png')",
            },
            backdropBlur: {
                'card': '12px',
            }
        },
    },
    plugins: [],
}
