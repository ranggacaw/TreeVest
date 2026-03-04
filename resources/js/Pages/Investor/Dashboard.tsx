import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { InvestorDashboardProps } from '@/types';
import StatCard from '@/Components/Dashboard/StatCard';
import QuickActionGrid from '@/Components/Dashboard/QuickActionGrid';
import { Leaf, Calendar, Stethoscope, HandCoins, DollarSign, Sprout, ShieldAlert, FileText, Pickaxe, LineChart } from 'lucide-react';

export default function Dashboard({
    metrics,
    kyc_status,
    upcoming_harvests,
    recent_payouts,
    recent_investments,
}: InvestorDashboardProps) {
    const quickActions = [
        { label: 'Browse Farms', href: route('farms.index'), icon: <Leaf />, color: 'pine' as const },
        { label: 'View Portfolio', href: route('portfolio.dashboard'), icon: <Sprout />, color: 'pine' as const },
        { label: 'Download Reports', href: route('reports.index'), icon: <FileText />, color: 'pine' as const },
        { label: 'KYC Verification', href: route('kyc.index'), icon: <ShieldAlert />, color: 'pine' as const },
    ];

    const formatCurrency = (cents: number) => {
        return '$' + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AppLayout
            title="Investor Dashboard"
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-pine-800 tracking-tight">Investor Hub</h2>
                        <p className="text-sm text-pine-500 mt-1">Track your portfolio, payouts, and upcoming harvests.</p>
                    </div>
                </div>
            }
        >
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {kyc_status !== 'verified' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex gap-3">
                                <ShieldAlert className="text-amber-500 h-6 w-6 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900">KYC Verification Required</h4>
                                    <p className="text-sm text-amber-700">You must complete KYC before investing or receiving payouts.</p>
                                </div>
                            </div>
                            <Link href={route('kyc.index')} className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                                Complete KYC Now
                            </Link>
                        </div>
                    )}

                    {metrics.total_investments_count === 0 ? (
                        <div className="bg-pine-50 rounded-3xl p-12 text-center border border-pine-200 shadow-sm">
                            <Sprout className="mx-auto h-12 w-12 text-pine-400 mb-4" />
                            <h3 className="text-xl font-bold text-pine-900 mb-2">Ready to grow your wealth?</h3>
                            <p className="text-pine-600 mb-6 max-w-md mx-auto">
                                You haven't made any investments yet. Browse our tokenized farms to start earning returns.
                            </p>
                            <Link
                                href={route('farms.index')}
                                className="inline-flex items-center px-6 py-3 bg-pine-600 border border-transparent rounded-xl font-semibold text-white hover:bg-pine-700 transition"
                            >
                                Browse Farms
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
                                <StatCard label="Total Invested" value={formatCurrency(metrics.total_invested_cents)} icon={<DollarSign />} accent="pine" />
                                <StatCard label="Active Trees" value={metrics.active_trees} icon={<Sprout />} accent="pine" />
                                <StatCard label="Total Payouts" value={formatCurrency(metrics.total_payouts_cents)} icon={<HandCoins />} accent="amber" />
                                <StatCard label="Portfolio ROI %" value={`${metrics.portfolio_roi_percent.toFixed(2)}%`} icon={<LineChart />} accent="sun" />
                                <StatCard label="Investments" value={metrics.total_investments_count} icon={<Leaf />} accent="pine" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Upcoming Harvests */}
                                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-earth-900">Upcoming Harvests</h3>
                                    </div>
                                    {upcoming_harvests.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcoming_harvests.map(harvest => (
                                                <div key={harvest.id} className="flex gap-4 p-4 rounded-2xl bg-sand-50 border border-sand-100 items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-earth-900">{harvest.fruit_type}</p>
                                                        <p className="text-sm text-earth-600">{harvest.farm_name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-pine-700">{new Date(harvest.harvest_date).toLocaleDateString()}</p>
                                                        <p className="text-xs text-earth-500 uppercase font-semibold mt-1">
                                                            {harvest.estimated_yield_kg} kg avg
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sand-500 text-sm py-4">No upcoming harvests for your trees.</p>
                                    )}
                                </div>

                                {/* Recent Payouts & Investments */}
                                <div className="space-y-8">
                                    <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-earth-900">Recent Payouts</h3>
                                            <Link href={route('investor.payouts.index')} className="text-sm font-medium text-pine-600 hover:text-pine-800">
                                                View All
                                            </Link>
                                        </div>
                                        {recent_payouts.length > 0 ? (
                                            <div className="space-y-4">
                                                {recent_payouts.map(payout => (
                                                    <div key={payout.id} className="p-4 rounded-xl border border-sand-100 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-sm text-earth-800">{payout.farm_name}</p>
                                                            <p className="text-xs text-sand-500">{new Date(payout.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-amber-600">{formatCurrency(payout.amount_cents)}</p>
                                                            <p className="text-[10px] uppercase font-bold text-sand-400">{payout.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sand-500 text-sm py-4">No recent payouts.</p>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 shadow-card border border-sand-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-earth-900">Recent Investments</h3>
                                            <Link href={route('investments.index')} className="text-sm font-medium text-pine-600 hover:text-pine-800">
                                                View All
                                            </Link>
                                        </div>
                                        {recent_investments.length > 0 ? (
                                            <div className="space-y-4">
                                                {recent_investments.map(inv => (
                                                    <div key={inv.id} className="p-4 rounded-xl border border-sand-100 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold text-sm text-earth-800">{inv.farm_name}</p>
                                                            <p className="text-xs text-sand-500">{new Date(inv.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-pine-700">{formatCurrency(inv.amount_cents)}</p>
                                                            <p className="text-[10px] uppercase font-bold text-sand-400">{inv.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sand-500 text-sm py-4">No recent investments.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
