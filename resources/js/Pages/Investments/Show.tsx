import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface HarvestData {
    id: number;
    harvest_date: string;
    estimated_yield_kg: number;
    actual_yield_kg?: number | null;
    quality_grade?: string;
    notes?: string;
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
            fruit_type: string;
            harvest_cycle?: string;
        };
        farm: {
            name: string;
            location?: string;
        };
    };
    harvests?: {
        completed: HarvestData[];
        upcoming: HarvestData[];
    };
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
    const { delete: destroy, processing } = useForm();

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this investment?')) {
            destroy(`/investments/${investment.id}/cancel`);
        }
    };

    const statusColors: Record<string, string> = {
        pending_payment: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        matured: 'bg-blue-100 text-blue-800',
        sold: 'bg-purple-100 text-purple-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const formatCurrency = (cents: number) => {
        return 'RM ' + (cents / 100).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Investment Details
                </h2>
            }
        >
            <Head title={`Investment #${investment.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <nav className="flex mb-6" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link href="/portfolio" className="text-sm text-gray-500 hover:text-gray-700">
                                    Portfolio
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-400">/</span>
                            </li>
                            <li>
                                <span className="text-sm text-gray-900 font-medium">
                                    Tree #{investment.tree.identifier}
                                </span>
                            </li>
                            <li>
                                <span className="text-gray-400">/</span>
                            </li>
                            <li>
                                <span className="text-sm text-gray-500">Investment Details</span>
                            </li>
                        </ol>
                    </nav>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Investment #{investment.id}
                                    </h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[investment.status]}`}>
                                        {investment.status_label}
                                    </span>
                                </div>
                                <Link
                                    href="/portfolio"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    ← Back to Portfolio
                                </Link>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">Investment Summary</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Amount Invested</dt>
                                        <dd className="text-xl font-bold text-gray-900">{investment.formatted_amount}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Current Value</dt>
                                        <dd className="text-xl font-bold text-gray-900">{formatCurrency(investment.current_value_cents)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Projected Return</dt>
                                        <dd className="text-xl font-bold text-gray-900">{formatCurrency(investment.projected_return_cents)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Purchased</dt>
                                        <dd className="text-xl font-bold text-gray-900">
                                            {new Date(investment.purchase_date).toLocaleDateString('en-MY')}
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">Tree Details</h4>
                                <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Tree ID</dt>
                                        <dd className="font-medium text-gray-900">#{investment.tree.identifier}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Status</dt>
                                        <dd className="font-medium text-gray-900 capitalize">{investment.tree.status}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Age</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.age_years} years</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Expected ROI</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.expected_roi}%</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Risk Rating</dt>
                                        <dd className="font-medium text-gray-900 capitalize">{investment.tree.risk_rating}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Harvest Cycle</dt>
                                        <dd className="font-medium text-gray-900 capitalize">{investment.tree.fruit_crop.harvest_cycle}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Fruit Type</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.fruit_crop.fruit_type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Variant</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.fruit_crop.variant}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Farm</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.farm.name}</dd>
                                    </div>
                                </dl>
                                <div className="mt-4">
                                    <Link
                                        href={`/farms/${investment.tree.id}`}
                                        className="text-sm text-green-600 hover:text-green-700"
                                    >
                                        View Full Tree Details →
                                    </Link>
                                </div>
                            </div>

                            {investment.harvests && (
                                <>
                                    {investment.harvests.completed.length > 0 && (
                                        <div className="border-t border-gray-200 mt-6 pt-6">
                                            <h4 className="text-sm font-medium text-gray-500 mb-4">Harvest History</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Yield (kg)</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Yield (kg)</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {investment.harvests.completed.map((harvest) => (
                                                            <tr key={harvest.id}>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {new Date(harvest.harvest_date).toLocaleDateString('en-MY')}
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
                                            <h4 className="text-sm font-medium text-gray-500 mb-4">Upcoming Harvests</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Yield (kg)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {investment.harvests.upcoming.map((harvest) => (
                                                            <tr key={harvest.id}>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {new Date(harvest.harvest_date).toLocaleDateString('en-MY')}
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

                            {investment.status === 'pending_payment' && (
                                <div className="border-t border-gray-200 mt-6 pt-6">
                                    <button
                                        onClick={handleCancel}
                                        disabled={processing}
                                        className="w-full sm:w-auto px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Cancelling...' : 'Cancel Investment'}
                                    </button>
                                </div>
                            )}

                            {investment.status === 'active' && (
                                <div className="border-t border-gray-200 mt-6 pt-6">
                                    <Link
                                        href={`/investments/${investment.id}/top-up`}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                                    >
                                        Top Up Investment
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
