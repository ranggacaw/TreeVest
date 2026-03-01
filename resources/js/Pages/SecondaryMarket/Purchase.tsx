import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageProps, MarketListing } from '@/types';

interface Props extends PageProps {
    listing: MarketListing;
    paymentIntent: {
        id: string;
        amount: number;
        currency: string;
        client_secret: string;
    };
    transactionId: number;
}

export default function Purchase({ auth, listing, paymentIntent, transactionId }: Props) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Complete Purchase
                </h2>
            }
        >
            <Head title={`Purchase Listing #${listing.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {flash.error}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Tree #{listing.investment.tree.identifier}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {listing.investment.tree.fruit_type.name} - {listing.investment.tree.fruit_crop.variant}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {listing.investment.tree.fruit_crop.farm.name}
                                </p>
                            </div>

                            <div className="p-4 bg-green-50 border border-green-200 rounded mb-6">
                                <p className="text-sm font-medium text-green-800 mb-2">Payment Summary</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Purchase Price:</span>
                                        <span className="font-semibold">{(paymentIntent.amount / 100).toFixed(2)} {listing.currency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform Fee ({(listing.platform_fee_rate * 100).toFixed(2)}%):</span>
                                        <span className="font-semibold">{listing.formatted_platform_fee}</span>
                                    </div>
                                    <div className="border-t border-green-300 pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-green-800 font-medium">Total:</span>
                                            <span className="text-green-800 font-bold">{(paymentIntent.amount / 100).toFixed(2)} {listing.currency}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Important Notes</h4>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                    <li>Harvest payouts will go to you as the new owner</li>
                                    <li>This purchase is final</li>
                                    <li>The seller will be notified of your purchase</li>
                                </ul>
                            </div>

                            <div id="payment-element" className="mb-6">
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`/secondary-market/${listing.id}`}
                                    className="flex-1 px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-700 text-center"
                                >
                                    Cancel
                                </a>
                                <button
                                    id="submit-payment"
                                    className="flex-1 px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Pay {listing.formatted_ask_price}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
