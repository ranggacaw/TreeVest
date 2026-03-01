import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function LanguageSwitcher() {
    const { locale, availableLocales } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);

    const handleLocaleChange = (newLocale: string) => {
        if (newLocale === locale) {
            setIsOpen(false);
            return;
        }

        router.patch(
            '/profile/locale',
            { locale: newLocale },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
            >
                {availableLocales[locale] || locale}
                <svg
                    className="-me-0.5 ms-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        {Object.entries(availableLocales).map(([code, name]) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => handleLocaleChange(code)}
                                className={`block w-full px-4 py-2 text-left text-sm ${
                                    code === locale
                                        ? 'bg-gray-100 font-medium text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
