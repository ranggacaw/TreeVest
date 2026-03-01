import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, InvestmentDetail } from '@/types';

interface Props extends PageProps {
    investment: InvestmentDetail;
}

export default function Show({ auth, investment }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this investment?')) {
            destroy(`/investments/${investment.id}/cancel`);
        }
    };

    const statusColors = {
        pending_payment: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        matured: 'bg-blue-100 text-blue-800',
        sold: 'bg-purple-100 text-purple-800',
        cancelled: 'bg-red-100 text-red-800',
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
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
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
                                    href="/investments"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    ← Back to Investments
                                </Link>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">Investment Amount</h4>
                                <p className="text-3xl font-bold text-gray-900">{investment.formatted_amount}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Purchased on {new Date(investment.purchase_date).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">Tree Details</h4>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Tree ID</dt>
                                        <dd className="font-medium text-gray-900">#{investment.tree.identifier}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Expected ROI</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.expected_roi}%</dd>
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
                                    <div>
                                        <dt className="text-sm text-gray-500">Risk Rating</dt>
                                        <dd className="font-medium text-gray-900 capitalize">{investment.tree.risk_rating}</dd>
                                    </div>
                                </dl>
                            </div>

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
