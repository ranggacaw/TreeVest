import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import { FormEventHandler, useState } from 'react';
import { Lot, Investment, PageProps } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import LocationHierarchy from '@/Components/LocationHierarchy';

// Icons
import { IconPlant, IconTree, IconDollar, IconChart, IconTrophy, IconInfoCircle } from '@/Components/Icons/AppIcons';

// App Shell Components
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';

interface PriceTableRow {
    month: number;
    price_idr: number;
    is_current?: boolean;
    is_open?: boolean;
}

interface Props {
    lot: Lot;
    priceTable: PriceTableRow[];
    currentCycleMonth: number;
    myInvestment: Investment | null;
    isInvestmentOpen: boolean;
    monthlyRatePercentage: number;
}

export default function Show({ lot, priceTable, currentCycleMonth, myInvestment, isInvestmentOpen, monthlyRatePercentage }: Props) {
    const { t } = useTranslation();
    const page = usePage<PageProps>();
    const unreadCount = page.props.unread_notifications_count ?? 0;
    const { data, setData, post, processing, errors } = useForm({
        trees: '1',
    });

    const [showPriceSchedule, setShowPriceSchedule] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('investor.lots.invest', lot.id));
    };

    const totalAmount = Number(data.trees || 0) * lot.current_price_per_tree_idr;

    return (
        <AppShellLayout>
            <Head title={lot.name} />

            {/* App Shell — mobile-first max-w-md container */}
            <div
                className="relative w-full max-w-md bg-gray-50 flex flex-col"
                style={{ height: '100dvh' }}
            >
                {/* ── Scrollable Area ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>

                    {/* ── Top App Bar (reusable, dynamic notification count) ── */}
                    <AppTopBar notificationCount={unreadCount} />

                    {/* ── Header Section ──────────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                <IconPlant className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-none truncate">
                                    {lot.name}
                                </h1>
                                {lot.fruit_crop && (
                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                        {lot.fruit_crop.variant}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {lot.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Location Hierarchy ─────────────────────────────────── */}
                    {lot.rack?.warehouse?.farm && (
                        <div className="bg-white px-5 pt-5 pb-4">
                            <h2 className="text-sm font-bold text-gray-900 mb-3">Lokasi Investasi</h2>
                            <LocationHierarchy
                                farm={lot.rack.warehouse.farm}
                                warehouse={lot.rack.warehouse}
                                rack={lot.rack}
                                lot={lot}
                                fruitCrop={lot.fruit_crop?.fruit_type ? {
                                    id: lot.fruit_crop.id,
                                    variant: lot.fruit_crop.variant,
                                    fruit_type: {
                                        name: lot.fruit_crop.fruit_type.name,
                                    },
                                } : undefined}
                                compact={false}
                            />
                        </div>
                    )}

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Key Metrics Cards ────────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Informasi Lot</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <IconTree className="w-5 h-5 text-green-600" />
                                    <p className="text-[10px] text-green-500 uppercase tracking-wide font-semibold">
                                        Total Pohon
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-green-900">{lot.total_trees}</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <IconDollar className="w-5 h-5 text-emerald-600" />
                                    <p className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold">
                                        Harga/Pohon
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-green-900">
                                    {formatRupiah(lot.current_price_per_tree_idr)}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <IconChart className="w-5 h-5 text-green-600" />
                                    <p className="text-[10px] text-green-700 uppercase tracking-wide font-semibold">
                                        Siklus
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-green-900">
                                    {currentCycleMonth} / {lot.cycle_months} bln
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <IconTrophy className="w-5 h-5 text-green-600" />
                                    <p className="text-[10px] text-green-700 uppercase tracking-wide font-semibold">
                                        Investor
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-green-900">
                                    {lot.investments_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Pricing Info ────────────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h2 className="text-sm font-bold text-gray-900 mb-4">Informasi Harga</h2>

                        {/* Pricing Alert */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <IconInfoCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-amber-800 mb-1">
                                        Harga Dinamis
                                    </p>
                                    <p className="text-[13px] text-amber-900 leading-snug">
                                        Harga per pohon meningkat <span className="font-bold text-amber-700">{monthlyRatePercentage}%</span> setiap bulan. Invest lebih awal untuk harga lebih baik!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Current Price Display */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-emerald-100 text-[11px] font-semibold uppercase tracking-wider mb-1">
                                        Harga Saat Ini
                                    </p>
                                    <p className="text-2xl font-extrabold">
                                        {formatRupiah(lot.current_price_per_tree_idr)}
                                    </p>
                                    <p className="text-emerald-200 text-xs mt-1">
                                        per pohon
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-100 text-[11px] font-semibold">
                                        Bulan {currentCycleMonth}
                                    </p>
                                </div>
                            </div>

                            {/* Calculation Preview */}
                            <div className="bg-white/10 rounded-xl p-3">
                                <div className="space-y-1.5 text-[13px]">
                                    <div className="flex justify-between">
                                        <span className="text-emerald-100">Harga Dasar</span>
                                        <span className="font-semibold text-white">
                                            {formatRupiah(priceTable[1]?.price_idr || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-100">Kenaikan Bulanan</span>
                                        <span className="font-semibold text-white">{monthlyRatePercentage}%</span>
                                    </div>
                                    {priceTable[currentCycleMonth + 1] && (
                                        <div className="flex justify-between pt-1.5 border-t border-emerald-400/30">
                                            <span className="text-emerald-100">Harga Bulan Depan</span>
                                            <span className="font-semibold text-white">
                                                {formatRupiah(priceTable[currentCycleMonth + 1].price_idr)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── Price Schedule Toggle ────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-4">
                        <button
                            onClick={() => setShowPriceSchedule(!showPriceSchedule)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <IconChart className="w-5 h-5 text-gray-700" />
                                <span className="text-sm font-bold text-gray-900">
                                    Jadwal Harga Penuh
                                </span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-gray-500 transform transition-transform ${showPriceSchedule ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Price Schedule Table */}
                    {showPriceSchedule && (
                        <div className="bg-white px-5 pt-2 pb-6">
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                {Object.values(priceTable).map((row) => (
                                    <div
                                        key={row.month}
                                        className={`flex justify-between items-center px-4 py-2.5 text-sm ${row.month === currentCycleMonth ? 'bg-emerald-100' : ''
                                            } ${row.month < currentCycleMonth ? 'text-gray-400' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold w-16">
                                                Bln {row.month}
                                            </span>
                                            {row.month === currentCycleMonth && (
                                                <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded">
                                                    Saat Ini
                                                </span>
                                            )}
                                            {!row.is_open && (
                                                <span className="text-[10px] text-gray-500">
                                                    (Tutup)
                                                </span>
                                            )}
                                        </div>
                                        <span className={`font-bold ${row.month === currentCycleMonth ? 'text-emerald-700' : 'text-gray-700'}`}>
                                            {formatRupiah(row.price_idr)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* ── My Investment Status ──────────────────────────────── */}
                    {myInvestment ? (
                        <div className="bg-emerald-50 px-5 pt-5 pb-6 border-b border-emerald-100">
                            <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <IconTrophy className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            Anda sudah berinvestasi di lot ini
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Status: <span className="font-semibold text-emerald-600">{myInvestment.status.replace('_', ' ')}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                                            Jumlah Investasi
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatRupiah(myInvestment.amount_idr)}
                                        </p>
                                    </div>
                                    <Link
                                        href={route('investments.show', myInvestment.id)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors"
                                    >
                                        Lihat Detail
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : isInvestmentOpen ? (
                        <div className="bg-white px-5 pt-5 pb-6">
                            <h2 className="text-sm font-bold text-gray-900 mb-4">Beli Lot Ini</h2>
                            <form onSubmit={submit}>
                                {/* Tree Quantity Selector */}
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        Jumlah Pohon
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setData('trees', Math.max(1, Number(data.trees) - 1).toString())}
                                            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 font-bold text-lg hover:bg-gray-200 transition-colors"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={lot.available_trees}
                                            value={data.trees}
                                            onChange={(e) => setData('trees', e.target.value)}
                                            className="flex-1 text-center bg-gray-50 border-gray-200 rounded-xl py-2 text-lg font-bold focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setData('trees', Math.min(lot.available_trees, Number(data.trees) + 1).toString())}
                                            className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {errors.trees && (
                                        <p className="text-red-500 text-xs mt-1.5">{errors.trees}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Tersedia: {lot.available_trees} dari {lot.total_trees} pohon
                                    </p>
                                </div>

                                {/* Total Amount */}
                                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white mb-4">
                                    <p className="text-emerald-100 text-[11px] font-semibold uppercase tracking-wider mb-1">
                                        Total Investasi
                                    </p>
                                    <p className="text-2xl font-extrabold">
                                        {formatRupiah(totalAmount)}
                                    </p>
                                </div>

                                {/* Invest Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full px-4 py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200"
                                >
                                    {processing ? 'Memproses...' : 'Investasi Sekarang'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 px-5 pt-5 pb-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <IconInfoCircle className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">
                                    Window Investasi Ditutup
                                </h3>
                                <p className="text-[13px] text-gray-500 leading-snug mb-4">
                                    Lot ini sudah melewati periode investasi maksimum atau sedang dalam proses panen.
                                </p>
                                <Link
                                    href={route('investor.lots.index')}
                                    className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors"
                                >
                                    Cari Lot Lainnya
                                </Link>
                            </div>
                        </div>
                    )}

                </div>{/* end scrollable */}

                {/* ── Fixed Bottom Navigation (reusable component) ─────── */}
                <BottomNav activeTab="portfolio" />

            </div>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
