import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, MarketListing } from '@/types';

interface Props extends PageProps {
    listings: {
        data: MarketListing[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        fruit_type_id?: string;
    };
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function Index({ listings, filters }: Props) {
    const statuses = ['', 'active', 'sold', 'cancelled'];

    const handleStatusFilter = (status: string) => {
        router.get(route('admin.market-listings.index'), { status: status || undefined }, { preserveState: true });
    };

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this listing?')) {
            router.delete(route('admin.market-listings.destroy', id));
        }
    };

    return (
        <AppLayout title="Market Listings">
            <Head title="Market Listings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Market Listings</h2>
                        <span className="text-sm text-gray-500">{listings.total} listings total</span>
                    </div>

                    {/* Filters */}
                    <div className="mb-4 flex gap-2 flex-wrap">
                        {statuses.map((s) => (
                            <button
                                key={s || 'all'}
                                onClick={() => handleStatusFilter(s)}
                                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                    (filters.status ?? '') === s
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {s ? s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        {listings.data.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No market listings found.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Investment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Seller
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Ask Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Net Proceeds
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Buyer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {listings.data.map((listing) => (
                                        <tr key={listing.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{listing.investment.id}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {listing.investment.tree.fruit_type?.name ?? 'Unknown'} —{' '}
                                                    {listing.investment.tree.fruit_crop?.variant ?? 'Unknown'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {listing.investment.tree.fruit_crop?.farm?.name ?? 'Unknown Farm'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {listing.seller.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {listing.formatted_ask_price}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {listing.formatted_net_proceeds}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {listing.buyer?.name ?? '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[listing.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {listing.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {listing.status === 'active' && (
                                                    <button
                                                        onClick={() => handleCancel(listing.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {listings.last_page > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {Array.from({ length: listings.last_page }).map((_, i) => (
                                <Link
                                    key={i}
                                    href={`?page=${i + 1}${filters.status ? `&status=${filters.status}` : ''}`}
                                    className={`px-3 py-1 rounded text-sm ${
                                        listings.current_page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                                    }`}
                                >
                                    {i + 1}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
