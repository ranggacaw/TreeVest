import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler, useState } from 'react';

interface WalletTransaction {
    id: number;
    transaction_type: string;
    amount_idr: number;
    description: string | null;
    created_at: string;
}

interface Wallet {
    id: number;
    balance_idr: number;
    currency: string;
}

interface Props {
    wallet: Wallet | null;
    transactions: WalletTransaction[];
}

function formatIDR(amount: number) {
    return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function Index({ wallet, transactions }: Props) {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount_idr: '',
    });

    const submitWithdraw: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('investor.wallet.withdraw'), {
            onSuccess: () => { reset(); setShowWithdrawModal(false); },
        });
    };

    return (
        <AppLayout>
            <Head title="My Wallet" />
            <div className="max-w-3xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wallet</h1>

                {/* Balance card */}
                <div className="bg-green-600 text-white rounded-xl p-6 mb-6">
                    <p className="text-sm opacity-80 mb-1">Available Balance</p>
                    <p className="text-4xl font-bold">{formatIDR(wallet?.balance_idr ?? 0)}</p>
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="px-4 py-2 bg-white text-green-700 rounded-md text-sm font-medium hover:bg-green-50"
                        >
                            Withdraw
                        </button>
                    </div>
                </div>

                {/* Transactions */}
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Transaction History</h2>
                {transactions.length === 0 ? (
                    <p className="text-sm text-gray-500">No transactions yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center px-4 py-3 bg-white">
                                <div>
                                    <p className="text-sm font-medium text-gray-800 capitalize">
                                        {tx.transaction_type.replace(/_/g, ' ')}
                                    </p>
                                    {tx.description && <p className="text-xs text-gray-500">{tx.description}</p>}
                                    <p className="text-xs text-gray-400">{tx.created_at}</p>
                                </div>
                                <span className={`text-sm font-semibold ${tx.amount_idr >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {tx.amount_idr >= 0 ? '+' : ''}{formatIDR(tx.amount_idr)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Withdraw Modal */}
                {showWithdrawModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
                            <form onSubmit={submitWithdraw} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (IDR)</label>
                                    <input
                                        type="number" min="1000"
                                        className="w-full border-gray-300 rounded-md text-sm"
                                        value={data.amount_idr}
                                        onChange={(e) => setData('amount_idr', e.target.value)}
                                        placeholder="Minimum 1000"
                                    />
                                    {errors.amount_idr && <p className="text-red-500 text-xs mt-1">{errors.amount_idr}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowWithdrawModal(false)}
                                        className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50">
                                        Withdraw
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
