import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, Harvest, Payout } from '@/types';

interface Props extends PageProps {
    harvest: Harvest;
}

function formatCurrency(idr: number): string {
    return 'Rp ' + (idr).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Show({ harvest }: Props) {
    const statusColors: Record<string, string> = {
        scheduled: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };

    const handleStartHarvest = () => {
        if (confirm('Are you sure you want to start this harvest?')) {
            router.post(route('farm-owner.harvests.start', harvest.id));
        }
    };

    const handleConfirm = () => {
        if (confirm('Are you sure you want to confirm this harvest and calculate payouts?')) {
            router.post(route('farm-owner.harvests.confirm', harvest.id));
        }
    };

    const handleFail = () => {
        const notes = prompt('Reason for harvest failure:');
        if (notes) {
            router.post(route('farm-owner.harvests.fail', harvest.id), { notes });
        }
    };

    return (
        <AppLayout title="Harvest Details">
            <Head title={`Harvest #${harvest.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link
                                href={route('farm-owner.harvests.index')}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                &larr; Back to My Harvests
                            </Link>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                Harvest #{harvest.id}
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            {harvest.status === 'scheduled' && (
                                <button
                                    onClick={handleStartHarvest}
                                    className="px-4 py-2 rounded bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700"
                                >
                                    Start Harvest
                                </button>
                            )}
                            {harvest.status === 'in_progress' && (
                                <button
                                    onClick={handleConfirm}
                                    className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                                >
                                    Confirm Complete
                                </button>
                            )}
                            {(harvest.status === 'scheduled' || harvest.status === 'in_progress') && (
                                <button
                                    onClick={handleFail}
                                    className="px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                                >
                                    Mark as Failed
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Harvest Overview */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Overview</h3>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Status</dt>
                                    <dd>
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[harvest.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                            {harvest.status.replace('_', ' ')}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Scheduled Date</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {new Date(harvest.scheduled_date).toLocaleDateString('id-ID')}
                                    </dd>
                                </div>
                                {harvest.completed_at && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Completed Date</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {new Date(harvest.completed_at).toLocaleDateString('id-ID')}
                                        </dd>
                                    </div>
                                )}
                                {harvest.failed_at && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Failed Date</dt>
                                        <dd className="text-sm font-medium text-red-700">
                                            {new Date(harvest.failed_at).toLocaleDateString('id-ID')}
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm text-gray-500">Estimated Yield</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {harvest.estimated_yield_kg ?? 'N/A'} kg
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Actual Yield</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {harvest.actual_yield_kg !== null
                                            ? `${harvest.actual_yield_kg} kg`
                                            : 'Not yet recorded'}
                                    </dd>
                                </div>
                                {harvest.quality_grade && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Quality Grade</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                                                Grade {harvest.quality_grade}
                                            </span>
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm text-gray-500">Platform Fee Rate</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {(harvest.platform_fee_rate * 100).toFixed(2)}%
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Tree Information */}
                        {harvest.tree && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tree Information</h3>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Tree ID</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {harvest.tree.tree_identifier}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Price</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {formatCurrency(harvest.tree.price_idr)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Expected ROI</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {harvest.tree.expected_roi_percent.toFixed(2)}%
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Risk Rating</dt>
                                        <dd className="text-sm font-medium text-gray-900 capitalize">
                                            {harvest.tree.risk_rating}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {/* Market Price */}
                        {harvest.market_price && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Price</h3>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Price per kg</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {formatCurrency(harvest.market_price.price_per_kg_idr)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Currency</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {harvest.market_price.currency}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Effective Date</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {new Date(harvest.market_price.effective_date).toLocaleDateString('id-ID')}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {/* Confirmed By */}
                        {harvest.confirmed_by_user && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmation</h3>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Confirmed By</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {harvest.confirmed_by_user.name}
                                        </dd>
                                    </div>
                                    {harvest.confirmed_at && (
                                        <div>
                                            <dt className="text-sm text-gray-500">Confirmed At</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {new Date(harvest.confirmed_at).toLocaleString('id-ID')}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {/* Notes */}
                        {harvest.notes && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                                <p className="text-sm text-gray-700">{harvest.notes}</p>
                            </div>
                        )}

                        {/* Payouts */}
                        {harvest.payouts && harvest.payouts.length > 0 && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Investor Payouts ({harvest.payouts.length})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Investor
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Gross Amount
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Platform Fee
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Net Amount
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {harvest.payouts.map((payout: Payout) => (
                                                <tr key={payout.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {payout.investor?.name ?? 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                                                        {payout.gross_amount_formatted}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                                                        {payout.platform_fee_formatted}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                        {payout.net_amount_formatted}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${payout.status === 'completed'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : payout.status === 'processing'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : payout.status === 'failed'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {payout.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
