import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { InvestorDashboardProps } from '@/types';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import {
    IconPlant,
    IconTree,
    IconDollar,
    IconChart,
    IconFlash,
} from '@/Components/Icons/AppIcons';

export default function Dashboard({
    metrics,
    kyc_status,
    upcoming_harvests,
    recent_payouts,
}: InvestorDashboardProps) {
    const page = usePage();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

    return (
        <AppShellLayout>
            <Head title="Investor Dashboard" />
            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unreadCount} />

                    {/* KYC Alert */}
                    {kyc_status !== 'verified' && (
                        <div className="bg-white px-5 pt-5 pb-6">
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">
                                        !
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm mb-1">Verifikasi KYC Diperlukan</h3>
                                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                            Anda harus menyelesaikan verifikasi identitas sebelum mulai berinvestasi.
                                        </p>
                                        <Link
                                            href={route('kyc.index')}
                                            className="inline-block px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm hover:bg-amber-600 transition-colors"
                                        >
                                            Verifikasi Sekarang
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {kyc_status !== 'verified' && <div className="h-3 bg-gray-50" />}

                    {/* Stats Grid */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Ringkasan</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium mb-1">Total Investasi</p>
                                <p className="text-sm text-gray-900">
                                    {formatRupiah(metrics?.total_invested_cents || 0)}
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium mb-1">Total Payouts</p>
                                <p className="text-sm text-gray-900">
                                    {formatRupiah(metrics?.total_payouts_cents || 0)}
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium mb-1">Pohon Aktif</p>
                                <p className="text-sm text-gray-900">
                                    {metrics?.active_trees || 0}
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium mb-1">Portfolio ROI</p>
                                <p className="text-sm text-gray-900">
                                    {(metrics?.portfolio_roi_percent || 0).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Quick Actions */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Akses Cepat</h2>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { label: 'Farms', href: route('farms.index'), icon: <IconTree className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50' },
                                { label: 'Portofolio', href: route('portfolio.dashboard'), icon: <IconPlant className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50' },
                                { label: 'Laporan', href: route('reports.index'), icon: <IconChart className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
                                { label: 'KYC', href: route('kyc.index'), icon: <IconFlash className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-50' },
                            ].map((item, idx) => (
                                <Link key={idx} href={item.href} className="flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Upcoming Harvests */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-900">Panen Mendatang</h2>
                        </div>
                        {upcoming_harvests.length > 0 ? (
                            <div className="space-y-3">
                                {upcoming_harvests.map(harvest => (
                                    <div key={harvest.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <IconPlant className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{harvest.fruit_type}</p>
                                            <p className="text-[11px] text-gray-500 truncate">{harvest.farm_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-900">{new Date(harvest.harvest_date).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-emerald-600 font-medium">Est. {harvest.estimated_yield_kg} kg</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">Belum ada jadwal panen.</p>
                        )}
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Recent Payouts */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-900">Payout Terakhir</h2>
                            <Link href={route('investor.payouts.index')} className="text-emerald-600 text-[13px] font-bold">
                                Lihat Semua
                            </Link>
                        </div>
                        {recent_payouts.length > 0 ? (
                            <div className="space-y-3">
                                {recent_payouts.map(payout => (
                                    <Link key={payout.id} href={route('investor.payouts.show', payout.id)} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <IconDollar className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{payout.farm_name}</p>
                                            <p className="text-[11px] text-gray-500">{new Date(payout.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900">{formatRupiah(payout.amount_cents)}</p>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${payout.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {payout.status}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">Belum ada riwayat payout.</p>
                        )}
                    </div>

                </div>
                <BottomNav />
            </div>
            <style>{`::-webkit-scrollbar { display: none; } * { -webkit-tap-highlight-color: transparent; }`}</style>
        </AppShellLayout>
    );
}
