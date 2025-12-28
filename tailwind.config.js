/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // New Pink & Purple Palette
                'cream': '#F8F4EC',
                'light-pink': '#FF8FB7',
                'hot-pink': '#E83C91',
                'dark-plum': '#43334C',

                // Legacy compatibility
                'powder-blush': '#FFF7FB',
                'surface-white': '#FFFFFF',
                'lavender-fog': '#F3F0FF',
                'border-soft': '#E7DDF5',
                'text-primary': '#43334C',
                'text-secondary': '#E83C91',
                'text-muted': '#FF8FB7',
                'placeholder': '#A596B6',
                'primary': '#E83C91',
                'primary-hover': '#d12f7f',
                'secondary': '#FF8FB7',
                'secondary-hover': '#ff7aa5',
                'accent': '#43334C',
                'success': '#2BCB93',
                'warning': '#FFC857',
                'error': '#E84B6A',
                'highlight': '#F8F4EC',
                'selection': '#FFE5F0',
                // Card Colors
                'card-rose': '#FFF0F5',
                'card-blue': '#FFE5F0',
                'card-green': '#FFE5F0',
                'card-yellow': '#FFF9F0',
                'card-purple': '#FFE5F0',
            },
            backgroundImage: {
                'gradient-header': 'linear-gradient(90deg, #FFB3D9, #CBB7FF, #AEEBFF)',
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
