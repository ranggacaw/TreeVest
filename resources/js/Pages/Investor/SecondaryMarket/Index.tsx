import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, MarketListing } from '@/types';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { IconTree, IconFlash, IconSearch, IconFilter } from '@/Components/Icons/AppIcons';
import { useState } from 'react';

interface Props extends PageProps {
    listings: {
        data: any[]; // MarketListing[] but with some extra props from transforms
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: Record<string, unknown>;
    canCreateListing: boolean;
}

export default function Index({ listings, filters, canCreateListing }: Props) {
    const { flash } = usePage().props as any;
    const page = usePage();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;
    const [search, setSearch] = useState('');

    return (
        <AppShellLayout>
            <Head title="Pasar Sekunder" />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unreadCount} />

                    {/* Header */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-[20px] font-extrabold text-gray-900">Pasar Sekunder</h1>
                            {canCreateListing && (
                                <Link 
                                    href={route('secondary-market.create')}
                                    className="text-[13px] text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full"
                                >
                                    Jual Pohon
                                </Link>
                            )}
                        </div>
                        <p className="text-[13px] text-gray-500 leading-snug">
                            Beli pohon dari investor lain untuk hasil yang lebih cepat.
                        </p>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Search & Filter */}
                    <div className="bg-white px-5 py-4 sticky top-0 z-10 border-b border-gray-100 flex gap-2">
                        <div className="relative flex-1">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Cari jenis pohon atau farm..."
                                className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 active:bg-gray-100 transition-colors">
                            <IconFilter className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mx-5 mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-xs text-emerald-700 font-bold">{flash.success}</p>
                        </div>
                    )}

                    {/* Listings */}
                    <div className="px-5 py-6">
                        {listings.data.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <IconTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-sm text-gray-500 font-medium">Belum ada pilihan pohon tersedia.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {listings.data.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        href={route('secondary-market.show', listing.id)}
                                        className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-all hover:border-emerald-200"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <IconTree className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                                                        {listing.investment?.tree?.identifier ?? `Tree #${listing.id}`}
                                                    </h3>
                                                    <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
                                                        {listing.investment?.tree?.fruit_crop?.variant} • {listing.investment?.tree?.fruit_type?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[16px] font-extrabold text-gray-900">
                                                    {formatRupiah(listing.ask_price_idr)}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Ask Price</p>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-50 mb-4" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Lokasi Farm</p>
                                                <p className="text-[12px] font-bold text-gray-700 truncate">
                                                    {listing.investment?.tree?.fruit_crop?.farm?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Est. ROI</p>
                                                <div className="flex items-center justify-end gap-1">
                                                    <IconFlash className="w-3 h-3 text-orange-500" />
                                                    <p className="text-[12px] font-bold text-orange-600">
                                                        {listing.investment?.tree?.expected_roi_percent}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    {listing.seller?.name?.charAt(0)}
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium">{listing.seller?.name}</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-emerald-600">Beli Sekarang →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {listings.last_page > 1 && (
                            <div className="flex justify-center mt-8 gap-1">
                                {listings.links.map((link: any, i: number) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${link.active ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 py-1.5 text-xs rounded-lg text-gray-300 font-bold"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                </div>
                <BottomNav />
            </div>
            
            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
