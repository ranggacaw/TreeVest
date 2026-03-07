import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, InvestmentDetail } from '@/types';
import { useEffect, useState } from 'react';
import FinancialErrorBoundary from '@/Components/FinancialErrorBoundary';
import { useTranslation } from 'react-i18next';

interface Props extends PageProps {
    investment: InvestmentDetail;
    is_local?: boolean;
}

export default function Confirmation({ auth, investment, is_local }: Props) {
    const { t } = useTranslation(['investments', 'translation']);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

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
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        processing: {
            title: t('processing_payment_title'),
            description: t('processing_payment_desc'),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        completed: {
            title: t('investment_confirmed_title'),
            description: t('investment_confirmed_desc'),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        failed: {
            title: t('payment_failed_title'),
            description: t('payment_failed_desc'),
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    };

    const status = statusMessages[paymentStatus];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('investment_confirmation')}
                </h2>
            }
        >
            <Head title={t('investment_confirmation')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-5">
                        <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            {t('back')}
                        </button>
                    </div>
                    <FinancialErrorBoundary context="investment-purchase-confirmation">
                        <div className={`overflow-hidden bg-white shadow-sm sm:rounded-lg ${status.bgColor}`}>
                            <div className="p-8 text-center">
                                <div className="mb-4">
                                    {paymentStatus === 'completed' ? (
                                        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : paymentStatus === 'processing' ? (
                                        <svg className="mx-auto h-16 w-16 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>

                                <h3 className={`text-2xl font-bold mb-2 ${status.color}`}>
                                    {status.title}
                                </h3>
                                <p className="text-gray-600 mb-8">
                                    {status.description}
                                </p>

                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4">{t('investment_details')}</h4>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">{t('investment_id')}</dt>
                                            <dd className="font-medium text-gray-900">#{investment.id}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">{t('amount')}</dt>
                                            <dd className="font-medium text-gray-900">{investment.formatted_amount}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">{t('tree')}</dt>
                                            <dd className="font-medium text-gray-900">#{investment.tree.identifier}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">{t('fruit_type')}</dt>
                                            <dd className="font-medium text-gray-900">{investment.tree.fruit_crop.fruit_type}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">{t('farm')}</dt>
                                            <dd className="font-medium text-gray-900">{investment.tree.farm.name}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">{t('date')}</dt>
                                            <dd className="font-medium text-gray-900">
                                                {new Date(investment.purchase_date).toLocaleDateString(t('common.date_locale', 'en-US'))}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="flex gap-4 justify-center">
                                    {paymentStatus === 'completed' ? (
                                        <>
                                            <Link
                                                href="/investments"
                                                className="px-6 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700"
                                            >
                                                {t('view_my_investments')}
                                            </Link>
                                            <Link
                                                href="/farms"
                                                className="px-6 py-2 border border-gray-300 rounded-md font-semibold text-sm text-gray-700 uppercase tracking-widest hover:bg-gray-50"
                                            >
                                                {t('continue_investing')}
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/payment-methods"
                                                className="px-6 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700"
                                            >
                                                {t('add_payment_method')}
                                            </Link>
                                            <Link
                                                href="/investments"
                                                className="px-6 py-2 border border-gray-300 rounded-md font-semibold text-sm text-gray-700 uppercase tracking-widest hover:bg-gray-50 bg-white"
                                            >
                                                {t('view_all_investments')}
                                            </Link>
                                            {is_local && (
                                                <Link
                                                    href={`/investments/${investment.id}/mock-confirm`}
                                                    method="post"
                                                    as="button"
                                                    className="px-6 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-purple-700"
                                                >
                                                    Simulate Payment Match
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FinancialErrorBoundary>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
