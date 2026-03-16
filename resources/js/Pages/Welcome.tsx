import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }: PageProps) {
    const { t } = useTranslation('welcome');
    
    return (
        <>
            <Head title={t('title')} />
            <div className="min-h-screen bg-bg font-sans text-text selection:bg-primary-100 selection:text-primary-700">
                {/* Navigation */}
                <nav className="absolute top-0 left-0 right-0 z-10 px-6 py-6 lg:px-12 flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        {/* Treevest Logo */}
                        <ApplicationLogo className="w-10 h-10 fill-current text-primary" />
                        <span className="text-xl font-bold tracking-tight text-text">Treevest</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/farms" className="hidden md:block font-medium text-text hover:text-primary transition-colors">
                            {t('explore_farms')}
                        </Link>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-sm active:scale-95"
                            >
                                {t('dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden md:block font-medium text-text hover:text-primary transition-colors"
                                >
                                    {t('log_in')}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-5 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-sm active:scale-95"
                                >
                                    {t('start_investing')}
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 overflow-hidden bg-primary-50">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                        {/* Left Column: Text */}
                        <div className="max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-primary-700 font-medium text-sm mb-6 shadow-sm border border-primary-100">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                {t('hero_badge')}
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-text leading-tight mb-6">
                                {t('hero_title')} <br />
                                <span className="text-primary">{t('hero_title_highlight')}</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-textSecondary mb-10 leading-relaxed">
                                {t('hero_desc')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/register"
                                    className="px-8 py-4 rounded-full bg-primary text-white font-bold text-center text-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 transform hover:-translate-y-1"
                                >
                                    {t('view_available_trees')}
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="px-8 py-4 rounded-full bg-white border border-gray-200 text-text font-semibold text-center text-lg hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    {t('how_it_works')}
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Imagery */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-durian rounded-[3rem] transform rotate-3 scale-105 opacity-50"></div>
                            <div className="relative h-[500px] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-card border-4 border-white z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1661371134495-b0392006b52d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lush fruit tree orchard at golden hour"
                                    className="w-full h-full object-cover"
                                />
                                {/* Floating stats card */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-floating border border-white/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-textSecondary mb-1">{t('expected_roi')}</p>
                                            <p className="text-2xl font-bold text-primary">{t('expected_roi_val')} <span className="text-sm font-normal text-textSecondary">{t('expected_roi_unit')}</span></p>
                                        </div>
                                        <div className="h-10 w-[1px] bg-gray-200"></div>
                                        <div>
                                            <p className="text-sm font-medium text-textSecondary mb-1">{t('backed_by')}</p>
                                            <p className="text-2xl font-bold text-text">{t('real_assets')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>

                {/* Features Section */}
                <section id="how-it-works" className="bg-white py-24 px-6 lg:px-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">{t('features_title')}</h2>
                            <p className="text-lg text-textSecondary max-w-2xl mx-auto">{t('features_desc')}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-primary-50 p-8 rounded-card border border-primary-100 transition-transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-white text-primary rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-text mb-3">{t('f1_title')}</h3>
                                <p className="text-textSecondary leading-relaxed">{t('f1_desc')}</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-alpukat p-8 rounded-card border border-orange-100 transition-transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-white text-warning rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-text mb-3">{t('f2_title')}</h3>
                                <p className="text-textSecondary leading-relaxed">{t('f2_desc')}</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-mangga p-8 rounded-card border border-blue-100 transition-transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-white text-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-text mb-3">{t('f3_title')}</h3>
                                <p className="text-textSecondary leading-relaxed">{t('f3_desc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-text text-gray-400 py-12 px-6 lg:px-12 text-center">
                    <p className="mb-2">{t('footer_copyright')}</p>
                    <p className="text-sm text-gray-600">{t('footer_disclaimer')}</p>
                </footer>
            </div>
        </>
    );
}
