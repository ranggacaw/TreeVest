import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, MarketListing } from '@/types';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { IconTree, IconFlash, IconDollar, IconCheck, IconArrowLeft } from '@/Components/Icons/AppIcons';

interface Props extends PageProps {
    listing: MarketListing;
    isOwner: boolean;
    isBuyer: boolean;
    canPurchase: boolean;
    canCancel: boolean;
}

export default function Show({ listing, isOwner, isBuyer, canPurchase, canCancel }: Props) {
    const { flash } = usePage().props as any;
    const page = usePage();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

    return (
        <AppShellLayout>
            <Head title={`Pohon #${listing.id}`} />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                             <Link href={route('secondary-market.index')} className="p-2 -ml-2 text-gray-900">
                                <IconArrowLeft className="w-6 h-6" />
                             </Link>
                             <h1 className="text-lg font-bold text-gray-900">Detail Listing</h1>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="m-5 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-xs text-emerald-700 font-bold">{flash.success}</p>
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="bg-white px-5 py-8 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                            <IconTree className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                            {listing.investment?.tree?.identifier ?? `Pohon #${listing.id}`}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                            <span className="text-emerald-600 uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                                {listing.investment?.tree?.fruit_type?.name}
                            </span>
                            <span>•</span>
                            <span>{listing.investment?.tree?.fruit_crop?.variant}</span>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Price Section */}
                    <div className="bg-white px-6 py-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-1">Harga Jual</p>
                                <p className="text-2xl font-black text-emerald-600">
                                    {formatRupiah(listing.ask_price_cents)}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                                {listing.status}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">Platform Fee ({(listing.platform_fee_rate * 100).toFixed(0)}%)</span>
                                <span className="text-sm text-gray-900 font-bold">-{formatRupiah(listing.platform_fee_cents)}</span>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-900 font-bold">Net Proceeds</span>
                                <span className="text-lg text-emerald-700 font-black">{formatRupiah(listing.net_proceeds_cents)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Tree Info */}
                    <div className="bg-white px-6 py-6 pb-20">
                         <h3 className="text-sm font-bold text-gray-900 mb-4">Informasi Pohon</h3>
                         <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Lokasi Farm</span>
                                <span className="text-sm text-gray-900 font-bold">{listing.investment?.tree?.fruit_crop?.farm?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Estimasi ROI</span>
                                <span className="text-sm font-bold text-orange-600 flex items-center gap-1">
                                    <IconFlash className="w-4 h-4" />
                                    {listing.investment?.tree?.expected_roi_percent}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Risk Rating</span>
                                <span className="text-sm text-gray-900 font-bold bg-gray-50 px-3 py-0.5 rounded-full uppercase tracking-tighter">
                                    {listing.investment?.tree?.risk_rating}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Penjual</span>
                                <div className="flex items-center gap-2">
                                     <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                        {listing.seller?.name?.charAt(0)}
                                    </div>
                                    <span className="text-sm text-gray-900 font-bold">{listing.seller?.name}</span>
                                </div>
                            </div>
                         </div>

                         {listing.notes && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-[11px] text-gray-400 font-bold uppercase mb-2">Catatan Penjual</p>
                                <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed italic">
                                    "{listing.notes}"
                                </div>
                            </div>
                         )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 flex gap-3 pb-8 z-30">
                    {canCancel && (
                        <Link
                            href={route('investments.show', listing.investment_id)}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 font-extrabold text-sm rounded-2xl flex items-center justify-center active:bg-gray-200 transition-colors"
                        >
                            Ke Investasi
                        </Link>
                    )}

                    {canCancel && (
                        <Link
                            method="delete"
                            href={route('secondary-market.destroy', listing.id)}
                            className="flex-1 py-4 bg-red-50 text-red-600 font-extrabold text-sm rounded-2xl flex items-center justify-center active:bg-red-100 transition-colors"
                        >
                            Tarik Listing
                        </Link>
                    )}

                    {canPurchase && listing.status === 'active' && (
                        <Link
                            href={route('secondary-market.purchase.store', listing.id)}
                            method="post"
                            className="flex-1 py-4 bg-emerald-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                        >
                            Beli Sekarang
                        </Link>
                    )}

                    {!isOwner && !canPurchase && listing.status === 'active' && (
                        <Link
                            href={route('kyc.index')}
                            className="flex-1 py-4 bg-amber-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 active:scale-95 transition-all"
                        >
                            Verifikasi KYC
                        </Link>
                    )}
                </div>
            </div>
            
            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
