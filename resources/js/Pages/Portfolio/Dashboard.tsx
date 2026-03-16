import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  PageProps,
  PortfolioSummaryHeader,
  HoldingWithSparkline,
  PaginatedHoldings,
  WishlistItem,
  PaginatedTransactions,
  DiversificationData,
} from '@/types';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import { useState } from 'react';

// ─── Reusable Components ─────────────────────────────────────────────────────
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import {
  IconPlant,
  IconTree,
  IconFlash,
  IconDollar,
  IconChart,
  IconTrophy,
  NavPie,
} from '@/Components/Icons/AppIcons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PromoBanner {
  title: string;
  days_until: number;
  months_until_label: string;
  roi_range: string | null;
  tree_id: number;
}

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
  activeTab?: string;
  topTrees?: Record<string, { id: number; name: string; return: string }[]>;
  promoBanner?: PromoBanner | null;
}

// ─── Portfolio Holding Card (for horizontal slider) ───────────────────────────
function HoldingCard({ holding }: { holding: HoldingWithSparkline }) {
  const positive = (holding.gain_loss_idr ?? 0) >= 0;

  return (
    <Link
      href={route('investments.show', holding.id)}
      className="flex-shrink-0 w-[220px] bg-white rounded-2xl border border-gray-100 shadow-sm p-4 block snap-start"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <IconPlant className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-gray-900 text-sm truncate">{holding.tree?.variant || '—'}</h4>
          <p className="text-[11px] text-gray-500 truncate">{holding.tree?.farm_name || '—'}</p>
          {holding.tree?.token_id && (
            <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">{holding.tree.token_id}</p>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mb-0.5">Investasi</p>
      <p className="font-bold text-gray-900 text-sm">{formatRupiah(holding.amount_idr)}</p>

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5">Keuntungan</p>
          <p className={`font-semibold text-sm ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
            {positive ? '+' : '-'}{formatRupiah(Math.abs(holding.gain_loss_idr ?? 0))}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {positive ? '▲' : '▼'} {holding.gain_loss_percent?.toFixed(1) ?? '0'}%
        </span>
      </div>
    </Link>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function Dashboard({
  summaryHeader,
  holdings,
  watchlist,
  topTrees = {},
  promoBanner,
}: Props) {
  const { t } = useTranslation('investments');
  const page = usePage<Props>();
  const unreadCount = page.props.unread_notifications_count ?? 0;
  const gainPositive = (summaryHeader.gain_loss_idr ?? 0) >= 0;

  // Derive available crop filters dynamically from topTrees keys
  const cropFilters = Object.keys(topTrees) as string[];
  const [topTreeFilter, setTopTreeFilter] = useState<string>(cropFilters[0] ?? 'Durian');

  return (
    <AppShellLayout>
      <Head title="Portofolio" />

      {/* App Shell — mobile-first max-w-md container */}
      <div
        className="relative w-full max-w-md bg-gray-50 flex flex-col"
        style={{ height: '100dvh' }}
      >
        {/* ── Scrollable Area ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>

          {/* ── Top App Bar (reusable, dynamic notification count) ── */}
          <AppTopBar notificationCount={unreadCount} />

          {/* ── Hero: Portfolio Value ──────────────────────────────── */}
          <div className="bg-white px-5 pt-5 pb-6">
            <p className="text-gray-500 text-sm mb-2">{t('portfolio_value', { defaultValue: 'Nilai Portofolio' })}</p>

            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-[30px] font-extrabold text-gray-900 tracking-tight leading-none">
                  {formatRupiah(summaryHeader.current_value_idr)}
                </h1>
              </div>
              <div className="flex bg-gray-100 rounded-full px-3 py-1.5 items-center gap-1.5 mt-1">
                <span className="font-bold text-gray-700 text-[13px]">{summaryHeader.total_trees ?? 0}</span>
                <IconPlant className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="flex items-center gap-10">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">{t('profit', { defaultValue: 'Keuntungan' })}</p>
                <p className={`font-semibold text-[15px] ${gainPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {gainPositive ? '' : '-'}{formatRupiah(Math.abs(summaryHeader.gain_loss_idr ?? 0))}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">{t('yield', { defaultValue: 'Imbal Hasil' })}</p>
                <p className={`font-semibold text-[15px] flex items-center gap-0.5 ${gainPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {gainPositive ? '▲' : '▼'} {(summaryHeader.gain_loss_percent ?? 0).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Section divider */}
          <div className="h-3 bg-gray-50" />

          {/* ── Produk Investasi Grid ─────────────────────────────── */}
          <div className="bg-white px-5 pt-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <IconTree className="w-4 h-4 text-emerald-600" />
                Produk Investasi
              </h2>
              <Link href={route('trees.index')} className="text-emerald-600 text-[13px] font-bold">
                Explore
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'Durian', icon: <IconTree className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50' },
                { label: 'Alpukat', icon: <IconPlant className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50', badge: 'Baru' },
                { label: 'Mangga', icon: <IconDollar className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50' },
                { label: 'Lainnya', icon: <IconChart className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-50' },
              ].map(({ label, icon, bg, badge }) => (
                <Link key={label} href={route('trees.index', { fruit_type: label })} className="flex flex-col items-center gap-1.5 group relative">
                  {badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10 border-2 border-white">
                      {badge}
                    </span>
                  )}
                  <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center`}>
                    {icon}
                  </div>
                  <span className="text-[11px] font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Section divider */}
          <div className="h-3 bg-gray-50" />

          {/* ── Promo Banner: Panen (dynamic) ─────────────────────── */}
          {promoBanner ? (
            <div className="bg-white px-5 pt-5 pb-5">
              <div className="relative bg-white border border-gray-100 shadow-sm rounded-2xl p-4 overflow-hidden">
                {/* decorative blob */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full transform translate-x-8 -translate-y-8 pointer-events-none" />

                <div className="flex items-start gap-3 relative">
                  <div className="w-11 h-11 bg-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5">
                    <IconTree className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      <h3 className="font-bold text-gray-900 text-[13px] leading-snug">
                        {promoBanner.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-snug">
                      Estimasi panen{' '}
                      <span className="font-semibold text-gray-700">{promoBanner.months_until_label}</span>
                      {promoBanner.roi_range && (
                        <>
                          . Ekspektasi ROI{' '}
                          <span className="font-bold text-emerald-600">{promoBanner.roi_range}</span>
                        </>
                      )}
                    </p>
                    <Link
                      href={route('trees.show', promoBanner.tree_id)}
                      className="mt-3 inline-block px-5 py-1.5 bg-white border border-emerald-500 text-emerald-600 text-xs font-bold rounded-full hover:bg-emerald-50 transition-colors"
                    >
                      Beli Ekstra
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Upgrade Banner ────────────────────────────────────── */}
          <div className="px-5 pb-5">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-4 relative overflow-hidden">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 flex-shrink-0">
                  <IconFlash className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[13px] flex items-center gap-2 flex-wrap">
                    Upgrade ke Treevest Plus
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Gratis
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                    Nikmati analisa panen premium, asuransi hama, dan prioritas penjualan.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-100/60 font-bold text-indigo-600 text-[13px] flex items-center justify-between">
                <span>Upgrade Sekarang</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>

          {/* Section divider */}
          <div className="h-3 bg-gray-50" />

          {/* ── Portfolio Slider ──────────────────────────────────── */}
          <div className="bg-white pt-5 pb-6">
            <div className="px-5 flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <NavPie active={true} />
                Portofolio
              </h2>
              <Link href={route('portfolio.dashboard')} className="text-emerald-600 text-[13px] font-bold">
                Lihat Semua
              </Link>
            </div>

            {/* Horizontal scroll slider */}
            <div
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pl-5 pr-5 pb-2 mx-5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {holdings.data.length > 0 ? (
                holdings.data.slice(0, 10).map((h) => <HoldingCard key={h.id} holding={h} />)
              ) : (
                <div className="w-full flex-shrink-0 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                  <p className="text-sm text-gray-500 mb-3">Belum ada aset investasi</p>
                  <Link
                    href={route('trees.index')}
                    className="inline-block px-5 py-2 bg-emerald-500 text-white text-sm font-bold rounded-full hover:bg-emerald-600 transition-colors"
                  >
                    Mulai Investasi
                  </Link>
                </div>
              )}
              {/* right edge spacer */}
              <div className="w-1 flex-shrink-0" />
            </div>
          </div>

          {/* ── Pending Payouts Banner (conditional) ─────────────── */}
          {(summaryHeader.pending_payouts_idr ?? 0) > 0 && (
            <>
              <div className="h-3 bg-gray-50" />
              <div className="bg-white px-5 pt-5 pb-6">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex items-center justify-between shadow-md shadow-emerald-200 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-full transform translate-x-8 -translate-y-8 pointer-events-none" />
                  <div className="relative">
                    <p className="text-emerald-100 text-[11px] font-semibold uppercase tracking-wider">
                      Tersedia untuk Dicairkan ✨
                    </p>
                    <p className="text-white font-extrabold text-xl mt-0.5">
                      {formatRupiah(summaryHeader.pending_payouts_idr ?? 0)}
                    </p>
                  </div>
                  <Link
                    href={route('investor.payouts.index')}
                    className="relative z-10 px-4 py-2 bg-white text-emerald-600 text-sm font-extrabold rounded-full shadow-sm hover:bg-emerald-50 transition-colors"
                  >
                    Cairkan
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* ── Watchlist Quick View ──────────────────────────────── */}
          {watchlist.length > 0 && (
            <>
              <div className="h-3 bg-gray-50" />
              <div className="bg-white px-5 pt-5 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-900">⭐ Watchlist Saya</h2>
                  <Link href={route('investor.wishlist.index')} className="text-emerald-600 text-[13px] font-bold">
                    Lihat Semua
                  </Link>
                </div>
                <div className="space-y-3">
                  {watchlist.slice(0, 3).map((item) => (
                    <div key={item.wishlist_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.fruit_crop?.fruit_type} — {item.fruit_crop?.variant}
                        </p>
                        <p className="text-[11px] text-gray-500">{item.farm?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-bold text-gray-900">{formatRupiah(item.price_idr)}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">{item.expected_roi_percent}% ROI</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Top Trees Widget ──────────────────────────────────── */}
          {cropFilters.length > 0 && (
            <>
              <div className="h-3 bg-gray-50" />
              <div className="bg-white px-5 pt-5 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-1.5">
                    <IconTrophy className="w-5 h-5 text-emerald-600" />
                    Top Trees
                  </h2>
                  <Link href={route('trees.index')} className="text-emerald-500 text-[13px] font-medium">
                    Lihat Semua
                  </Link>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-[17px] leading-snug mb-1">
                    Rutin Investasi di Top Trees
                  </h3>
                  <p className="text-[13px] text-gray-500 leading-snug">
                    Pilihan tree berkualitas yang telah dikurasi Treevest.
                  </p>
                </div>

                {/* Dynamic crop filter tabs from backend keys */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {cropFilters.map((crop) => {
                    const isActive = topTreeFilter === crop;
                    return (
                      <button
                        key={crop}
                        onClick={() => setTopTreeFilter(crop)}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-semibold border transition-colors ${isActive
                          ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {crop}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col">
                  {(topTrees[topTreeFilter] ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">
                      Belum ada pohon tersedia untuk kategori ini.
                    </p>
                  ) : (
                    (topTrees[topTreeFilter] ?? []).map((item, index) => {
                      const rank = index + 1;
                      const isGold = rank === 1;
                      const isSilver = rank === 2;

                      const medalBg = isGold
                        ? 'bg-amber-100 text-amber-600 border-amber-300'
                        : isSilver
                        ? 'bg-gray-100 text-gray-500 border-gray-300'
                        : 'bg-orange-100 text-orange-700 border-orange-300';

                      const logoColors = ['bg-blue-50 text-blue-500', 'bg-amber-50 text-amber-500', 'bg-red-50 text-red-500'];
                      const logoBg = logoColors[index % logoColors.length];

                      return (
                        <Link
                          href={route('trees.show', item.id)}
                          key={item.id}
                          className="flex items-center justify-between py-3.5 px-2 -mx-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 border shadow-sm ${medalBg}`}>
                              {rank}
                            </div>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${logoBg}`}>
                              <IconPlant className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 pr-2">
                              <h4 className="font-semibold text-gray-800 text-[13px] line-clamp-2 leading-snug">
                                {item.name}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-emerald-500 text-[14px]">
                              {item.return}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">1Y Return</p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

           {/* ── Quick Links ───────────────────────────────────────── */}
           <div className="h-3 bg-gray-50" />
           <div className="bg-white px-5 pt-5 pb-6">
             <h2 className="text-sm font-bold text-gray-900 mb-3">Akses Cepat</h2>
             <div className="grid grid-cols-2 gap-3">
               {[
                 { href: route('investor.lots.index'), icon: <IconPlant className="w-5 h-5 text-emerald-600" />, label: 'Lot Marketplace', bg: 'bg-emerald-50' },
                 { href: route('reports.index'), icon: <IconChart className="w-5 h-5 text-indigo-500" />, label: 'Laporan', bg: 'bg-indigo-50' },
                 { href: route('investor.payouts.index'), icon: <IconDollar className="w-5 h-5 text-emerald-500" />, label: 'Payout Saya', bg: 'bg-emerald-50' },
                 { href: route('education.index'), icon: <IconTree className="w-5 h-5 text-orange-500" />, label: 'Edukasi', bg: 'bg-orange-50' },
                 { href: route('encyclopedia.index'), icon: <IconFlash className="w-5 h-5 text-blue-500" />, label: 'Ensiklopedia', bg: 'bg-blue-50' },
               ].map(({ href, icon, label, bg }) => (
                 <Link
                   key={label}
                   href={href}
                   className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors"
                 >
                   <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                     {icon}
                   </div>
                   <span className="text-[13px] font-semibold text-gray-800">{label}</span>
                 </Link>
               ))}
             </div>
           </div>

        </div>{/* end scrollable */}

        {/* ── Fixed Bottom Navigation (reusable component) ─────── */}
        <BottomNav />

      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </AppShellLayout>
  );
}
