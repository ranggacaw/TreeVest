import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import { useState, FormEventHandler } from 'react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';

// Icons
import { 
    IconTree, 
    IconFilter, 
    IconSearch, 
    IconTrophy,
    IconX
} from '@/Components/Icons/AppIcons';

// App Shell Components
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';

interface Props extends PageProps {
    trees: any;
    filters?: {
        search?: string;
        fruit_type?: string;
        variant?: string;
        risk_rating?: string;
        harvest_cycle?: string;
        sort?: string;
    };
    wishlistedTreeIds?: number[];
}

export default function Index({ trees, filters, wishlistedTreeIds = [] }: Props) {
    const { t, ready } = useTranslation('trees');
    const page = usePage<PageProps>();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

    // Ensure wishlistedTreeIds is always an array of numbers
    const safeWishlistedIds = Array.isArray(wishlistedTreeIds)
        ? wishlistedTreeIds.filter((id): id is number => typeof id === 'number')
        : [];

    const [showFilters, setShowFilters] = useState(false);

    // Safely parse filters, handling the case where PHP sends [] instead of {} for empty associative arrays
    const safeFilters = filters && typeof filters === 'object' && !Array.isArray(filters) ? filters : {};

    const [search, setSearch] = useState(safeFilters.search || '');
    const [fruitType, setFruitType] = useState(safeFilters.fruit_type || '');
    const [harvestCycle, setHarvestCycle] = useState(safeFilters.harvest_cycle || '');
    const [riskRating, setRiskRating] = useState(safeFilters.risk_rating || '');
    const [sortValue, setSortValue] = useState(safeFilters.sort || '');

    const treesData = Array.isArray(trees?.data) ? trees.data : [];
    const treesTotal = typeof trees?.total === 'number' ? trees.total : 0;
    const treesLastPage = typeof trees?.last_page === 'number' ? trees.last_page : 1;
    const treesLinks = Array.isArray(trees?.links) ? trees.links : [];

    // Show loading state while translations are being loaded
    if (!ready) {
        return (
            <AppShellLayout>
                <Head title="Loading..." />
                <div className="relative w-full max-w-md mx-auto bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 text-sm">Loading marketplace...</p>
                        </div>
                    </div>
                </div>
            </AppShellLayout>
        );
    }

    if (!trees || typeof trees !== 'object') {
        return (
            <AppShellLayout>
                <Head title={t('marketplace')} />
                <div className="relative w-full max-w-md mx-auto bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Unable to load trees data</p>
                    </div>
                </div>
            </AppShellLayout>
        );
    }

    const handleFilter: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('trees.index'),
            {
                search: search || undefined,
                fruit_type: fruitType || undefined,
                harvest_cycle: harvestCycle || undefined,
                risk_rating: riskRating || undefined,
                sort: sortValue || undefined,
            },
            { preserveState: true }
        );
    };

    const clearFilters = () => {
        setSearch('');
        setFruitType('');
        setHarvestCycle('');
        setRiskRating('');
        setSortValue('');
        setShowFilters(false);
        router.get(route('trees.index'));
    };

    return (
        <AppShellLayout>
            <Head title={t('marketplace')} />

            {/* App Shell — mobile-first max-w-md container */}
            <div
                className="relative w-full max-w-md mx-auto bg-gray-50 flex flex-col"
                style={{ height: '100dvh' }}
            >
                {/* ── Scrollable Area ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>

                    {/* ── Top App Bar (reusable, dynamic notification count) ── */}
                    <AppTopBar notificationCount={unreadCount} />

                    {/* ── Header Section ──────────────────────────────────── */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-[20px] font-extrabold text-gray-900 mb-1">
                                    Pohon Marketplace
                                </h1>
                                <p className="text-[13px] text-gray-500 mt-1 leading-snug">
                                    Investasi aman dengan bagi hasil panen
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 ml-4"
                            >
                                <IconFilter className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari pohon atau kebun..."
                                className="w-full bg-gray-50 border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleFilter(e as any);
                                    }
                                }}
                            />
                            <IconSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            {search && (
                                <button
                                    onClick={() => { setSearch(''); router.get(route('trees.index')); }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <IconX className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Panel (collapsible) */}
                    {showFilters && (
                        <div className="bg-white px-5 pb-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Tipe Buah
                                    </label>
                                    <select
                                        value={fruitType}
                                        onChange={(e) => setFruitType(e.target.value)}
                                        className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                                    >
                                        <option value="">Semua Tipe</option>
                                        <option value="durian">Durian</option>
                                        <option value="mango">Mangga</option>
                                        <option value="grapes">Anggur</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Siklus Panen
                                    </label>
                                    <select
                                        value={harvestCycle}
                                        onChange={(e) => setHarvestCycle(e.target.value)}
                                        className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                                    >
                                        <option value="">Semua Siklus</option>
                                        <option value="annual">Tahunan</option>
                                        <option value="bi-annual">Dua Tahunan</option>
                                        <option value="seasonal">Musiman</option>
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Tingkat Risiko
                                        </label>
                                        <select
                                            value={riskRating}
                                            onChange={(e) => setRiskRating(e.target.value)}
                                            className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                                        >
                                            <option value="">Semua</option>
                                            <option value="low">Rendah</option>
                                            <option value="medium">Sedang</option>
                                            <option value="high">Tinggi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Urutkan
                                        </label>
                                        <select
                                            value={sortValue}
                                            onChange={(e) => setSortValue(e.target.value)}
                                            className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                                        >
                                            <option value="">Pilih</option>
                                            <option value="price_asc">Harga Terendah</option>
                                            <option value="price_desc">Harga Tertinggi</option>
                                            <option value="roi_asc">ROI Terendah</option>
                                            <option value="roi_desc">ROI Tertinggi</option>
                                            <option value="newest">Terbaru</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleFilter}
                                        className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                                    >
                                        Terapkan Filter
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Filters Display */}
                    {(fruitType || harvestCycle || riskRating || sortValue || search) && (
                        <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-emerald-800">Filter aktif:</span>
                                {search && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                        "{search}"
                                    </span>
                                )}
                                {fruitType && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 capitalize">
                                        {fruitType}
                                    </span>
                                )}
                                {harvestCycle && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 capitalize">
                                        {harvestCycle.replace('-', ' ')}
                                    </span>
                                )}
                                {riskRating && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 capitalize">
                                        Risiko: {riskRating}
                                    </span>
                                )}
                                {sortValue && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                        Urutan Aktif
                                    </span>
                                )}
                                <button
                                    onClick={clearFilters}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                                >
                                    Hapus Semua
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section divider */}
                    <div className="h-3 bg-gray-50" />

                    {/* Results Count */}
                    <div className="bg-white px-5 pt-4 pb-2">
                        <p className="text-sm text-gray-600 font-medium">
                            Menampilkan <span className="font-bold text-gray-900">{treesData.length}</span> dari <span className="font-bold text-gray-900">{treesTotal}</span> pohon
                        </p>
                    </div>

                    {/* Trees List */}
                    {treesData.length > 0 ? (
                        <div className="bg-white px-5 pt-5 pb-6 min-h-[50vh]">
                            {treesData.map((tree: any, index: number) => {
                                const crop = tree.fruit_crop;
                                const farm = crop?.farm;
                                if (!tree || !tree.id) return null;
                                return (
                                    <div key={tree.id}>
                                        <Link
                                            href={route('trees.show', tree.id)}
                                            className="block p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors mb-3"
                                        >
                                            {/* Tree Header */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden border border-gray-200">
                                                    {farm?.image_url ? (
                                                        <img src={farm.image_url} alt={farm.name || 'Farm'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <IconTree className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="font-bold text-gray-900 text-sm truncate">
                                                            {farm?.name || 'Farm Name'}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate uppercase font-semibold">
                                                        {crop?.variant} • {crop?.fruit_type?.name}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Key Metrics Grid */}
                                            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                                                        Return Panen
                                                    </p>
                                                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                        {tree.expected_roi_percent ?? 0}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                                                        Siklus Panen
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900 capitalize">
                                                        {crop?.harvest_cycle || '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                                                        Harga/Pohon
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {formatRupiah(tree.price_idr || 0)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* CTA Arrow */}
                                            <div className="flex justify-end mt-3 pt-2">
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                    Lihat Detail
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </Link>

                                        {/* Item divider (not on last item) */}
                                        {index < treesData.length - 1 && (
                                            <div className="h-px bg-gray-100 mx-4" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white px-5 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IconTree className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">
                                Belum ada pohon tersedia
                            </h3>
                            <p className="text-[13px] text-gray-500 leading-snug mb-4">
                                Coba sesuaikan filter atau cek lagi nanti untuk peluang investasi baru.
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors"
                            >
                                Hapus Filter
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {treesLastPage > 1 && (
                        <div className="bg-white px-5 pt-4 pb-6">
                            <div className="flex justify-center items-center gap-2 flex-wrap">
                                {treesLinks.map((link: any, index: number) => {
                                    // Skip invalid links
                                    if (!link || typeof link !== 'object') return null;
                                    // Skip Previous/Next buttons without URL
                                    if ((link.label?.includes('Previous') || link.label?.includes('Next')) && !link.url) return null;

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                                                link.active
                                                    ? 'bg-emerald-600 text-white'
                                                    : link.url
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: String(link.label || '') }}
                                            preserveState
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
