import { useState, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    PageProps,
    PortfolioSummaryHeader,
    HoldingWithSparkline,
    PaginatedHoldings,
    WishlistItem,
    PortfolioTransaction,
    PaginatedTransactions,
    DiversificationData,
} from '@/types';
import FinancialErrorBoundary from '@/Components/FinancialErrorBoundary';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import {
    LineChart,
    Line,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from 'recharts';
import WishlistToggleButton from '@/Components/WishlistToggleButton';

interface Props extends PageProps {
    summaryHeader: PortfolioSummaryHeader;
    holdings: PaginatedHoldings;
    allocation: {
        by_fruit_type: DiversificationData[];
        by_farm: DiversificationData[];
        by_risk: DiversificationData[];
    };
    watchlist: WishlistItem[];
    transactions: PaginatedTransactions;
    activeTab: string;
    activeFilter: string;
}

const ALLOC_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
const RISK_COLORS: Record<string, string> = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };

// ─── Summary Header ────────────────────────────────────────────────────────────
function SummaryHeader({ header }: { header: PortfolioSummaryHeader }) {
    const { t } = useTranslation('investments');
    const gainPositive = header.gain_loss_cents >= 0;

    const kpis = [
        {
            label: t('total_invested', { defaultValue: 'Total Invested' }),
            value: formatRupiah(header.total_invested_cents),
            accent: 'text-gray-900',
        },
        {
            label: t('current_value', { defaultValue: 'Current Value' }),
            value: formatRupiah(header.current_value_cents),
            accent: 'text-gray-900',
        },
        {
            label: t('total_payouts', { defaultValue: 'Total Payouts' }),
            value: formatRupiah(header.total_payouts_cents),
            accent: 'text-green-600',
        },
        {
            label: t('pending_payouts', { defaultValue: 'Pending Payouts' }),
            value: formatRupiah(header.pending_payouts_cents),
            accent: 'text-yellow-600',
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {formatRupiah(header.current_value_cents)}
                    </h2>
                    <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${gainPositive ? 'text-green-600' : 'text-red-500'}`}>
                        <span>{gainPositive ? '▲' : '▼'}</span>
                        <span>{formatRupiah(Math.abs(header.gain_loss_cents))}</span>
                        <span className="text-gray-400 font-normal">
                            ({gainPositive ? '+' : ''}{header.gain_loss_percent.toFixed(2)}%)
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {t('all_time_return', { defaultValue: 'All-time return' })}
                    </p>
                </div>
                <Link
                    href={route('trees.index')}
                    className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    + {t('add_investment', { defaultValue: 'Add Investment' })}
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{kpi.label}</p>
                        <p className={`text-sm font-bold ${kpi.accent}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
    if (data.length < 2) {
        return <div className="h-10 w-24 bg-gray-50 rounded" />;
    }
    const chartData = data.map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width={96} height={40}>
            <LineChart data={chartData}>
                <Line
                    type="monotone"
                    dataKey="v"
                    stroke={positive ? '#10B981' : '#EF4444'}
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// ─── Holdings Tab ──────────────────────────────────────────────────────────────
function HoldingsTab({ holdings }: { holdings: PaginatedHoldings }) {
    const { t } = useTranslation('investments');

    if (holdings.data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>{t('no_holdings', { defaultValue: 'No active holdings.' })}</p>
                <Link href={route('trees.index')} className="mt-3 inline-block text-indigo-600 hover:underline text-sm">
                    {t('browse_marketplace', { defaultValue: 'Browse Marketplace' })}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {holdings.data.map((holding: HoldingWithSparkline) => {
                const positive = holding.gain_loss_cents >= 0;
                return (
                    <Link
                        key={holding.id}
                        href={route('investments.show', holding.id)}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all"
                    >
                        {/* Tree info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {holding.tree?.fruit_type} — {holding.tree?.variant}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{holding.tree?.farm_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {holding.quantity} {t('trees', { defaultValue: 'trees' })} · #{holding.tree?.identifier}
                            </p>
                        </div>

                        {/* Sparkline */}
                        <div className="hidden sm:block flex-shrink-0">
                            <Sparkline data={holding.sparkline} positive={positive} />
                        </div>

                        {/* Financials */}
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">
                                {formatRupiah(holding.amount_cents)}
                            </p>
                            <p className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                                {positive ? '+' : ''}{formatRupiah(holding.gain_loss_cents)}
                            </p>
                            <p className="text-xs text-gray-400">{holding.status}</p>
                        </div>
                    </Link>
                );
            })}

            {/* Pagination */}
            {holdings.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 pt-4">
                    <button
                        onClick={() => router.get(route('portfolio.dashboard'), { tab: 'holdings', page: holdings.current_page - 1 }, { preserveState: true })}
                        disabled={holdings.current_page === 1}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                    >
                        ‹ Prev
                    </button>
                    <span className="text-sm text-gray-600">{holdings.current_page} / {holdings.last_page}</span>
                    <button
                        onClick={() => router.get(route('portfolio.dashboard'), { tab: 'holdings', page: holdings.current_page + 1 }, { preserveState: true })}
                        disabled={holdings.current_page === holdings.last_page}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                    >
                        Next ›
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Allocation Donut ──────────────────────────────────────────────────────────
function AllocationDonut({ allocation }: { allocation: Props['allocation'] }) {
    const [view, setView] = useState<'fruit_type' | 'farm' | 'risk'>('fruit_type');

    const rawData = allocation[view === 'fruit_type' ? 'by_fruit_type' : view === 'farm' ? 'by_farm' : 'by_risk'];
    const chartData = rawData.map((d: DiversificationData, i: number) => ({
        name: d.category,
        value: d.value_cents,
        count: d.count,
        color: view === 'risk'
            ? (RISK_COLORS[d.category.toLowerCase()] ?? ALLOC_COLORS[i % ALLOC_COLORS.length])
            : ALLOC_COLORS[i % ALLOC_COLORS.length],
    }));

    const total = chartData.reduce((s: number, d: { value: number }) => s + d.value, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Allocation</h3>
                <div className="flex gap-1">
                    {(['fruit_type', 'farm', 'risk'] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                                view === v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {v === 'fruit_type' ? 'Fruit' : v === 'farm' ? 'Farm' : 'Risk'}
                        </button>
                    ))}
                </div>
            </div>

            {chartData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No data</p>
            ) : (
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                    formatter={(value: number | undefined) => [
                                        `${formatRupiah(value ?? 0)} (${total > 0 ? (((value ?? 0) / total) * 100).toFixed(1) : 0}%)`,
                                        'Value',
                                    ]}
                                />
                            <Legend
                                iconSize={8}
                                formatter={(value, entry) => {
                                    const item = (entry as any).payload as typeof chartData[0];
                                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                                    return <span className="text-xs">{value} {pct}%</span>;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

// ─── Watchlist Tab ─────────────────────────────────────────────────────────────
function WatchlistTab({ items }: { items: WishlistItem[] }) {
    const { t } = useTranslation('investments');

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>{t('no_watchlist', { defaultValue: 'No trees in your watchlist.' })}</p>
                <Link href={route('trees.index')} className="mt-3 inline-block text-indigo-600 hover:underline text-sm">
                    {t('browse_marketplace', { defaultValue: 'Browse Marketplace' })}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item: WishlistItem) => (
                <div
                    key={item.wishlist_id}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.fruit_crop.fruit_type} — {item.fruit_crop.variant}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{item.farm.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            #{item.identifier} · {item.status}
                        </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatRupiah(item.price_cents)}</p>
                        <p className="text-xs text-green-600 font-medium">{item.expected_roi_percent}% ROI</p>
                        <p className="text-xs text-gray-400 capitalize">{item.risk_rating} risk</p>
                    </div>

                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <Link
                            href={route('investments.configure', item.id)}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
                        >
                            {t('invest', { defaultValue: 'Invest' })}
                        </Link>
                        <WishlistToggleButton treeId={item.id} isWishlisted={true} authenticated={true} className="self-center" />
                    </div>
                </div>
            ))}

            <div className="text-right">
                <Link href={route('investor.wishlist.index')} className="text-sm text-indigo-600 hover:underline">
                    {t('manage_wishlist', { defaultValue: 'Manage wishlist →' })}
                </Link>
            </div>
        </div>
    );
}

// ─── Transactions Tab ──────────────────────────────────────────────────────────
function TransactionsTab({
    transactions,
    activeFilter,
}: {
    transactions: PaginatedTransactions;
    activeFilter: string;
}) {
    const { t } = useTranslation('investments');

    const filters = [
        { key: 'all', label: t('all', { defaultValue: 'All' }) },
        { key: 'investment', label: t('investments', { defaultValue: 'Investments' }) },
        { key: 'payout', label: t('payouts', { defaultValue: 'Payouts' }) },
        { key: 'topup', label: t('top_ups', { defaultValue: 'Top-ups' }) },
    ];

    const handleFilter = (f: string) => {
        router.reload({
            data: { tab: 'transactions', filter: f, page: 1 },
            only: ['transactions', 'activeFilter'],
        });
    };

    const handlePage = (p: number) => {
        router.reload({
            data: { tab: 'transactions', filter: activeFilter, page: p },
            only: ['transactions'],
        });
    };

    const typeColor: Record<string, string> = {
        investment_purchase: 'text-indigo-600',
        payout: 'text-green-600',
        top_up: 'text-blue-600',
    };

    return (
        <div>
            {/* Filter bar */}
            <div className="flex gap-2 mb-4">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => handleFilter(f.key)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            activeFilter === f.key
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {transactions.data.length === 0 ? (
                <p className="text-center py-12 text-gray-500 text-sm">
                    {t('no_transactions', { defaultValue: 'No transactions found.' })}
                </p>
            ) : (
                <div className="space-y-2">
                    {transactions.data.map((tx: PortfolioTransaction) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                            <div>
                                <p className={`text-sm font-medium ${typeColor[tx.type] ?? 'text-gray-900'} capitalize`}>
                                    {tx.type.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(tx.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                    {formatRupiah(tx.amount)}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    tx.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                        : tx.status === 'failed'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {transactions.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 pt-4">
                    <button
                        onClick={() => handlePage(transactions.current_page - 1)}
                        disabled={transactions.current_page === 1}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                    >
                        ‹ Prev
                    </button>
                    <span className="text-sm text-gray-600">{transactions.current_page} / {transactions.last_page}</span>
                    <button
                        onClick={() => handlePage(transactions.current_page + 1)}
                        disabled={transactions.current_page === transactions.last_page}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                    >
                        Next ›
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Dashboard({
    auth,
    summaryHeader,
    holdings,
    allocation,
    watchlist,
    transactions,
    activeTab,
    activeFilter,
}: Props) {
    const { t } = useTranslation('investments');
    const [tab, setTab] = useState<string>(activeTab ?? 'holdings');

    const switchTab = useCallback((newTab: string) => {
        setTab(newTab);
        router.get(route('portfolio.dashboard'), { tab: newTab }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    const tabs = [
        { key: 'holdings', label: t('holdings', { defaultValue: 'Holdings' }), count: holdings.total },
        { key: 'watchlist', label: t('watchlist', { defaultValue: 'Watchlist' }), count: watchlist.length },
        { key: 'transactions', label: t('transactions', { defaultValue: 'Transactions' }), count: null },
    ];

    const isEmpty = holdings.total === 0 && watchlist.length === 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('my_portfolio', { defaultValue: 'My Portfolio' })}
                </h2>
            }
        >
            <Head title={t('my_portfolio', { defaultValue: 'My Portfolio' })} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FinancialErrorBoundary context="portfolio-dashboard">
                        {isEmpty ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <p className="text-gray-500 mb-4">
                                    {t('no_portfolio', { defaultValue: 'You have no investments yet.' })}
                                </p>
                                <Link
                                    href={route('trees.index')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                                >
                                    {t('browse_marketplace', { defaultValue: 'Browse Marketplace' })}
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Summary Header */}
                                <SummaryHeader header={summaryHeader} />

                                {/* Main layout: tabs + allocation */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Tabs panel */}
                                    <div className="lg:col-span-2">
                                        {/* Tab bar */}
                                        <div className="flex border-b border-gray-200 mb-4">
                                            {tabs.map((t_) => (
                                                <button
                                                    key={t_.key}
                                                    onClick={() => switchTab(t_.key)}
                                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                                        tab === t_.key
                                                            ? 'border-indigo-600 text-indigo-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                                    }`}
                                                >
                                                    {t_.label}
                                                    {t_.count !== null && (
                                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                            tab === t_.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            {t_.count}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Tab content */}
                                        {tab === 'holdings' && <HoldingsTab holdings={holdings} />}
                                        {tab === 'watchlist' && <WatchlistTab items={watchlist} />}
                                        {tab === 'transactions' && (
                                            <TransactionsTab
                                                transactions={transactions}
                                                activeFilter={activeFilter}
                                            />
                                        )}
                                    </div>

                                    {/* Allocation sidebar */}
                                    <div className="lg:col-span-1">
                                        <AllocationDonut allocation={allocation} />

                                        <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                {t('quick_links', { defaultValue: 'Quick Links' })}
                                            </h3>
                                            <div className="space-y-2">
                                                <Link
                                                    href={route('investor.payouts.index')}
                                                    className="flex items-center justify-between text-sm text-gray-600 hover:text-indigo-600 py-1"
                                                >
                                                    {t('my_payouts', { defaultValue: 'My Payouts' })}
                                                    <span>→</span>
                                                </Link>
                                                <Link
                                                    href={route('reports.index')}
                                                    className="flex items-center justify-between text-sm text-gray-600 hover:text-indigo-600 py-1"
                                                >
                                                    {t('reports', { defaultValue: 'Reports' })}
                                                    <span>→</span>
                                                </Link>
                                                <Link
                                                    href={route('investor.wishlist.index')}
                                                    className="flex items-center justify-between text-sm text-gray-600 hover:text-indigo-600 py-1"
                                                >
                                                    {t('my_wishlist', { defaultValue: 'My Wishlist' })}
                                                    <span>→</span>
                                                </Link>
                                                <Link
                                                    href={route('trees.index')}
                                                    className="flex items-center justify-between text-sm text-gray-600 hover:text-indigo-600 py-1"
                                                >
                                                    {t('marketplace', { defaultValue: 'Marketplace' })}
                                                    <span>→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </FinancialErrorBoundary>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
