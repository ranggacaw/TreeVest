import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';

interface HarvestData {
    id: number;
    harvest_date: string;
    estimated_yield_kg: number;
    actual_yield_kg?: number | null;
    quality_grade?: string;
    notes?: string;
}

interface PayoutData {
    id: number;
    gross_amount_cents: number;
    gross_amount_formatted: string;
    platform_fee_cents: number;
    platform_fee_formatted: string;
    net_amount_cents: number;
    net_amount_formatted: string;
    status: string;
    status_label: string;
    currency: string;
    harvest?: {
        id: number;
        harvest_date: string;
    };
    completed_at?: string;
    failed_at?: string;
    failed_reason?: string;
}

interface InvestmentData {
    id: number;
    amount_cents: number;
    formatted_amount: string;
    status: string;
    status_label?: string;
    purchase_date: string;
    created_at?: string;
    current_value_cents: number;
    projected_return_cents: number;
    tree: {
        id: number;
        identifier: string;
        price_cents?: number;
        price_formatted?: string;
        expected_roi: number;
        risk_rating: string;
        age_years?: number;
        productive_lifespan_years?: number;
        status?: string;
        fruit_crop: {
            variant: string;
            fruit_type: {
                name: string;
            };
            harvest_cycle?: string;
            farm: {
                id: number;
                name: string;
                location?: string;
            };
        };
    };
    harvests?: {
        completed: HarvestData[];
        upcoming: HarvestData[];
    };
    payouts?: PayoutData[];
    transaction?: {
        id: number;
        status: string;
        stripe_payment_intent_id?: string;
    };
}

interface Props extends PageProps {
    investment: InvestmentData;
}

export default function Show({ auth, investment }: Props) {
    const { t } = useTranslation(['investments', 'translation']);
    const { delete: destroy, processing } = useForm();

    const handleCancel = () => {
        if (confirm(t('confirm_cancel_investment'))) {
            destroy(`/investments/${investment.id}/cancel`);
        }
    };

    const statusColors: Record<string, string> = {
        pending_payment: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        listed: 'bg-blue-100 text-blue-800',
        matured: 'bg-blue-100 text-blue-800',
        sold: 'bg-purple-100 text-purple-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const formatCurrency = (cents: number) => {
        return 'Rp ' + (cents / 100).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('investment_details')}
                </h2>
            }
        >
            <Head title={t('investment_number', { id: investment.id })} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <nav className="flex mb-6" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link href="/portfolio" className="text-sm text-gray-500 hover:text-gray-700">
                                    {t('navigation:portfolio')}
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-400">/</span>
                            </li>
                            <li>
                                <span className="text-sm text-gray-900 font-medium">
                                    {t('tree_number', { identifier: investment.tree.identifier })}
                                </span>
                            </li>
                            <li>
                                <span className="text-gray-400">/</span>
                            </li>
                            <li>
                                <span className="text-sm text-gray-500">{t('investment_details')}</span>
                            </li>
                        </ol>
                    </nav>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {t('investment_number', { id: investment.id })}
                                    </h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[investment.status]}`}>
                                        {investment.status_label}
                                    </span>
                                </div>
                                <Link
                                    href="/portfolio"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    {t('back_to_portfolio')}
                                </Link>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">{t('investment_summary')}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('amount_invested')}</dt>
                                        <dd className="text-xl font-bold text-gray-900">{investment.formatted_amount}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('current_value')}</dt>
                                        <dd className="text-xl font-bold text-gray-900">{formatCurrency(investment.current_value_cents)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('projected_return')}</dt>
                                        <dd className="text-xl font-bold text-gray-900">{formatCurrency(investment.projected_return_cents)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('purchased')}</dt>
                                        <dd className="text-xl font-bold text-gray-900">
                                            {new Date(investment.purchase_date).toLocaleDateString(t('common.date_locale', 'en-US'))}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">{t('tree_details')}</h4>
                                <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('tree_id')}</dt>
                                        <dd className="font-medium text-gray-900">#{investment.tree.identifier}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('tree_status')}</dt>
                                        <dd className="font-medium text-gray-900 capitalize">{investment.tree.status}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('age')}</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.age_years} {t('years')}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('expected_roi', { roi: '' }).replace('%', '').trim()}</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.expected_roi}%</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('risk_rating')}</dt>
                                        <dd className="font-medium text-gray-900 capitalize">{investment.tree.risk_rating}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('harvest_cycle')}</dt>
                                        <dd className="font-medium text-gray-900 capitalize">{investment.tree.fruit_crop.harvest_cycle}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('fruit_type')}</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.fruit_crop.fruit_type.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('variant')}</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.fruit_crop.variant}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('farm')}</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.fruit_crop.farm.name}</dd>
                                    </div>
                                </dl>
                                <div className="mt-4">
                                    <Link
                                        href={`/farms/${investment.tree.fruit_crop.farm.id}`}
                                        className="text-sm text-green-600 hover:text-green-700"
                                    >
                                        {t('view_full_farm_details')}
                                    </Link>
                                </div>
                            </div>

                            {investment.harvests && (
                                <>
                                    {investment.harvests.completed.length > 0 && (
                                        <div className="border-t border-gray-200 mt-6 pt-6">
                                            <h4 className="text-sm font-medium text-gray-500 mb-4">{t('harvest_history')}</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('est_yield')}</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actual_yield')}</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('quality')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {investment.harvests.completed.map((harvest) => (
                                                            <tr key={harvest.id}>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {new Date(harvest.harvest_date).toLocaleDateString(t('common.date_locale', 'en-US'))}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{harvest.estimated_yield_kg}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{harvest.actual_yield_kg ?? '-'}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{harvest.quality_grade ?? '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {investment.harvests.upcoming.length > 0 && (
                                        <div className="border-t border-gray-200 mt-6 pt-6">
                                            <h4 className="text-sm font-medium text-gray-500 mb-4">{t('upcoming_harvests')}</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('est_yield')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {investment.harvests.upcoming.map((harvest) => (
                                                            <tr key={harvest.id}>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {new Date(harvest.harvest_date).toLocaleDateString(t('common.date_locale', 'en-US'))}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">{harvest.estimated_yield_kg}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {investment.payouts && investment.payouts.length > 0 && (
                                <div className="border-t border-gray-200 mt-6 pt-6">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4">{t('payout_history')}</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('harvest_date')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('gross_amount')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('platform_fee')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('net_amount')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tree_status')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {investment.payouts.map((payout) => (
                                                    <tr key={payout.id}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {payout.harvest
                                                                ? new Date(payout.harvest.harvest_date).toLocaleDateString(t('common.date_locale', 'en-US'))
                                                                : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{payout.gross_amount_formatted}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{payout.platform_fee_formatted}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{payout.net_amount_formatted}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                payout.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                    payout.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {payout.status_label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {investment.status === 'pending_payment' && (
                                <div className="border-t border-gray-200 mt-6 pt-6">
                                    <button
                                        onClick={handleCancel}
                                        disabled={processing}
                                        className="w-full sm:w-auto px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {processing ? t('cancelling') : t('cancel_investment')}
                                    </button>
                                </div>
                            )}

                            {investment.status === 'active' && (
                                <div className="border-t border-gray-200 mt-6 pt-6">
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/investments/${investment.id}/top-up`}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                                        >
                                            {t('top_up_investment')}
                                        </Link>
                                        <Link
                                            href={`/secondary-market/create?investment_id=${investment.id}`}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
                                        >
                                            {t('list_for_sale')}
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {investment.status === 'listed' && (
                                <div className="border-t border-gray-200 mt-6 pt-6">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
                                        <p className="text-sm text-blue-800">
                                            {t('listed_for_sale_message')}
                                        </p>
                                    </div>
                                    <Link
                                        href="/secondary-market"
                                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                    >
                                        {t('view_listings')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
