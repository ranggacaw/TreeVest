import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, MarketListing } from '@/types';

interface Props extends PageProps {
    listing: MarketListing;
    isOwner: boolean;
    isBuyer: boolean;
    canPurchase: boolean;
    canCancel: boolean;
}

export default function Show({ auth, listing, isOwner, isBuyer, canPurchase, canCancel }: Props) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Listing Details
                </h2>
            }
        >
            <Head title={`Listing #${listing.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            {flash.success}
                        </div>
                    )}
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

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-500">Ask Price</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {listing.formatted_ask_price}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                        listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {listing.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Fee Breakdown</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-yellow-50 rounded">
                                        <p className="text-xs text-gray-500">Platform Fee</p>
                                        <p className="font-semibold text-gray-900">
                                            {listing.formatted_platform_fee} ({(listing.platform_fee_rate * 100).toFixed(2)}%)
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded">
                                        <p className="text-xs text-gray-500">Net Proceeds</p>
                                        <p className="font-semibold text-gray-900">
                                            {listing.formatted_net_proceeds}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {listing.notes && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                        {listing.notes}
                                    </p>
                                </div>
                            )}

                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Investment Details</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Original Amount: {listing.investment.amount_cents / 100} {listing.currency}</p>
                                    <p>Purchase Date: {new Date(listing.investment.purchase_date).toLocaleDateString()}</p>
                                    <p>Expected ROI: {listing.investment.tree.expected_roi_percent}%</p>
                                    <p>Risk Rating: {listing.investment.tree.risk_rating}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {canCancel && (
                                    <Link
                                        href={`/investments/${listing.investment_id}`}
                                        className="flex-1 px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-700 text-center"
                                    >
                                        Back to Investment
                                    </Link>
                                )}

                                {canCancel && (
                                    <form
                                        action={`/secondary-market/${listing.id}`}
                                        method="POST"
                                        className="flex-1"
                                    >
                                        <input type="hidden" name="_method" value="DELETE" />
                                        <input type="hidden" name="_token" value={(document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''} />
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                                        >
                                            Cancel Listing
                                        </button>
                                    </form>
                                )}

                                {canPurchase && listing.status === 'active' && (
                                    <Link
                                        href={`/secondary-market/${listing.id}/purchase`}
                                        className="flex-1 px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 text-center"
                                    >
                                        Purchase
                                    </Link>
                                )}
                            </div>

                            {listing.status === 'sold' && isBuyer && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                                    <p className="text-sm font-medium text-green-800">
                                        You have successfully purchased this investment!
                                    </p>
                                    <Link
                                        href={`/investments/${listing.investment_id}`}
                                        className="mt-2 inline-block text-sm text-green-700 hover:underline"
                                    >
                                        View your investment
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
