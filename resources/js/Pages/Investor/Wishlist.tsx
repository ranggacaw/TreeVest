import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, WishlistItem } from '@/types';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { IconPlant } from '@/Components/Icons/AppIcons';
import WishlistToggleButton from '@/Components/WishlistToggleButton';

interface Props extends PageProps {
    items: WishlistItem[];
}

export default function Wishlist({ items }: Props) {
    const page = usePage();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

    return (
        <AppShellLayout>
            <Head title="Wishlist Saya" />
            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unreadCount} />

                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-extrabold text-gray-900">Wishlist Saya</h1>
                            <span className="text-sm font-bold text-gray-500">{items.length} Pohon</span>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-500 mb-4">Belum ada wishlist.</p>
                                <Link
                                    href={route('trees.index')}
                                    className="inline-block px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-emerald-700 transition-colors"
                                >
                                    Cari Pohon
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {items.map((item) => (
                                    <div key={item.wishlist_id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                    <IconPlant className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0 pr-8">
                                                    <h3 className="font-bold text-gray-900 text-sm truncate">{item.fruit_crop.variant}</h3>
                                                    <p className="text-[11px] text-gray-500 truncate">{item.farm.name}</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 z-10">
                                                <WishlistToggleButton
                                                    treeId={item.id}
                                                    isWishlisted={true}
                                                    authenticated={true}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-t border-gray-50 mt-2">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Harga</p>
                                                <p className="text-sm font-bold text-gray-900">{formatRupiah(item.price_cents)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">ROI</p>
                                                <p className="text-sm font-bold text-emerald-600">{item.expected_roi_percent}%</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-50">
                                            <Link
                                                href={route('trees.show', item.id)}
                                                className="py-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                                            >
                                                Detail
                                            </Link>
                                            <Link
                                                href={route('investments.configure', item.id)}
                                                className="py-2 text-center text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
                                            >
                                                Beli
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <BottomNav />
            </div>
            <style>{`::-webkit-scrollbar { display: none; } * { -webkit-tap-highlight-color: transparent; }`}</style>
        </AppShellLayout>
    );
}
