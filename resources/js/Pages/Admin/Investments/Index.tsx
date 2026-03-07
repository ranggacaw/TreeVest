import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Farm {
    id: number;
    name: string;
}

interface Investment {
    id: number;
    user_id: number;
    tree_id: number;
    amount_cents: number;
    currency: string;
    purchase_date: string;
    status: string;
    created_at: string;
    user: User;
}

interface Tree {
    id: number;
    fruit_crop: {
        farm: Farm;
    };
}

interface InvestmentsData {
    data: Investment[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    status?: string;
    farm_id?: string;
    search?: string;
}

interface Props {
    investments: InvestmentsData;
    farms: Farm[];
    filters: Filters;
}

export default function Index({ investments, farms, filters }: Props) {
    const { t } = useTranslation('admin');
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending_payment':
                return 'bg-yellow-100 text-yellow-800';
            case 'matured':
                return 'bg-blue-100 text-blue-800';
            case 'sold':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAmount = (amountCents: number, currency: string) => {
        return `${currency} ${(amountCents / 100).toFixed(2)}`;
    };

    return (
        <AppLayout title={t('investments.title')}>
            <Head title={t('investments.title')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{t('investments.title')}</h3>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form method="get" className="mb-6 flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder={t('investments.search_placeholder')}
                                        defaultValue={filters.search}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <select
                                    name="farm_id"
                                    defaultValue={filters.farm_id}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">{t('farms.all_farms')}</option>
                                    {farms.map((farm) => (
                                        <option key={farm.id} value={farm.id}>
                                            {farm.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="status"
                                    defaultValue={filters.status}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">{t('common.all_status', 'All Status')}</option>
                                    <option value="pending_payment">{t('investments.pending_payment')}</option>
                                    <option value="active">{t('investments.active')}</option>
                                    <option value="matured">{t('investments.matured')}</option>
                                    <option value="sold">{t('investments.sold')}</option>
                                    <option value="cancelled">{t('investments.cancelled')}</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    {t('common.filter')}
                                </button>
                            </form>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('investments.investor')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('investments.amount')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('investments.tree')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.date')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {investments.data.map((investment) => (
                                        <tr key={investment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{investment.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="text-gray-900">{investment.user.name}</div>
                                                <div className="text-gray-500 text-xs">{investment.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatAmount(investment.amount_cents, investment.currency)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('investments.tree_id', { id: investment.tree_id })}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(investment.status)}`}>
                                                    {t(`admin.investments.${investment.status}`, investment.status.replace('_', ' ').toUpperCase())}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(investment.purchase_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('admin.investments.show', investment.id)} className="text-indigo-600 hover:text-indigo-900">{t('common.view')}</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {investments.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {t('investments.no_investments')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {investments.last_page > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <div className="flex gap-2">
                                        {investments.current_page > 1 && (
                                            <Link
                                                href={route('admin.investments.index', { page: investments.current_page - 1, ...filters })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                {t('common.previous')}
                                            </Link>
                                        )}
                                        <span className="px-3 py-1 text-gray-700">
                                            {t('common.page')} {investments.current_page} {t('common.of')} {investments.last_page}
                                        </span>
                                        {investments.current_page < investments.last_page && (
                                            <Link
                                                href={route('admin.investments.index', { page: investments.current_page + 1, ...filters })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                {t('common.next')}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
