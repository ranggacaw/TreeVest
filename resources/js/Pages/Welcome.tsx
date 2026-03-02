import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Invest in Nature's Growth | Treevest" />
            <div className="min-h-screen bg-sand font-sans text-pine-800 selection:bg-sun selection:text-pine-900">
                {/* Navigation */}
                <nav className="absolute top-0 left-0 right-0 z-10 px-6 py-6 lg:px-12 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* Treevest Logo/Icon */}
                        <div className="w-10 h-10 bg-pine rounded-xl flex items-center justify-center shadow-soft">
                            <svg className="w-6 h-6 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v8" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-pine-800">Treevest</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/farms" className="hidden md:block font-medium text-pine-800 hover:text-sun transition-colors">
                            Explore Farms
                        </Link>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 rounded-full bg-pine text-sand font-semibold hover:bg-pine-800 transition-all shadow-card"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden md:block font-medium text-pine-800 hover:text-sun transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-5 py-2.5 rounded-full bg-pine text-sand font-semibold hover:bg-pine-800 transition-all shadow-card"
                                >
                                    Start Investing
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                        {/* Left Column: Text */}
                        <div className="max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 text-pine-500 font-medium text-sm mb-6">
                                <span className="w-2 h-2 rounded-full bg-sun"></span>
                                Now open for Durian & Mango investments
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-pine-800 leading-tight mb-6">
                                Invest in roots. <br />
                                <span className="text-earth">Harvest returns.</span>
                            </h1>
                            <p className="text-lg lg:text-xl text-pine-500/80 mb-10 leading-relaxed">
                                Back verified agricultural farms by investing in individual fruit trees. Track their growth, and earn returns based on actual harvests. A tangible asset for your portfolio.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/register"
                                    className="px-8 py-4 rounded-full bg-sun text-pine-900 font-bold text-center text-lg hover:bg-yellow-500 transition-all shadow-card transform hover:-translate-y-1"
                                >
                                    View Available Trees
                                </Link>
                                <a
                                    href="#how-it-works"
                                    className="px-8 py-4 rounded-full bg-sand-100 border border-pine-200 text-pine-800 font-semibold text-center text-lg hover:bg-sand-200 transition-all"
                                >
                                    How it works
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Imagery */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-sage-200 rounded-[3rem] transform rotate-3 scale-105 opacity-50"></div>
                            <div className="relative h-[500px] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-soft border-4 border-white z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1661371134495-b0392006b52d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Lush fruit tree orchard at golden hour"
                                    className="w-full h-full object-cover"
                                />
                                {/* Floating stats card */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-card border border-white/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-pine-500 mb-1">Expected ROI</p>
                                            <p className="text-2xl font-bold text-pine-800">12% - 18% <span className="text-sm font-normal text-pine-500">/ yr</span></p>
                                        </div>
                                        <div className="h-10 w-[1px] bg-pine-200"></div>
                                        <div>
                                            <p className="text-sm font-medium text-pine-500 mb-1">Backed by</p>
                                            <p className="text-2xl font-bold text-pine-800">Real Assets</p>
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
                            <h2 className="text-3xl lg:text-4xl font-bold text-pine-800 mb-4">Cultivating wealth, naturally.</h2>
                            <p className="text-lg text-pine-500 max-w-2xl mx-auto">Unlike traditional stocks, your investment grows in the soil. We connect you directly with verified farm partners.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-sand-100 p-8 rounded-3xl transition-transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-earth-100 text-earth rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-pine-800 mb-3">Verified Farms</h3>
                                <p className="text-pine-500">Every partner farm undergoes strict KYC and site inspections before listing their crops.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-sand-100 p-8 rounded-3xl transition-transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-sage-100 text-sage-800 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-pine-800 mb-3">Track Growth</h3>
                                <p className="text-pine-500">Get regular health updates, photos, and weather reports right on your dashboard.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-sand-100 p-8 rounded-3xl transition-transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-sun-100 text-sun-500 rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-pine-800 mb-3">Earn Dividends</h3>
                                <p className="text-pine-500">When the trees are harvested and fruits are sold, you receive your share of the profits.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-pine-900 text-sand-200 py-12 px-6 lg:px-12 text-center">
                    <p className="mb-2">© 2026 Treevest. All rights reserved.</p>
                    <p className="text-sm text-pine-500">Agricultural investments carry inherent risks. Please read our risk disclosure.</p>
                </footer>
            </div>
        </>
    );
}