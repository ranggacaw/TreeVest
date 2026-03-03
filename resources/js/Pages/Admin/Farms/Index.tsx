import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Farm, PageProps } from '@/types';

interface Props extends PageProps {
    farms: {
        data: Farm[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
    };
}

const statusColors: Record<string, string> = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    deactivated: 'bg-gray-100 text-gray-800',
};

export default function Index({ farms, filters }: Props) {
    const statuses = ['', 'pending_approval', 'active', 'suspended', 'deactivated'];

    const handleStatusFilter = (status: string) => {
        router.get(route('admin.farms.index'), { status: status || undefined }, { preserveState: true });
    };

    return (
        <AppLayout title="Farm Management">
            <Head title="Farm Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Farm Management</h2>
                        <span className="text-sm text-gray-500">{farms.total} farms total</span>
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
                        {farms.data.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No farms found.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Farm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {farms.data.map((farm) => (
                                        <tr key={farm.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{farm.name}</div>
                                                <div className="text-sm text-gray-500">{farm.size_hectares} ha</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {farm.owner?.name ?? 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {[farm.city, farm.state, farm.country].filter(Boolean).join(', ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[farm.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {farm.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route('admin.farms.show', farm.id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {farms.last_page > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {Array.from({ length: farms.last_page }).map((_, i) => (
                                <Link
                                    key={i}
                                    href={`?page=${i + 1}${filters.status ? `&status=${filters.status}` : ''}`}
                                    className={`px-3 py-1 rounded text-sm ${
                                        farms.current_page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
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
