import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { t } = useTranslation();
    const page = usePage();
    const user = page.props.auth?.user;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-sand shadow-sm relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-pine rounded-lg flex items-center justify-center shadow-soft">
                                <svg className="w-5 h-5 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v8" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-pine-800">Treevest</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-earth-600 hover:text-pine transition-colors font-medium">{t('navigation:home')}</Link>
                        <Link href="/farms" className="text-earth-600 hover:text-pine transition-colors font-medium">{t('navigation:farms')}</Link>
                        <Link href="/trees" className="text-earth-600 hover:text-pine transition-colors font-medium">{t('navigation:trees')}</Link>
                        <Link href="/education" className="text-earth-600 hover:text-pine transition-colors font-medium">{t('navigation:education')}</Link>
                    </div>

                    {/* Auth Buttons Desktop */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2 rounded-full bg-pine text-white font-medium hover:bg-pine-800 transition-colors shadow-soft"
                            >
                                {t('navigation:dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-earth-600 hover:text-pine transition-colors font-medium"
                                >
                                    {t('auth.login')}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-5 py-2 rounded-full bg-pine text-white font-medium hover:bg-pine-800 transition-colors shadow-soft"
                                >
                                    {t('navigation:start_investing')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-earth-600 hover:text-pine focus:outline-none p-2"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-sand absolute w-full left-0 shadow-lg">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-earth-600 hover:text-pine hover:bg-sand/30"
                        >
                            {t('navigation:home')}
                        </Link>
                        <Link
                            href="/farms"
                            className="block px-3 py-2 rounded-md text-base font-medium text-earth-600 hover:text-pine hover:bg-sand/30"
                        >
                            {t('navigation:farms')}
                        </Link>
                        <Link
                            href="/trees"
                            className="block px-3 py-2 rounded-md text-base font-medium text-earth-600 hover:text-pine hover:bg-sand/30"
                        >
                            {t('navigation:trees')}
                        </Link>
                        <Link
                            href="/education"
                            className="block px-3 py-2 rounded-md text-base font-medium text-earth-600 hover:text-pine hover:bg-sand/30"
                        >
                            {t('navigation:education')}
                        </Link>

                        <div className="pt-4 pb-2 border-t border-sand mt-4">
                            {user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="block w-full text-center px-4 py-2 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-pine hover:bg-pine-800"
                                >
                                    {t('navigation:dashboard')}
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href={route('login')}
                                        className="block w-full text-center px-4 py-2 border border-pine text-pine rounded-full shadow-sm text-base font-medium bg-white hover:bg-sand/30"
                                    >
                                        {t('auth.login')}
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="block w-full text-center px-4 py-2 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-pine hover:bg-pine-800"
                                    >
                                        {t('navigation:start_investing')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
