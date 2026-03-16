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
                primary: {
                    DEFAULT: '#2E9F6B',
                    50: '#F2FBF7',
                    100: '#DFF3EA',
                    600: '#258A5D',
                    700: '#1F7F56',
                    dark: '#1F7F56',
                },
                primaryDark: '#1F7F56', // Semantic alias
                
                // Product Colors
                durian: '#CFE9DD',
                alpukat: '#F4E3CF',
                mangga: '#D9E5F5',
                lainnya: '#E6E0F3',

                // Functional Colors (with scales)
                success: {
                    DEFAULT: '#2DBE78',
                    50: '#ECFDF5',
                    100: '#D1FAE5',
                    200: '#A7F3D0',
                    300: '#6EE7B7',
                    400: '#34D399',
                    500: '#2DBE78',
                    600: '#059669',
                    700: '#047857',
                },
                warning: {
                    DEFAULT: '#FF8A4C',
                    50: '#FFF7ED',
                    100: '#FFEDD5',
                    200: '#FED7AA',
                    300: '#FDBA74',
                    400: '#FB923C',
                    500: '#FF8A4C',
                    600: '#EA580C',
                },
                danger: {
                    DEFAULT: '#FF5A5A',
                    50: '#FEF2F2',
                    100: '#FEE2E2',
                    200: '#FECACA',
                    300: '#FCA5A5',
                    400: '#F87171',
                    500: '#FF5A5A',
                    600: '#DC2626',
                },
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },

                // Semantic Colors
                bg: '#F6F8F7',
                card: '#FFFFFF',
                border: '#E7ECEA',
                text: '#1F2D2A',
                textSecondary: '#7B8A87',
            },
            boxShadow: {
                card: '0 4px 12px rgba(0,0,0,0.05)',
                floating: '0 10px 24px rgba(46,159,107,0.25)',
            },
            borderRadius: {
                card: '16px',
            },
        },
    },

    plugins: [forms, typography],
};
