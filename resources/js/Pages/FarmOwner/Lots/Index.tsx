import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Lot, PaginatedLots } from '@/types';

interface Props {
    lots: PaginatedLots;
}

export default function Index({ lots }: Props) {
    return (
        <AppLayout>
            <Head title="My Lots" />
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Lots</h1>
                    <Link
                        href={route('farm-owner.lots.create')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    >
                        Create Lot
                    </Link>
                </div>

                {lots.data.length === 0 ? (
                    <p className="text-gray-500">No lots yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Farm / Rack</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trees</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/Tree</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cycle</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {lots.data.map((lot) => (
                                    <tr key={lot.id}>
                                        <td className="px-4 py-2 font-medium">{lot.name}</td>
                                        <td className="px-4 py-2 text-gray-500">
                                            {lot.rack?.warehouse?.farm?.name} / {lot.rack?.warehouse?.name} / {lot.rack?.name}
                                        </td>
                                        <td className="px-4 py-2 capitalize">
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{lot.status}</span>
                                        </td>
                                        <td className="px-4 py-2">{lot.total_trees}</td>
                                        <td className="px-4 py-2">
                                            {lot.current_price_per_tree_idr?.toLocaleString('id-ID', {
                                                style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
                                            }) || '-'}
                                        </td>
                                        <td className="px-4 py-2">{lot.cycle_months} mo</td>
                                        <td className="px-4 py-2">
                                            <Link
                                                href={route('farm-owner.lots.show', lot.id)}
                                                className="text-green-600 hover:underline text-xs mr-3"
                                            >
                                                View
                                            </Link>
                                            {lot.status === 'active' && (
                                                <Link
                                                    href={route('farm-owner.lots.edit', lot.id)}
                                                    className="text-blue-600 hover:underline text-xs"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
