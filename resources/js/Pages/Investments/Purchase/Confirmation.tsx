import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, InvestmentDetail } from '@/types';
import { useEffect, useState } from 'react';
import FinancialErrorBoundary from '@/Components/FinancialErrorBoundary';
import { useTranslation } from 'react-i18next';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { 
    IconCheck, 
    IconX, 
    IconPlant, 
    IconTree, 
    IconMapPin, 
    IconCalendar, 
    IconDollar,
    IconArrowLeft
} from '@/Components/Icons/AppIcons';

interface Props extends PageProps {
    investment: InvestmentDetail;
    is_local?: boolean;
}

export default function Confirmation({ auth, investment, is_local }: Props) {
    const { t } = useTranslation(['investments', 'translation']);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
    const page = usePage();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

    useEffect(() => {
        if (investment.status === 'active') {
            setPaymentStatus('completed');
        } else if (investment.status === 'pending_payment') {
            const interval = setInterval(() => {
                setPaymentStatus('processing');
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [investment.status]);

    const statusMessages = {
        pending: {
            title: t('awaiting_payment_title'),
            description: t('awaiting_payment_desc'),
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-100',
            iconBg: 'bg-amber-100',
            icon: (
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        processing: {
            title: t('processing_payment_title'),
            description: t('processing_payment_desc'),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            iconBg: 'bg-blue-100',
            icon: (
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )
        },
        completed: {
            title: t('investment_confirmed_title'),
            description: t('investment_confirmed_desc'),
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            icon: <IconCheck className="w-8 h-8 text-emerald-600" />
        },
        failed: {
            title: t('payment_failed_title'),
            description: t('payment_failed_desc'),
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-100',
            iconBg: 'bg-red-100',
            icon: <IconX className="w-8 h-8 text-red-600" />
        },
    };

    const status = statusMessages[paymentStatus];

    return (
        <AppShellLayout>
            <Head title={t('investment_confirmation')} />
            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unreadCount} />

                    <FinancialErrorBoundary context="investment-purchase-confirmation">
                        <div className="px-5 pt-5 pb-6">
                            {/* Back Button (only if not completed) */}
                            {paymentStatus !== 'completed' && (
                                <div className="mb-4">
                                    <button 
                                        onClick={() => window.history.back()} 
                                        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        <IconArrowLeft className="w-4 h-4 mr-1" />
                                        {t('back')}
                                    </button>
                                </div>
                            )}

                            {/* Status Card */}
                            <div className={`p-6 rounded-3xl ${status.bgColor} border ${status.borderColor} text-center mb-6`}>
                                <div className={`w-16 h-16 rounded-full ${status.iconBg} flex items-center justify-center mx-auto mb-4`}>
                                    {status.icon}
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${status.color}`}>
                                    {status.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {status.description}
                                </p>
                            </div>

                            {/* Details Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                    <h4 className="text-sm font-bold text-gray-900">{t('investment_details')}</h4>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                                <span className="text-[10px] font-bold">ID</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{t('investment_id')}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">#{investment.id}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <IconDollar className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-gray-500">{t('amount')}</span>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600">{investment.formatted_amount}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <IconPlant className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-gray-500">{t('fruit_type')}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{investment.tree.fruit_crop.fruit_type}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                                <IconTree className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-gray-500">{t('tree')}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">#{investment.tree.identifier}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <IconMapPin className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-gray-500">{t('farm')}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{investment.tree.farm.name}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                                <IconCalendar className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-gray-500">{t('date')}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">
                                            {new Date(investment.purchase_date).toLocaleDateString(t('common.date_locale', 'en-US'))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                {paymentStatus === 'completed' ? (
                                    <>
                                        <Link
                                            href="/investments"
                                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all active:scale-[0.98]"
                                        >
                                            {t('view_my_investments')}
                                        </Link>
                                        <Link
                                            href="/farms"
                                            className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm text-center hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                                        >
                                            {t('continue_investing')}
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/payment-methods"
                                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all active:scale-[0.98]"
                                        >
                                            {t('add_payment_method')}
                                        </Link>
                                        <Link
                                            href="/investments"
                                            className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm text-center hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                                        >
                                            {t('view_all_investments')}
                                        </Link>
                                        {is_local && (
                                            <Link
                                                href={`/investments/${investment.id}/mock-confirm`}
                                                method="post"
                                                as="button"
                                                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-purple-300 transition-all active:scale-[0.98]"
                                            >
                                                Simulate Payment Match (Dev)
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </FinancialErrorBoundary>
                </div>
                <BottomNav activeTab="portfolio" />
            </div>
            <style>{`::-webkit-scrollbar { display: none; } * { -webkit-tap-highlight-color: transparent; }`}</style>
        </AppShellLayout>
    );
}