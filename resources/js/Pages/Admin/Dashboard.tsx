import { AppLayout } from '@/Layouts';
import { Head, Link, useForm } from '@inertiajs/react';
import { AdminDashboardProps } from '@/types';
import StatCard from '@/Components/Dashboard/StatCard';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import QuickActionGrid from '@/Components/Dashboard/QuickActionGrid';
import { Users, FileCheck, Landmark, DollarSign, Clock, Leaf, Sprout, HandCoins, FileText } from 'lucide-react';

interface Article {
    id: number;
    title: string;
    slug: string;
    view_count: number;
    published_at: string;
    updated_at: string;
}

interface Props extends AdminDashboardProps {
    popularArticles: Article[];
    staleArticles: Article[];
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
}

export default function Dashboard({
    metrics,
    recentActivity,
    date_from,
    date_to,
    popularArticles,
    staleArticles,
    totalArticles,
    publishedArticles,
    draftArticles,
}: Props) {
    const { data, setData, get } = useForm({
        date_from: date_from || '',
        date_to: date_to || '',
    });

    const submitFilter = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.dashboard'));
    };

    const resetFilter = () => {
        setData({ date_from: '', date_to: '' });
        get(route('admin.dashboard'));
    };

    const quickActions = [
        { label: 'Manage Users', href: route('admin.users.index'), icon: <Users /> },
        { label: 'Review KYC', href: route('admin.kyc.index'), icon: <FileCheck /> },
        { label: 'Approve Farms', href: route('admin.farms.index'), icon: <Leaf /> },
        { label: 'Create Article', href: route('admin.articles.create'), icon: <FileText /> },
    ];

    const formatCurrency = (cents: number) => {
        return '$' + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AppLayout
            title="Admin Dashboard"
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-pine-800 tracking-tight">Admin Dashboard</h2>
                        <p className="text-sm text-pine-500 mt-1">Platform overview and content management.</p>
                    </div>
                </div>
            }
        >
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Quick Actions */}
                    <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                        <QuickActionGrid actions={quickActions} />
                    </div>

                    {/* Metrics and Date Filter */}
                    <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-lg font-bold text-pine-800">Platform KPIs</h2>

                            <form onSubmit={submitFilter} className="flex flex-wrap items-center gap-2">
                                <input
                                    type="date"
                                    value={data.date_from}
                                    onChange={e => setData('date_from', e.target.value)}
                                    className="rounded-lg border-sand-300 text-sm focus:border-pine-500 focus:ring-pine-500"
                                />
                                <span className="text-sand-500 text-sm">to</span>
                                <input
                                    type="date"
                                    value={data.date_to}
                                    onChange={e => setData('date_to', e.target.value)}
                                    className="rounded-lg border-sand-300 text-sm focus:border-pine-500 focus:ring-pine-500"
                                />
                                <button type="submit" className="px-3 py-2 bg-pine-600 text-white rounded-lg text-sm font-medium hover:bg-pine-700 transition">
                                    Filter
                                </button>
                                {(data.date_from || data.date_to) && (
                                    <button type="button" onClick={resetFilter} className="px-3 py-2 bg-sand-200 text-sand-700 rounded-lg text-sm font-medium hover:bg-sand-300 transition">
                                        Reset
                                    </button>
                                )}
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Total Users" value={metrics.total_users} icon={<Users />} />
                            <StatCard label="KYC Verified" value={metrics.kyc_verified} icon={<FileCheck />} />
                            <StatCard label="Active Investments" value={metrics.active_investments} icon={<Sprout />} />
                            <StatCard label="Investment Volume" value={formatCurrency(metrics.investment_volume)} icon={<DollarSign />} />

                            <StatCard
                                label="Pending KYC"
                                value={metrics.pending_kyc}
                                icon={<Clock />}
                                accent={metrics.pending_kyc > 0 ? 'amber' : 'none'}
                            />
                            <StatCard
                                label="Pending Farms"
                                value={metrics.pending_farms}
                                icon={<Clock />}
                                accent={metrics.pending_farms > 0 ? 'amber' : 'none'}
                            />
                            <StatCard label="Completed Harvests" value={metrics.completed_harvests} icon={<Leaf />} />
                            <StatCard label="Total Payouts" value={formatCurrency(metrics.total_payouts)} icon={<HandCoins />} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200 lg:row-span-2">
                            <h2 className="text-lg font-bold text-pine-800 mb-6">Recent Activity</h2>
                            <ActivityFeed activities={recentActivity} />
                        </div>

                        {/* Article Sections (Popular/Stale) */}
                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-pine-800">Popular Articles</h2>
                                <Link
                                    href={route('admin.articles.index')}
                                    className="text-sm font-bold text-pine-600 hover:text-pine-800 transition-colors"
                                >
                                    View All
                                </Link>
                            </div>
                            {popularArticles.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {popularArticles.map((article) => (
                                        <li key={article.id} className="py-3">
                                            <Link
                                                href={route('admin.articles.edit', article.id)}
                                                className="block hover:bg-gray-50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 truncate">
                                                        <p className="truncate text-sm font-medium text-gray-900">
                                                            {article.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Last updated: {new Date(article.updated_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4 flex items-center text-sm text-gray-500">
                                                        <svg
                                                            className="mr-1 h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                        {article.view_count}
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No articles yet.</p>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-pine-800">
                                    <span className="text-yellow-600">⚠️</span> Stale Content
                                </h2>
                            </div>
                            {staleArticles.length > 0 ? (
                                <>
                                    <p className="mb-4 text-sm text-gray-600">
                                        These articles haven't been updated in over 6 months and may need review.
                                    </p>
                                    <ul className="divide-y divide-gray-200">
                                        {staleArticles.map((article) => (
                                            <li key={article.id} className="py-3">
                                                <Link
                                                    href={route('admin.articles.edit', article.id)}
                                                    className="block hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 truncate">
                                                            <p className="truncate text-sm font-medium text-gray-900">
                                                                {article.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Last updated: {new Date(article.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                                            Stale
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">All content is up to date.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
