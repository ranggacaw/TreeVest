import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { FarmOwnerDashboardProps } from '@/types';
import StatCard from '@/Components/Dashboard/StatCard';
import QuickActionGrid from '@/Components/Dashboard/QuickActionGrid';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';
import { Leaf, Calendar, Stethoscope, LineChart, HandCoins, Users, Sprout, Warehouse, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';

export default function Dashboard({
    metrics,
    farms,
    upcoming_harvests,
    recent_health_updates,
}: FarmOwnerDashboardProps) {
    const { t } = useTranslation('farms');
    const { t: tHarvest } = useTranslation('harvests');

    const quickActions = [
        { label: t('farm_owner.dashboard.create_farm'), href: route('farms.manage.create'), icon: <Leaf />, color: 'sage' as const },
        { label: t('farm_owner.dashboard.schedule_harvest'), href: route('farm-owner.harvests.create'), icon: <Calendar />, color: 'sage' as const },
        { label: t('farm_owner.dashboard.post_health_update'), href: route('farm-owner.health-updates.create'), icon: <Stethoscope />, color: 'sage' as const },
        { label: t('farm_owner.dashboard.manage_trees'), href: route('farm-owner.trees.index'), icon: <Sprout />, color: 'sage' as const },
        { label: t('farm_owner.dashboard.manage_warehouses', 'Warehouses'), href: route('farm-owner.warehouses.index'), icon: <Warehouse />, color: 'sage' as const },
        { label: t('farm_owner.dashboard.manage_lots', 'Lots'), href: route('farm-owner.lots.index'), icon: <Layers />, color: 'sage' as const },
        { label: t('farm_owner.dashboard.view_analytics'), href: route('farms.manage.index'), icon: <LineChart />, color: 'sage' as const },
    ];

    const formatCurrency = (idr: number) => {
        return formatRupiah(idr);
    };

    return (
        <AppLayout
            title={t('farm_owner.dashboard.title')}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-sage-800 tracking-tight">{t('farm_owner.dashboard.hub')}</h2>
                        <p className="text-sm text-sage-600 mt-1">{t('farm_owner.dashboard.manage_farms')}</p>
                    </div>
                </div>
            }
        >
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {metrics?.total_farms === 0 ? (
                        <div className="bg-sage-50 rounded-3xl p-12 text-center border border-sage-200 shadow-sm">
                            <Sprout className="mx-auto h-12 w-12 text-sage-400 mb-4" />
                            <h3 className="text-xl font-bold text-sage-900 mb-2">{t('farm_owner.dashboard.welcome_title')}</h3>
                            <p className="text-sage-600 mb-6 max-w-md mx-auto">
                                {t('farm_owner.dashboard.no_farms')}
                            </p>
                            <Link
                                href={route('farms.manage.create')}
                                className="inline-flex items-center px-6 py-3 bg-sage-600 border border-transparent rounded-xl font-semibold text-white hover:bg-sage-700 transition"
                            >
                                {t('farm_owner.dashboard.create_first_farm')}
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Quick Actions */}
                            <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                                <QuickActionGrid actions={quickActions} />
                            </div>

                            {/* KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <StatCard label={t('farm_owner.dashboard.total_farms')} value={metrics?.total_farms || 0} icon={<Leaf />} accent="sage" />
                                <StatCard label={t('farm_owner.dashboard.total_farms')} value={metrics?.active_farms || 0} icon={<Leaf />} accent="sage" />
                                <StatCard label={t('farm_owner.dashboard.total_trees')} value={metrics?.total_trees || 0} icon={<Sprout />} accent="sage" />
                                <StatCard label={t('farm_owner.dashboard.total_investors')} value={metrics?.total_investors || 0} icon={<Users />} accent="sage" />
                                <StatCard label={t('farm_owner.dashboard.total_earnings')} value={formatCurrency(metrics?.total_earnings_idr || 0)} icon={<HandCoins />} accent="amber" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Farm Overview */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-earth-900">{t('farm_owner.dashboard.farm_status_overview')}</h3>
                                            <Link href={route('farms.manage.index')} className="text-sm font-medium text-sage-600 hover:text-sage-800">
                                                {t('farm_owner.dashboard.view_all')}
                                            </Link>
                                        </div>
                                        <ul className="divide-y divide-sand-100">
                                            {farms.map(farm => (
                                                <li key={farm.id} className="py-4 flex justify-between items-center">
                                                    <span className="font-medium text-earth-800">{farm.name}</span>
                                                    <FarmStatusBadge status={farm.status as any} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Harvest Timeline */}
                                    <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                                        <h3 className="text-lg font-bold text-earth-900 mb-6">{t('farm_owner.dashboard.upcoming_harvests')}</h3>
                                        {upcoming_harvests.length > 0 ? (
                                            <div className="space-y-4">
                                                {upcoming_harvests.map(harvest => (
                                                    <div key={harvest.id} className="flex gap-4 p-4 rounded-2xl bg-sand-50 border border-sand-100 items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-earth-900">{harvest.fruit_type}</p>
                                                            <p className="text-sm text-earth-600">{harvest.farm_name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-sage-700">{new Date(harvest.harvest_date).toLocaleDateString()}</p>
                                                            <p className="text-xs text-earth-500 uppercase font-semibold mt-1">{tHarvest(`status.${harvest.status}`)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sand-500 text-sm py-4">{t('farm_owner.dashboard.no_upcoming_harvests')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Health Updates */}
                                <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200 h-fit">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-earth-900">{t('farm_owner.dashboard.recent_health_updates')}</h3>
                                    </div>
                                    {recent_health_updates.length > 0 ? (
                                        <div className="space-y-4">
                                            {recent_health_updates.map(update => (
                                                <div key={update.id} className="p-4 rounded-xl border border-sand-100 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-semibold text-sm text-earth-800 truncate pr-2">{update.farm_name}</span>
                                                        <HealthSeverityBadge severity={update.severity as any} />
                                                    </div>
                                                    <p className="text-sm text-earth-600 line-clamp-2">{update.description}</p>
                                                    <p className="text-xs text-sand-400">
                                                        {new Date(update.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sand-500 text-sm py-4">{t('farm_owner.dashboard.no_health_updates')}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
