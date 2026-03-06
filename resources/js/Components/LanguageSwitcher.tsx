import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import type { LocaleMetadata } from '@/types';

export default function LanguageSwitcher() {
    const page = usePage();
    const { locale, locales } = page.props as {
        locale: string;
        locales?: {
            current: LocaleMetadata;
            supported: Record<string, LocaleMetadata>;
        };
    };
    
    const [isOpen, setIsOpen] = useState(false);
    
    const supportedLocales = locales?.supported ?? {};
    const currentLocale = locales?.current ?? { code: locale, name: locale, native_name: locale, flag: '', dir: 'ltr' as const };

    // Hide switcher if only one locale is configured
    if (Object.keys(supportedLocales).length <= 1) {
        return null;
    }

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
                aria-label="Select language"
            >
                <span className="mr-1.5">{currentLocale.flag}</span>
                {currentLocale.native_name}
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
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        {Object.entries(supportedLocales).map(([code, localeData]) => {
                            const isActive = code === locale;
                            
                            return (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => handleLocaleChange(code)}
                                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                                        isActive
                                            ? 'bg-green-50 font-semibold text-green-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                    aria-current={isActive ? 'true' : undefined}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">{localeData.flag}</span>
                                        <span>{localeData.native_name}</span>
                                        {localeData.name !== localeData.native_name && (
                                            <span className="text-xs text-gray-500">
                                                ({localeData.name})
                                            </span>
                                        )}
                                    </span>
                                    {isActive && (
                                        <svg
                                            className="h-5 w-5 text-green-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
