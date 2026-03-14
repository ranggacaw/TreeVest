import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Lot, Investment } from '@/types';

interface PriceTableRow {
    month: number;
    price_idr: number;
}

interface Props {
    lot: Lot & { investments: Investment[]; price_snapshots: any[] };
    priceTable: PriceTableRow[];
    currentCycleMonth: number;
    monthlyRatePercentage: number;
}

export default function Show({ lot, priceTable, currentCycleMonth, monthlyRatePercentage }: Props) {
    const farmName = lot.rack?.warehouse?.farm?.name;
    const warehouseName = lot.rack?.warehouse?.name;

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this lot? This action cannot be undone.')) {
            router.delete(route('farm-owner.lots.destroy', lot.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Lot: ${lot.name}`} />
            <div className="max-w-5xl mx-auto py-8 px-4">
                {/* Breadcrumb */}
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <Link
                            href={route('farm-owner.lots.index')}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            ← Back to Lots
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-2">{lot.name}</h1>
                        <p className="text-sm text-gray-500">
                            {farmName} → {warehouseName} → {lot.rack?.name}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {lot.status === 'active' && (
                            <>
                                <Link
                                    href={route('farm-owner.lots.edit', lot.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status & Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{lot.status}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Trees</p>
                        <p className="text-lg font-semibold text-gray-900">{lot.total_trees}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Current Price/Tree</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {lot.current_price_per_tree_idr?.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            }) || '-'}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Cycle Month</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {currentCycleMonth} / {lot.cycle_months}
                        </p>
                    </div>
                </div>

                {/* Pricing Illustration */}
                {priceTable.length > 0 && (
                    <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-5">
                        <h2 className="text-base font-semibold text-blue-800 mb-3">Pricing Formula & Example</h2>
                        <div className="text-sm text-blue-900 space-y-3">
                            <div>
                                <p className="font-medium mb-1">Base Price: {priceTable[0]?.price_idr?.toLocaleString('id-ID')}</p>
                                <p className="font-medium mb-1">Monthly Increase Rate: {monthlyRatePercentage}%</p>
                            </div>
                            <div className="bg-white rounded p-3 border border-blue-200">
                                <p className="font-medium mb-2">Price Calculation Example:</p>
                                <div className="space-y-1 text-xs">
                                    <p>Month 1: {priceTable[0]?.price_idr?.toLocaleString('id-ID')} (base price)</p>
                                    {priceTable.slice(1, 6).map((row, idx) => (
                                        <p key={row.month}>
                                            Month {row.month}: {row.price_idr?.toLocaleString('id-ID')}
                                            <span className="text-blue-600 ml-2">
                                                (+{(((row.price_idr! - priceTable[idx].price_idr!) / priceTable[idx].price_idr!) * 100).toFixed(1)}%)
                                            </span>
                                        </p>
                                    ))}
                                    {priceTable.length > 6 && <p className="text-blue-600 italic">...and so on</p>}
                                </div>
                            </div>
                            <p className="text-xs text-blue-700 italic">
                                * Prices increase monthly by the rate shown. Investors who buy later pay more.
                            </p>
                        </div>
                    </div>
                )}

                {/* Price Table */}
                {priceTable.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Price Schedule</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price / Tree (IDR)</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {priceTable.map((row) => (
                                        <tr
                                            key={row.month}
                                            className={row.month === currentCycleMonth ? 'bg-green-50' : ''}
                                        >
                                            <td className="px-4 py-2">{row.month}</td>
                                            <td className="px-4 py-2">
                                                {row.price_idr?.toLocaleString('id-ID') || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-xs">
                                                {row.month === currentCycleMonth ? (
                                                    <span className="text-green-600 font-medium">Current</span>
                                                ) : row.month > currentCycleMonth ? (
                                                    <span className="text-gray-400">Upcoming</span>
                                                ) : (
                                                    <span className="text-gray-300">Past</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Investments */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        Investments ({lot.investments.length})
                    </h2>
                    {lot.investments.length === 0 ? (
                        <p className="text-sm text-gray-500">No investments yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount (IDR)</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lot.investments.map((inv) => (
                                        <tr key={inv.id}>
                                            <td className="px-4 py-2">{inv.investor?.name || 'Unknown'}</td>
                                            <td className="px-4 py-2">
                                                {inv.amount_idr?.toLocaleString('id-ID') || '-'}
                                            </td>
                                            <td className="px-4 py-2 capitalize">{inv.status}</td>
                                            <td className="px-4 py-2">{inv.purchase_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
