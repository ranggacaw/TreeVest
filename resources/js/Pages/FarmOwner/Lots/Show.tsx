import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Lot, Investment } from '@/types';
import { useState } from 'react';
import Modal from '@/Components/Modal';

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
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this lot? This action cannot be undone.')) {
            router.delete(route('farm-owner.lots.destroy', lot.id));
        }
    };

    const handleViewDetails = (investment: Investment) => {
        setSelectedInvestment(investment);
        setShowDetailsModal(true);
    };

    return (
        <AppLayout>
            <Head title={`Lot: ${lot.name}`} />
            <div className="max-w-7xl mx-auto py-8 px-4">
                {/* Breadcrumb */}
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Lots
                        </button>
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
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                                            <td className="px-4 py-2">{new Date(inv.purchase_date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => handleViewDetails(inv)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Investment Details Modal */}
                <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="2xl">
                    <div className="bg-white px-4 py-6 sm:p-6 sm:py-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Investment Details
                            </h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {selectedInvestment && (
                            <div className="space-y-4">
                                {/* Investor Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Investor Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Name</p>
                                            <p className="font-medium text-gray-900">{selectedInvestment.investor?.name || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900">{selectedInvestment.investor?.email || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{selectedInvestment.investor?.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">KYC Status</p>
                                            <p className="font-medium text-gray-900 capitalize">{selectedInvestment.investor?.kyc_status || 'pending'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Transaction Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Investment ID</p>
                                            <p className="font-medium text-gray-900">#{selectedInvestment.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <p className="font-medium text-gray-900 capitalize">{selectedInvestment.status}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Amount</p>
                                            <p className="font-medium text-gray-900">
                                                {selectedInvestment.amount_idr?.toLocaleString('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR',
                                                    maximumFractionDigits: 0,
                                                }) || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Quantity</p>
                                            <p className="font-medium text-gray-900">{selectedInvestment.quantity || 1}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Purchase Date</p>
                                            <p className="font-medium text-gray-900">{new Date(selectedInvestment.purchase_date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        {selectedInvestment.transaction?.stripe_payment_intent_id && (
                                            <div className="col-span-2">
                                                <p className="text-gray-500">Payment Intent ID</p>
                                                <p className="font-medium text-gray-900 font-mono text-xs">{selectedInvestment.transaction.stripe_payment_intent_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tree Information */}
                                {selectedInvestment.tree && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Tree Information</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Tree ID</p>
                                                <p className="font-medium text-gray-900">#{selectedInvestment.tree.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Identifier</p>
                                                <p className="font-medium text-gray-900">{selectedInvestment.tree.identifier}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Fruit Type</p>
                                                <p className="font-medium text-gray-900">{selectedInvestment.tree.fruit_type?.name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Variant</p>
                                                <p className="font-medium text-gray-900">{selectedInvestment.tree.fruit_crop?.variant || '-'}</p>
                                            </div>
                                            {selectedInvestment.tree.expected_roi && (
                                                <div>
                                                    <p className="text-gray-500">Expected ROI</p>
                                                    <p className="font-medium text-gray-900">{selectedInvestment.tree.expected_roi}%</p>
                                                </div>
                                            )}
                                            {selectedInvestment.tree.risk_rating && (
                                                <div>
                                                    <p className="text-gray-500">Risk Rating</p>
                                                    <p className="font-medium text-gray-900">{selectedInvestment.tree.risk_rating}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </AppLayout>
    );
}
