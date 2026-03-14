import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';
import {
    IconArrowLeft,
    IconFilter,
    IconTrophy,
    IconFlash,
    IconInfoCircle,
    IconTree,
    IconBell,
    IconSearch,
    IconX
} from '@/Components/Icons/AppIcons';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { formatRupiah } from '@/utils/currency';
import { useState, useEffect, useRef } from 'react';

export default function Index({ trees, filters = {}, auth, wishlistedTreeIds = [] }: PageProps<{ trees: any, filters?: any, wishlistedTreeIds?: number[] }>) {
    const { t } = useTranslation('trees');
    const [activePeriod, setActivePeriod] = useState('1 Year');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const page = usePage();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

    const periods = ['1 Year', '2 Years', '3 Years', '5 Years'];
    const sortOptions = [
        { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
        { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
        { value: 'roi_asc', label: 'ROI: Rendah ke Tinggi' },
        { value: 'roi_desc', label: 'ROI: Tinggi ke Rendah' },
        { value: 'newest', label: 'Terbaru' },
    ];

    const { data, setData } = useForm({
        fruit_type: filters?.fruit_type || '',
        variant: filters?.variant || '',
        risk_rating: filters?.risk_rating || '',
        harvest_cycle: filters?.harvest_cycle || '',
        sort: filters?.sort || '',
    });

    const buildQueryParams = () => {
        const params: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        if (searchQuery) params['search'] = searchQuery;
        return params;
    };

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            const currentParams = new URLSearchParams(window.location.search);
            if (searchQuery !== currentParams.get('search')) {
                router.get(route('trees.index'), buildQueryParams(), { 
                    preserveState: true,
                    preserveScroll: true 
                });
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const handleSortChange = (sortValue: string) => {
        setData('sort' as keyof typeof data, sortValue);
        router.get(route('trees.index'), { ...buildQueryParams(), sort: sortValue }, { 
            preserveState: true,
            preserveScroll: true 
        });
        setShowSortModal(false);
    };

    const handleFilterChange = (key: string, value: string) => {
        setData(key as keyof typeof data, value);
    };

    const applyFilters = () => {
        router.get(route('trees.index'), buildQueryParams(), { 
            preserveState: true,
            preserveScroll: true 
        });
        setShowFilterModal(false);
    };

    const clearFilters = () => {
        setData({
            fruit_type: '',
            variant: '',
            risk_rating: '',
            harvest_cycle: '',
            sort: '',
        });
        setSearchQuery('');
        router.get(route('trees.index'), {}, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const toggleCompare = (treeId: number) => {
        if (selectedForCompare.includes(treeId)) {
            setSelectedForCompare(selectedForCompare.filter(id => id !== treeId));
        } else if (selectedForCompare.length < 3) {
            setSelectedForCompare([...selectedForCompare, treeId]);
        }
    };

    return (
        <AppShellLayout>
            <Head title={t('marketplace')} />

            <div className="relative w-full max-w-md mx-auto bg-[#F0F7F4] flex flex-col" style={{ height: '100dvh' }}>
                {/* Header */}
                <div className="sticky top-0 z-40 bg-[#F0F7F4] px-5 pt-4 pb-4 flex items-center justify-between border-b border-gray-100/50">
                    <Link href={route('dashboard')} className="p-1 -ml-1 text-gray-800">
                        <IconArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-800">Marketplace</h1>
                    <Link href={route('notifications.index')} className="relative p-2 text-gray-600">
                        <IconBell />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white font-bold flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <div className="px-5 pt-4">
                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <IconSearch className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari pohon atau kebun..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl text-sm border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <IconX className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Hero Card - Clickable */}
                        <Link
                            href={route('encyclopedia.index')}
                            className="block bg-white rounded-2xl p-5 mb-6 flex items-start gap-4 shadow-sm border border-emerald-50 active:scale-[0.98] transition-transform"
                        >
                            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                                <IconTree className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Pasar Pohon</h2>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Investasi aman dengan bagi hasil panen yang kompetitif dan berkelanjutan.
                                </p>
                            </div>
                        </Link>

                        {/* Toolbar */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                            <button 
                                onClick={() => setShowFilterModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-xs font-semibold text-gray-600 shadow-sm border border-gray-100 whitespace-nowrap active:scale-95 transition-transform"
                            >
                                <IconFilter className="w-3.5 h-3.5" />
                                Filter
                            </button>
                            <button 
                                onClick={() => setShowSortModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-xs font-semibold text-gray-600 shadow-sm border border-gray-100 whitespace-nowrap active:scale-95 transition-transform"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                Urutkan
                            </button>
                            <button 
                                onClick={() => setCompareMode(!compareMode)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap active:scale-95 transition-transform ${
                                    compareMode 
                                    ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600' 
                                    : 'bg-white text-gray-600 shadow-sm border border-gray-100'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10l-4-4m4 4l4-4M19 7v10m0-10l-4 4m4-4l4 4" />
                                </svg>
                                Bandingkan
                            </button>
                        </div>

                        {/* ROI Period Selector - Clickable */}
                        <div className="flex justify-between items-center mb-4 mt-2 relative">
                            <span className="text-sm font-semibold text-gray-500">Estimasi ROI</span>
                            <button 
                                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                                className="flex items-center gap-1 text-sm font-bold text-emerald-600 active:scale-95 transition-transform"
                            >
                                {activePeriod}
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showPeriodDropdown && (
                                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-[140px]">
                                    {periods.map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => {
                                                setActivePeriod(period);
                                                setShowPeriodDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 ${
                                                activePeriod === period ? 'text-emerald-600 font-semibold' : 'text-gray-600'
                                            }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tree List */}
                        <div className="space-y-4">
                            {trees.data.length > 0 ? (
                                trees.data.map((tree: any) => {
                                    const crop = tree.fruit_crop;
                                    const farm = crop?.farm;
                                    const isSelected = selectedForCompare.includes(tree.id);

                                    return (
                                        <div
                                            key={tree.id}
                                            className={`bg-white rounded-2xl shadow-sm border overflow-hidden active:scale-[0.98] transition-transform ${
                                                compareMode && isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'
                                            }`}
                                        >
                                            {compareMode && (
                                                <div className="p-3 border-b border-gray-50 flex justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            toggleCompare(tree.id);
                                                        }}
                                                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                                                            isSelected 
                                                            ? 'bg-emerald-600 border-emerald-600' 
                                                            : 'border-gray-300 hover:border-emerald-400'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            
                                            <Link href={route('trees.show', tree.id)}>
                                                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                                            {farm?.image_url ? (
                                                                <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <IconTree className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                                                                {farm?.name || 'Farm Name'}
                                                            </h3>
                                                            <div className="text-[10px] text-gray-400 uppercase font-semibold">
                                                                {crop?.variant} • {crop?.fruit_type?.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <IconFlash className="w-4 h-4 text-emerald-400" />
                                                        <div className="bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                            <IconTrophy className="w-3 h-3" />
                                                            Top
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 grid grid-cols-3 gap-2">
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 font-medium mb-1">Return Panen</div>
                                                        <div className="text-sm font-bold text-emerald-500 flex items-center gap-0.5">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                            {tree.expected_roi_percent}%
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 font-medium mb-1">Siklus Panen</div>
                                                        <div className="text-sm font-bold text-gray-700 capitalize">
                                                            {crop?.harvest_cycle}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 font-medium mb-1">Harga / Pohon</div>
                                                        <div className="text-sm font-bold text-gray-700">
                                                            {formatRupiah(tree.price_idr)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                                    <IconInfoCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-sm font-bold text-gray-800">{t('no_trees_found')}</h3>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {t('try_adjusting_filters')}
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {trees.links && trees.links.length > 3 && (
                                <div className="mt-6 mb-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                                    {trees.prev_page_url ? (
                                        <Link
                                            href={trees.prev_page_url}
                                            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gray-50 border border-gray-100 rounded-lg text-gray-300 cursor-not-allowed">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </span>
                                    )}

                                    {Array.from({ length: trees.last_page }, (_, i) => i + 1).map((pageNum) => {
                                        const shouldShowPage = () => {
                                            if (pageNum === 1 || pageNum === trees.last_page) return true;
                                            if (Math.abs(pageNum - trees.current_page) <= 1) return true;
                                            if (pageNum % 4 === 1 && pageNum < trees.last_page - 2) return true;
                                            return false;
                                        };

                                        const shouldShowEllipsisBefore = () => {
                                            if (pageNum === 1) return false;
                                            if (pageNum === 2 && trees.current_page > 4) return true;
                                            if (pageNum > 2 && pageNum < trees.current_page - 1 && pageNum % 4 === 1) return true;
                                            return false;
                                        };

                                        const isActive = pageNum === trees.current_page;
                                        const link = trees.links.find((l: any) => l.label === String(pageNum));

                                        if (shouldShowEllipsisBefore() && pageNum === 2) {
                                            return (
                                                <span key={`ellipsis-start-${pageNum}`} className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-gray-400">
                                                    ...
                                                </span>
                                            );
                                        }

                                        if (pageNum > trees.current_page + 1 && pageNum % 4 === 1 && pageNum < trees.last_page - 1) {
                                            return (
                                                <span key={`ellipsis-mid-${pageNum}`} className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-gray-400">
                                                    ...
                                                </span>
                                            );
                                        }

                                        if (!shouldShowPage()) return null;

                                        if (link?.url) {
                                            return (
                                                <Link
                                                    key={pageNum}
                                                    href={link.url}
                                                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95 ${
                                                        isActive
                                                            ? 'bg-emerald-600 text-white shadow-emerald-200'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </Link>
                                            );
                                        }

                                        return (
                                            <span
                                                key={pageNum}
                                                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-sm font-medium ${
                                                    isActive
                                                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                                                        : 'bg-gray-50 text-gray-300'
                                                }`}
                                            >
                                                {pageNum}
                                            </span>
                                        );
                                    })}

                                    {trees.next_page_url ? (
                                        <Link
                                            href={trees.next_page_url}
                                            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gray-50 border border-gray-100 rounded-full text-gray-300 cursor-not-allowed">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <BottomNav />

                {/* Filter Modal */}
                {showFilterModal && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilterModal(false)} />
                        <div className="relative bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Filter</h3>
                                <button onClick={() => setShowFilterModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                    <IconX className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Tipe Buah</label>
                                    <select
                                        value={data.fruit_type}
                                        onChange={(e) => handleFilterChange('fruit_type', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">Semua Tipe</option>
                                        <option value="durian">Durian</option>
                                        <option value="mango">Mangga</option>
                                        <option value="grapes">Anggur</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Siklus Panen</label>
                                    <select
                                        value={data.harvest_cycle}
                                        onChange={(e) => handleFilterChange('harvest_cycle', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">Semua Siklus</option>
                                        <option value="annual">Tahunan</option>
                                        <option value="bi-annual">Dua Tahunan</option>
                                        <option value="seasonal">Musiman</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Tingkat Risiko</label>
                                    <select
                                        value={data.risk_rating}
                                        onChange={(e) => handleFilterChange('risk_rating', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">Semua Tingkat</option>
                                        <option value="low">Rendah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="high">Tinggi</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 px-4 py-3 bg-emerald-600 rounded-xl text-sm font-semibold text-white"
                                >
                                    Terapkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sort Modal */}
                {showSortModal && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowSortModal(false)} />
                        <div className="relative bg-white rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Urutkan</h3>
                                <button onClick={() => setShowSortModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                    <IconX className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium ${
                                            data.sort === option.value 
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                            : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Compare Bar */}
                {compareMode && selectedForCompare.length > 0 && (
                    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg z-40">
                        <span className="text-white text-xs font-medium">{selectedForCompare.length} dipilih</span>
                        <button
                            onClick={() => {
                                setCompareMode(false);
                                setSelectedForCompare([]);
                            }}
                            className="text-white/70 hover:text-white"
                        >
                            <IconX className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <style>{`::-webkit-scrollbar { display: none; } * { -webkit-tap-highlight-color: transparent; }`}</style>
        </AppShellLayout>
    );
}
