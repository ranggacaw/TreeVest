import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';

interface PriceTableRow {
    month: number;
    price_cents: number;
}

interface Investment {
    id: number;
    user: { id: number; name: string };
    amount: number;
    status: string;
    purchase_date: string;
}

interface Lot {
    id: number;
    name: string;
    status: string;
    total_trees: number;
    base_price_per_tree_cents: number;
    current_price_per_tree_cents: number;
    monthly_increase_rate: number;
    cycle_months: number;
    last_investment_month: number;
    cycle_started_at: string | null;
    rack: {
        id: number;
        name: string;
        warehouse: {
            id: number;
            name: string;
            farm: { id: number; name: string };
        };
    };
    fruit_crop: { id: number; variety_name: string } | null;
    investments: Investment[];
    price_snapshots: { id: number; month: number; price_per_tree_cents: number }[];
}

interface Props {
    lot: Lot;
    priceTable: PriceTableRow[];
    currentCycleMonth: number;
}

export default function Show({ lot, priceTable, currentCycleMonth }: Props) {
    const farmName = lot.rack.warehouse.farm.name;
    const warehouseName = lot.rack.warehouse.name;

    return (
        <AppLayout>
            <Head title={`Lot: ${lot.name}`} />
            <div className="max-w-5xl mx-auto py-8 px-4">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href={route('farm-owner.lots.index')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back to Lots
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{lot.name}</h1>
                    <p className="text-sm text-gray-500">
                        {farmName} → {warehouseName} → {lot.rack.name}
                    </p>
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
                            {(lot.current_price_per_tree_cents / 100).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            })}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Cycle Month</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {currentCycleMonth} / {lot.cycle_months}
                        </p>
                    </div>
                </div>

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
                                                {(row.price_cents / 100).toLocaleString('id-ID')}
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
                                            <td className="px-4 py-2">{inv.user.name}</td>
                                            <td className="px-4 py-2">
                                                {(inv.amount / 100).toLocaleString('id-ID')}
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
