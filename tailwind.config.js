import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Earthy & Organic Palette
                pine: {
                    DEFAULT: '#2D4A3E', // Deep forest green
                    100: '#E6EFEA',
                    200: '#C2D9CD',
                    500: '#5A8B73',
                    800: '#1A2B24',
                },
                sage: {
                    DEFAULT: '#899E8B', // Soft sage green
                    100: '#F0F3F1',
                    500: '#899E8B',
                    800: '#4D5E4E',
                },
                earth: {
                    DEFAULT: '#8C6C54', // Warm terracotta / soil
                    100: '#F5EFEB',
                    500: '#C29875',
                    800: '#544132',
                },
                sand: {
                    DEFAULT: '#FDFBF7', // Warm off-white background
                    100: '#FAF6ED',
                    200: '#F3EFE6',
                },
                sun: {
                    DEFAULT: '#D99A45', // Warm amber / sunshine
                    50: '#FDF6E9',
                    100: '#F8E9D0',
                    500: '#D99A45',
                }
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(45,74,62,0.08)',
                'card': '0 4px 20px -2px rgba(0,0,0,0.05)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        },
    },

    plugins: [forms, typography],
};
