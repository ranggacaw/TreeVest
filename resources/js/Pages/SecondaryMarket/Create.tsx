import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, Investment } from '@/types';

interface Props extends PageProps {
    activeInvestments: Investment[];
}

export default function Create({ auth, activeInvestments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        investment_id: '',
        ask_price_cents: '',
        notes: '',
        expires_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/secondary-market');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create Listing
                </h2>
            }
        >
            <Head title="Create Listing" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="investment_id" className="block text-sm font-medium text-gray-700">
                                        Select Investment
                                    </label>
                                    <select
                                        id="investment_id"
                                        value={data.investment_id}
                                        onChange={(e) => setData('investment_id', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    >
                                        <option value="">-- Select an investment --</option>
                                        {activeInvestments.map((investment) => (
                                            <option key={investment.id} value={investment.id}>
                                                Tree #{investment.tree.identifier} - {investment.tree.fruit_type.name} ({investment.tree.fruit_crop.variant}) - {investment.formatted_amount}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.investment_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.investment_id}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="ask_price_cents" className="block text-sm font-medium text-gray-700">
                                        Ask Price (cents)
                                    </label>
                                    <input
                                        type="number"
                                        id="ask_price_cents"
                                        value={data.ask_price_cents}
                                        onChange={(e) => setData('ask_price_cents', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        min="1"
                                    />
                                    {errors.ask_price_cents && (
                                        <p className="mt-1 text-sm text-red-600">{errors.ask_price_cents}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Minimum price: {activeInvestments.find(i => i.id === Number(data.investment_id))?.amount_cents || 0} cents
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        maxLength={1000}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
                                        Expires At (optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="expires_at"
                                        value={data.expires_at}
                                        onChange={(e) => setData('expires_at', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                    {errors.expires_at && (
                                        <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave empty for no expiration
                                    </p>
                                </div>

                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                    <h3 className="text-sm font-semibold text-yellow-800 mb-2">Risk Disclosure</h3>
                                    <p className="text-xs text-yellow-700">
                                        By listing this investment for sale, you acknowledge that the sale is subject to buyer availability and platform terms. 
                                        Harvest payouts will continue to accrue to the current owner of the investment.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Link
                                        href="/secondary-market"
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Listing'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
