import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { KycStatus, PageProps, User } from '@/types';
import { useTranslation } from 'react-i18next';

interface Props extends PageProps {
    auth: {
        user: User & { kyc_status: KycStatus };
    };
}

export default function Dashboard({ auth }: Props) {
    const { t } = useTranslation('investments');
    const needsKyc = auth.user?.kyc_status !== 'verified';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-text tracking-tight">
                            {t('dashboard_title')}
                        </h2>
                        <p className="text-sm text-textSecondary mt-1">{t('dashboard_subtitle')}</p>
                    </div>
                    {!needsKyc && (
                        <Link
                            href="/farms"
                            className="hidden sm:inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {t('new_investment')}
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={t('page_title')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {needsKyc && (
                        <div className="bg-warning-50 border border-warning-100 rounded-card p-6 md:p-8 shadow-card relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-warning-100 rounded-full opacity-50"></div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                    <svg className="h-8 w-8 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-text">
                                        {t('complete_kyc')}
                                    </h3>
                                    <p className="mt-2 text-textSecondary leading-relaxed max-w-3xl">
                                        {t('kyc_description')}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 mt-4 md:mt-0">
                                    <a
                                        href="/profile/kyc"
                                        className="inline-flex items-center px-6 py-3 bg-warning text-white rounded-xl font-bold hover:bg-warning-600 transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        {t('verify_identity_now')}
                                        <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card rounded-card p-6 shadow-card border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-textSecondary">{t('total_investment')}</p>
                                    <h4 className="text-3xl font-bold text-text mt-2">$0.00</h4>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-card p-6 shadow-card border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-textSecondary">{t('active_trees')}</p>
                                    <h4 className="text-3xl font-bold text-text mt-2">0</h4>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-durian flex items-center justify-center text-text">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v8" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-card p-6 shadow-card border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-textSecondary">{t('total_payouts')}</p>
                                    <h4 className="text-3xl font-bold text-text mt-2">$0.00</h4>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-alpukat flex items-center justify-center text-text">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Empty State / Main Content Area */}
                    <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
                        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-text mb-2">{t('no_investments_yet')}</h3>
                            <p className="text-textSecondary max-w-md mx-auto mb-8">
                                {t('no_investments_description')}
                            </p>
                            <Link
                                href="/farms"
                                className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm"
                            >
                                {t('browse_farms')}
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}