import { Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Farm, PageProps } from '@/types';
import { useTranslation } from 'react-i18next';

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
    stats: {
        total: number;
        pending: number;
        active: number;
    };
}

const statusColors: Record<string, string> = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    deactivated: 'bg-gray-100 text-gray-800',
};

export default function Index({ farms, filters, stats }: Props) {
    const { t } = useTranslation();
    const statuses = ['', 'pending_approval', 'active', 'suspended', 'deactivated'];

    const handleStatusFilter = (status: string) => {
        router.get(route('admin.farms.index'), { status: status || undefined }, { preserveState: true });
    };

    return (
        <AppLayout
            title={t('admin.farms.title')}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-pine-800 tracking-tight">
                            {t('admin.farms.title')}
                        </h2>
                        <p className="text-sm text-pine-500 mt-1">{t('admin.farms.subtitle')}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-pine-600 bg-pine-50 px-3 py-1 rounded-full border border-pine-100">{stats.total} {t('admin.farms.farms_total')}</span>
                    </div>
                </div>
            }
        >
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                            <h3 className="text-sm font-medium text-pine-500">{t('admin.farms.total_farms')}</h3>
                            <p className="mt-2 text-3xl font-bold text-pine-800">{stats.total}</p>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                            <h3 className="text-sm font-medium text-pine-500">{t('admin.farms.active_farms')}</h3>
                            <p className="mt-2 text-3xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                            <h3 className="text-sm font-medium text-pine-500">{t('admin.farms.pending_approval')}</h3>
                            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-4 flex gap-2 flex-wrap">
                        {statuses.map((s) => (
                            <button
                                key={s || 'all'}
                                onClick={() => handleStatusFilter(s)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${(filters.status ?? '') === s
                                    ? 'bg-pine text-sand border-pine'
                                    : 'bg-white text-pine-600 border-sand-200 hover:bg-sand-50'
                                    }`}
                            >
                                {s ? t(`admin.farms.${s}`) : t('admin.farms.all')}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl shadow-card border border-sand-200 overflow-hidden">
                        {farms.data.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <h3 className="text-2xl font-bold text-pine-800 mb-2">{t('admin.farms.no_farms')}</h3>
                                <p className="text-pine-500 max-w-md mx-auto mb-8">
                                    {t('admin.farms.no_farms_description')}
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-sand-200">
                                <thead className="bg-sand-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-pine-500">Farm</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-pine-500">Owner</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-pine-500">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-pine-500">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-pine-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sand-200 bg-white">
                                    {farms.data.map((farm) => (
                                        <tr key={farm.id} className="hover:bg-sand-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-pine-800">{farm.name}</div>
                                                <div className="text-sm text-pine-500">{farm.size_hectares} ha</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-pine-800 font-medium">
                                                {farm.owner?.name ?? 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-pine-600">
                                                {[farm.city, farm.state, farm.country].filter(Boolean).join(', ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusColors[farm.status] ?? 'bg-sand-100 text-pine-700'}`}>
                                                    {farm.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route('admin.farms.show', farm.id)}
                                                    className="text-sm font-bold text-pine-600 hover:text-pine-800 transition-colors bg-sand-100 px-4 py-2 rounded-xl hover:bg-sand-200"
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
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${farms.current_page === i + 1 ? 'bg-pine text-sand' : 'bg-white text-pine-600 border border-sand-200 hover:bg-sand-50'
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
