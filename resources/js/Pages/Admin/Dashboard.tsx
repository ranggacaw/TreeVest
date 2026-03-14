import { AppLayout } from '@/Layouts';
import { Head, Link, useForm } from '@inertiajs/react';
import { AdminDashboardProps } from '@/types';
import StatCard from '@/Components/Dashboard/StatCard';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import QuickActionGrid from '@/Components/Dashboard/QuickActionGrid';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import { Users, FileCheck, Landmark, DollarSign, Clock, Leaf, Sprout, HandCoins, FileText, Globe } from 'lucide-react';

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
    const { t } = useTranslation('admin');
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
        { label: t('dashboard.manage_users'), href: route('admin.users.index'), icon: <Users /> },
        { label: t('dashboard.review_kyc'), href: route('admin.kyc.index'), icon: <FileCheck /> },
        { label: t('dashboard.approve_farms'), href: route('admin.farms.index'), icon: <Leaf /> },
        { label: t('dashboard.create_article'), href: route('admin.articles.create'), icon: <FileText /> },
        { label: t('translations.title', 'Translation Management'), href: route('admin.translations.index'), icon: <Globe /> },
    ];

    const formatCurrency = (idr: number) => {
        return formatRupiah(idr);
    };

    return (
        <AppLayout
            title={t('dashboard.title')}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-pine-800 tracking-tight">{t('dashboard.title')}</h2>
                        <p className="text-sm text-pine-500 mt-1">{t('dashboard.subtitle')}</p>
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
                            <h2 className="text-lg font-bold text-pine-800">{t('dashboard.platform_kpis')}</h2>

                            <form onSubmit={submitFilter} className="flex flex-wrap items-center gap-2">
                                <input
                                    type="date"
                                    value={data.date_from}
                                    onChange={e => setData('date_from', e.target.value)}
                                    className="rounded-lg border-sand-300 text-sm focus:border-pine-500 focus:ring-pine-500"
                                />
                                <span className="text-sand-500 text-sm">{t('common.to')}</span>
                                <input
                                    type="date"
                                    value={data.date_to}
                                    onChange={e => setData('date_to', e.target.value)}
                                    className="rounded-lg border-sand-300 text-sm focus:border-pine-500 focus:ring-pine-500"
                                />
                                <button type="submit" className="px-3 py-2 bg-pine-600 text-white rounded-lg text-sm font-medium hover:bg-pine-700 transition">
                                    {t('common.filter')}
                                </button>
                                {(data.date_from || data.date_to) && (
                                    <button type="button" onClick={resetFilter} className="px-3 py-2 bg-sand-200 text-sand-700 rounded-lg text-sm font-medium hover:bg-sand-300 transition">
                                        {t('common.reset')}
                                    </button>
                                )}
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label={t('dashboard.total_users')} value={metrics?.total_users || 0} icon={<Users />} />
                            <StatCard label={t('dashboard.kyc_verified')} value={metrics?.kyc_verified || 0} icon={<FileCheck />} />
                            <StatCard label={t('dashboard.active_investments')} value={metrics?.active_investments || 0} icon={<Sprout />} />
                            <StatCard label={t('dashboard.investment_volume')} value={formatCurrency(metrics?.investment_volume_idr || 0)} icon={<DollarSign />} />

                            <StatCard
                                label={t('dashboard.pending_kyc')}
                                value={metrics?.pending_kyc || 0}
                                icon={<Clock />}
                                accent={(metrics?.pending_kyc || 0) > 0 ? 'amber' : 'none'}
                            />
                            <StatCard
                                label={t('dashboard.pending_farms')}
                                value={metrics?.pending_farms || 0}
                                icon={<Clock />}
                                accent={(metrics?.pending_farms || 0) > 0 ? 'amber' : 'none'}
                            />
                            <StatCard label={t('dashboard.completed_harvests')} value={metrics?.completed_harvests || 0} icon={<Leaf />} />
                            <StatCard label={t('dashboard.total_payouts')} value={formatCurrency(metrics?.total_payouts_idr || 0)} icon={<HandCoins />} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200 lg:row-span-2">
                            <h2 className="text-lg font-bold text-pine-800 mb-6">{t('dashboard.recent_activity')}</h2>
                            <ActivityFeed activities={recentActivity} />
                        </div>

                        {/* Article Sections (Popular/Stale) */}
                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-pine-800">{t('dashboard.popular_articles')}</h2>
                                <Link
                                    href={route('admin.articles.index')}
                                    className="text-sm font-bold text-pine-600 hover:text-pine-800 transition-colors"
                                >
                                    {t('common.view_all')}
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
                                                            {t('dashboard.last_updated')}: {new Date(article.updated_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4 flex items-center text-sm text-gray-500">
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                                            {t('dashboard.stale')}
                                                        </span>
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
                                <p className="text-sm text-gray-500">{t('dashboard.no_articles')}</p>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-pine-800">
                                    <span className="text-yellow-600">⚠️</span> {t('dashboard.stale_content')}
                                </h2>
                            </div>
                            {staleArticles.length > 0 ? (
                                <>
                                    <p className="mb-4 text-sm text-gray-600">
                                        {t('dashboard.stale_content_description')}
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
                                                                {t('dashboard.last_updated')}: {new Date(article.updated_at).toLocaleDateString()}
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
                                <p className="text-sm text-gray-500">{t('dashboard.all_content_up_to_date')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
