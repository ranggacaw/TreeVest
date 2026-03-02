import { Head, Link, usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface Farm {
    id: number;
    name: string;
    city: string;
    state: string;
}

interface Tree {
    id: number;
    tree_identifier: string;
    price_cents: number;
    expected_roi_percent: number;
    risk_rating: string;
    fruit_crop: {
        id: number;
        variant: string;
        farm: Farm;
    };
}

interface Transaction {
    id: number;
    amount_cents: number;
    currency: string;
    status: string;
    completed_at: string | null;
}

interface Payout {
    id: number;
    gross_amount_cents: number;
    platform_fee_cents: number;
    net_amount_cents: number;
    currency: string;
    status: string;
    created_at: string;
    completed_at: string | null;
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
    tree: Tree;
    transaction: Transaction | null;
    payouts: Payout[];
}

export default function Show() {
    const { investment } = usePage().props as unknown as { investment: Investment };

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
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAmount = (amountCents: number, currency: string) => {
        return `${currency} ${(amountCents / 100).toFixed(2)}`;
    };

    const totalPayouts = investment.payouts.reduce((sum, payout) => sum + payout.net_amount_cents, 0);

    return (
        <>
            <Head title="Investment Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Investment Details</h3>
                        <Link href={route('admin.investments.index')} className="text-indigo-600 hover:text-indigo-900">
                            Back to Investments
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Investment Info</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Investment ID</dt>
                                        <dd className="text-sm text-gray-900">{investment.id}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                        <dd className="text-sm text-gray-900">{formatAmount(investment.amount_cents, investment.currency)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(investment.status)}`}>
                                                {investment.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                                        <dd className="text-sm text-gray-900">{new Date(investment.purchase_date).toLocaleDateString()}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Total Payouts</dt>
                                        <dd className="text-sm text-gray-900">{formatAmount(totalPayouts, investment.currency)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Net Returns</dt>
                                        <dd className="text-sm text-gray-900">{formatAmount(totalPayouts - investment.amount_cents, investment.currency)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Investor</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="text-sm text-gray-900">{investment.user.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900">{investment.user.email}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                        <dd className="text-sm text-gray-900">{investment.user.phone || 'N/A'}</dd>
                                    </div>
                                </dl>
                                <div className="mt-4">
                                    <Link
                                        href={route('admin.users.show', investment.user.id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                    >
                                        View Investor Profile →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Tree Info</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Tree ID</dt>
                                        <dd className="text-sm text-gray-900">#{investment.tree.tree_identifier}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Crop</dt>
                                        <dd className="text-sm text-gray-900">{investment.tree.fruit_crop.variant}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Farm</dt>
                                        <dd className="text-sm text-gray-900">{investment.tree.fruit_crop.farm.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="text-sm text-gray-900">
                                            {investment.tree.fruit_crop.farm.city}, {investment.tree.fruit_crop.farm.state}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Expected ROI</dt>
                                        <dd className="text-sm text-gray-900">{investment.tree.expected_roi_percent}%</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Risk Rating</dt>
                                        <dd className="text-sm text-gray-900">{investment.tree.risk_rating}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {investment.transaction && (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 bg-white border-b border-gray-200">
                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Transaction</h4>
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                                            <dd className="text-sm text-gray-900">{investment.transaction.id}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                            <dd className="text-sm text-gray-900">{formatAmount(investment.transaction.amount_cents, investment.transaction.currency)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                                            <dd className="text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(investment.transaction.status)}`}>
                                                    {investment.transaction.status.toUpperCase()}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Completed</dt>
                                            <dd className="text-sm text-gray-900">
                                                {investment.transaction.completed_at
                                                    ? new Date(investment.transaction.completed_at).toLocaleString()
                                                    : 'N/A'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        )}

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg lg:col-span-3">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Payout History</h4>
                                {investment.payouts && investment.payouts.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {investment.payouts.map((payout) => (
                                                    <tr key={payout.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payout.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatAmount(payout.gross_amount_cents, payout.currency)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatAmount(payout.platform_fee_cents, payout.currency)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {formatAmount(payout.net_amount_cents, payout.currency)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payout.status)}`}>
                                                                {payout.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(payout.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payout.completed_at
                                                                ? new Date(payout.completed_at).toLocaleDateString()
                                                                : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No payouts yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
