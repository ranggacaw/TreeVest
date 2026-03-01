import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Investment } from '@/types';

interface Props extends PageProps {
    investments: Investment[];
    total_value_cents: number;
    total_value_formatted: string;
}

export default function Index({ auth, investments, total_value_cents, total_value_formatted }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Investments
                </h2>
            }
        >
            <Head title="My Investments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Investment Value</p>
                                    <p className="text-3xl font-bold text-gray-900">{total_value_formatted}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Investments</p>
                                    <p className="text-3xl font-bold text-gray-900">{investments.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {investments.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">You haven't made any investments yet.</p>
                                    <Link
                                        href="/farms"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                                    >
                                        Browse Fruit Trees
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {investments.map((investment) => (
                                        <Link
                                            key={investment.id}
                                            href={`/investments/${investment.id}`}
                                            className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        Tree #{investment.tree.identifier}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {investment.tree.expected_roi}% expected ROI
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {investment.formatted_amount}
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        investment.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        investment.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                                                        investment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {investment.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
