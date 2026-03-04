import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { FarmOwnerDashboardProps } from '@/types';
import StatCard from '@/Components/Dashboard/StatCard';
import QuickActionGrid from '@/Components/Dashboard/QuickActionGrid';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';
import { Leaf, Calendar, Stethoscope, LineChart, HandCoins, Users, Sprout } from 'lucide-react';

export default function Dashboard({
    metrics,
    farms,
    upcoming_harvests,
    recent_health_updates,
}: FarmOwnerDashboardProps) {
    const quickActions = [
        { label: 'Create Farm', href: route('farms.manage.create'), icon: <Leaf />, color: 'sage' as const },
        { label: 'Schedule Harvest', href: route('farm-owner.harvests.create'), icon: <Calendar />, color: 'sage' as const },
        { label: 'Post Health Update', href: route('farm-owner.health-updates.create'), icon: <Stethoscope />, color: 'sage' as const },
        { label: 'View Analytics', href: route('farms.manage.index'), icon: <LineChart />, color: 'sage' as const },
    ];

    const formatCurrency = (cents: number) => {
        return '$' + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AppLayout
            title="Farm Owner Dashboard"
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-sage-800 tracking-tight">Farm Owner Hub</h2>
                        <p className="text-sm text-sage-600 mt-1">Manage your farms, harvests, and health updates.</p>
                    </div>
                </div>
            }
        >
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {metrics.total_farms === 0 ? (
                        <div className="bg-sage-50 rounded-3xl p-12 text-center border border-sage-200 shadow-sm">
                            <Sprout className="mx-auto h-12 w-12 text-sage-400 mb-4" />
                            <h3 className="text-xl font-bold text-sage-900 mb-2">Welcome to TreeVest</h3>
                            <p className="text-sage-600 mb-6 max-w-md mx-auto">
                                You don't have any farms yet. Create your first farm to start tokenizing trees and receiving investments.
                            </p>
                            <Link
                                href={route('farms.manage.create')}
                                className="inline-flex items-center px-6 py-3 bg-sage-600 border border-transparent rounded-xl font-semibold text-white hover:bg-sage-700 transition"
                            >
                                Create First Farm
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
                                <StatCard label="Total Farms" value={metrics.total_farms} icon={<Leaf />} accent="sage" />
                                <StatCard label="Active Farms" value={metrics.active_farms} icon={<Leaf />} accent="sage" />
                                <StatCard label="Total Trees" value={metrics.total_trees} icon={<Sprout />} accent="sage" />
                                <StatCard label="Total Investors" value={metrics.total_investors} icon={<Users />} accent="sage" />
                                <StatCard label="Total Earnings" value={formatCurrency(metrics.total_earnings_cents)} icon={<HandCoins />} accent="amber" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Farm Overview */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-earth-900">Farm Status Overview</h3>
                                            <Link href={route('farms.manage.index')} className="text-sm font-medium text-sage-600 hover:text-sage-800">
                                                View All
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
                                        <h3 className="text-lg font-bold text-earth-900 mb-6">Upcoming Harvests</h3>
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
                                                            <p className="text-xs text-earth-500 uppercase font-semibold mt-1">{harvest.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sand-500 text-sm py-4">No upcoming harvests scheduled.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Health Updates */}
                                <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200 h-fit">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-earth-900">Recent Health Updates</h3>
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
                                        <p className="text-sand-500 text-sm py-4">No health updates posted recently.</p>
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
