import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, MarketListing } from '@/types';

interface Props extends PageProps {
    listings: {
        data: MarketListing[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: Record<string, unknown>;
    canCreateListing: boolean;
}

export default function Index({ auth, listings, filters, canCreateListing }: Props) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Secondary Market
                    </h2>
                    {canCreateListing && (
                        <Link
                            href="/secondary-market/create"
                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                        >
                            Create Listing
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Secondary Market" />

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
                            {listings.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No listings available at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {listings.data.map((listing) => (
                                        <Link
                                            key={listing.id}
                                            href={`/secondary-market/${listing.id}`}
                                            className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        Tree #{listing.investment.tree.identifier}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {listing.investment.tree.fruit_type.name} - {listing.investment.tree.fruit_crop.variant}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {listing.investment.tree.fruit_crop.farm.name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {listing.formatted_ask_price}
                                                    </p>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {listing.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {listings.last_page > 1 && (
                                <div className="mt-6 flex justify-center gap-2">
                                    {listings.current_page > 1 && (
                                        <Link
                                            href={`?page=${listings.current_page - 1}`}
                                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    <span className="px-4 py-2">
                                        Page {listings.current_page} of {listings.last_page}
                                    </span>
                                    {listings.current_page < listings.last_page && (
                                        <Link
                                            href={`?page=${listings.current_page + 1}`}
                                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
