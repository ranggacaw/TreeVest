import React, { useState, FormEventHandler } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import { PageProps, Farm } from '@/types';
import { useTranslation } from 'react-i18next';

// Icons
import { Search, Map as MapIcon, Filter, X, MapPin, ThermometerSun, Leaf } from 'lucide-react';

// App Shell Components
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';

interface Props extends PageProps {
  farms: {
    data: Farm[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: any[];
  };
  filters: {
    search?: string;
    country?: string;
    climate?: string;
  };
  options: {
    countries: string[];
    climates: string[];
  };
}

export default function Index({ farms, filters, options }: Props) {
  const { t } = useTranslation('farms');
  const page = usePage<PageProps>();
  const unreadCount = (page.props as any).unread_notifications_count ?? 0;

  const [showFilters, setShowFilters] = useState(false);

  // Safely parse filters, handling the case where PHP sends [] instead of {} for empty associative arrays
  const safeFilters = filters && typeof filters === 'object' && !Array.isArray(filters) ? filters : {};

  const [search, setSearch] = useState(safeFilters.search || '');
  const [country, setCountry] = useState(safeFilters.country || '');
  const [climate, setClimate] = useState(safeFilters.climate || '');

  const farmsData = farms?.data ?? [];
  const farmsTotal = farms?.total ?? 0;
  const farmsLastPage = farms?.last_page ?? 1;
  const farmsLinks = farms?.links ?? [];

  const handleFilter: FormEventHandler = (e) => {
    e.preventDefault();
    router.get(
      '/farms',
      {
        search: search || undefined,
        country: country || undefined,
        climate: climate || undefined,
      },
      { preserveState: true }
    );
  };

  const clearFilters = () => {
    setSearch('');
    setCountry('');
    setClimate('');
    setShowFilters(false);
    router.get('/farms');
  };

  return (
    <AppShellLayout>
      <Head title={t('partner_farms')} />

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
                  {t('partner_farms')}
                </h1>
                <p className="text-[13px] text-gray-500 mt-1 leading-snug">
                  {t('browse_farms_subtitle', 'Browse and discover partner farms')}
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 ml-4"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_placeholder', 'Search farms...')}
                className="w-full bg-gray-50 border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFilter(e as any);
                  }
                }}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              {search && (
                <button
                  onClick={() => { setSearch(''); router.get('/farms'); }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel (collapsible) */}
          {showFilters && (
            <div className="bg-white px-5 pb-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {t('all_regions', 'All Regions')}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option value="">{t('all_regions', 'All Regions')}</option>
                    {options.countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <ThermometerSun className="w-3.5 h-3.5" /> {t('all_climates', 'All Climates')}
                  </label>
                  <select
                    value={climate}
                    onChange={(e) => setClimate(e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option value="">{t('all_climates', 'All Climates')}</option>
                    {options.climates.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleFilter}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    {t('apply_filters', 'Terapkan Filter')}
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    {t('reset', 'Reset')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(country || climate || search) && (
            <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-emerald-800">{t('active_filters', 'Filter aktif:')}</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    "{search}"
                  </span>
                )}
                {country && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 capitalize">
                    {country}
                  </span>
                )}
                {climate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 capitalize">
                    {climate}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                >
                  {t('clear_all', 'Hapus Semua')}
                </button>
              </div>
            </div>
          )}

          {/* Section divider */}
          <div className="h-3 bg-gray-50" />

          {/* Results Count */}
          <div className="bg-white px-5 pt-4 pb-2">
            <p className="text-sm text-gray-600 font-medium">
              {t('showing', 'Menampilkan')} <span className="font-bold text-gray-900">{farmsData.length}</span> {t('of', 'dari')} <span className="font-bold text-gray-900">{farmsTotal}</span> {t('farms_count', 'kebun')}
            </p>
          </div>

          {/* Farms List */}
          {farmsData.length > 0 ? (
            <div className="bg-white px-5 pt-5 pb-6 min-h-[50vh]">
              {farmsData.map((farm: any, index: number) => {
                if (!farm || !farm.id) return null;
                return (
                  <div key={farm.id}>
                    <Link
                      href={`/farms/${farm.id}`}
                      className="block p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors mb-3"
                    >
                      {/* Farm Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden border border-gray-200">
                          {farm.image_url ? (
                            <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
                          ) : (
                            <Leaf className="w-6 h-6 text-earth-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-gray-900 text-sm truncate">
                              {farm.name}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 truncate uppercase font-semibold">
                            {farm.country || 'Unknown'} • {farm.climate || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5 flex items-center gap-1">
                            <Leaf className="w-3 h-3" /> {t('size')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 capitalize">
                            {farm.size_hectares} {t('hectares')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Lokasi
                          </p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {farm.city || farm.region || farm.country || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5 flex items-center gap-1">
                            <Leaf className="w-3 h-3" /> {t('capacity')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 capitalize">
                            {farm.capacity_trees?.toLocaleString()} {t('trees')}
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
                    {index < farmsData.length - 1 && (
                      <div className="h-px bg-gray-100 mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white px-5 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                {t('no_farms_found')}
              </h3>
              <p className="text-[13px] text-gray-500 leading-snug mb-4">
                {t('no_farms_desc')}
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                {t('clear_filters')}
              </button>
            </div>
          )}

          {/* Pagination */}
          {farmsLastPage > 1 && (
            <div className="bg-white px-5 pt-4 pb-6">
              <div className="flex justify-center items-center gap-2 flex-wrap">
                {farmsLinks.map((link: any, index: number) => {
                  if ((link.label.includes('Previous') || link.label.includes('Next')) && !link.url) return null;

                  return (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${link.active
                        ? 'bg-emerald-600 text-white'
                        : link.url
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
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

