import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler } from 'react';
import { Lot, Investment } from '@/types';

interface PriceTableRow {
    month: number;
    price_cents: number;
}

interface Props {
    lot: Lot;
    priceTable: PriceTableRow[];
    currentCycleMonth: number;
    myInvestment: Investment | null;
    isInvestmentOpen: boolean;
}

function formatIDR(amount: number) {
    return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function Show({ lot, priceTable, currentCycleMonth, myInvestment, isInvestmentOpen }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        trees: '1',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('investor.lots.invest', lot.id));
    };

    return (
        <AppLayout>
            <Head title={`Invest in ${lot.name}`} />
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href={route('farms.show', lot.rack?.warehouse?.farm?.id || 0)} className="text-sm text-gray-500 hover:text-gray-700">
                        ← {lot.rack?.warehouse?.farm?.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{lot.name}</h1>
                    {lot.fruit_crop && <p className="text-sm text-gray-500">{lot.fruit_crop.variant}</p>}
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                        <p className="text-lg font-semibold capitalize">{lot.status.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Current Price/Tree</p>
                        <p className="text-lg font-semibold">{formatIDR(lot.current_price_per_tree_cents)}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Cycle Progress</p>
                        <p className="text-lg font-semibold">{currentCycleMonth} / {lot.cycle_months} mo</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Trees</p>
                        <p className="text-lg font-semibold">{lot.total_trees}</p>
                    </div>
                </div>

                {/* Price schedule */}
                {priceTable.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-base font-semibold text-gray-800 mb-3">Price Schedule</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price / Tree</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {priceTable.map((row) => (
                                        <tr key={row.month} className={row.month === currentCycleMonth ? 'bg-green-50' : ''}>
                                            <td className="px-4 py-2">
                                                {row.month}
                                                {row.month === currentCycleMonth && (
                                                    <span className="ml-2 text-xs text-green-600 font-medium">Current</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">{formatIDR(row.price_cents)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* My existing investment */}
                {myInvestment && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-800">You already hold an investment in this lot</p>
                        <p className="text-xs text-blue-600 mt-1">Amount: {formatIDR(myInvestment.amount_cents)} — Status: {myInvestment.status}</p>
                    </div>
                )}

                {/* Invest CTA */}
                {isInvestmentOpen && (
                    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-5">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Invest Now</h2>
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Trees</label>
                                <input
                                    type="number" min="1" max={lot.total_trees}
                                    className="w-full border-gray-300 rounded-md text-sm"
                                    value={data.trees}
                                    onChange={(e) => setData('trees', e.target.value)}
                                />
                                {errors.trees && <p className="text-red-500 text-xs mt-1">{errors.trees}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                                Invest
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Total: {formatIDR(Number(data.trees || 0) * lot.current_price_per_tree_cents)}
                        </p>
                    </form>
                )}

                {!isInvestmentOpen && !myInvestment && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        Investment window is closed for this lot.
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
