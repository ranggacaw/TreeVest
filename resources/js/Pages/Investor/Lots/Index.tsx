import { Head, Link, router, usePage } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import { useState, FormEventHandler } from 'react';
import { Lot, FruitType, Farm, PaginatedLots, PageProps } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import LocationHierarchy from '@/Components/LocationHierarchy';

// Icons
import { IconPlant, IconTree, IconFilter, IconSearch } from '@/Components/Icons/AppIcons';

// App Shell Components
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';

interface Props {
  lots: PaginatedLots;
  filters: {
    fruit_type_id?: number;
    farm_id?: number;
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  };
  fruitTypes: FruitType[];
  farms: Farm[];
}

export default function Index({ lots, filters, fruitTypes, farms }: Props) {
  const { t } = useTranslation();
  const page = usePage<PageProps>();
  const unreadCount = page.props.unread_notifications_count ?? 0;
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(filters.search || '');
  const [fruitTypeId, setFruitTypeId] = useState(filters.fruit_type_id?.toString() || '');
  const [farmId, setFarmId] = useState(filters.farm_id?.toString() || '');

  const handleFilter: FormEventHandler = (e) => {
    e.preventDefault();
    router.get(
      route('investor.lots.index'),
      {
        search: search || undefined,
        fruit_type_id: fruitTypeId || undefined,
        farm_id: farmId || undefined,
      },
      { preserveState: true }
    );
  };

  const clearFilters = () => {
    setSearch('');
    setFruitTypeId('');
    setFarmId('');
    setShowFilters(false);
    router.get(route('investor.lots.index'));
  };

  return (
    <AppShellLayout>
      <Head title="Lot Marketplace" />

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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-[20px] font-extrabold text-gray-900 mb-1">
                  Lot Marketplace
                </h1>
                <p className="text-[13px] text-gray-500 mt-1 leading-snug">
                  Paket investasi dari farm terkurasi
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
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
                placeholder="Cari lot investasi..."
                className="w-full bg-gray-50 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <IconSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Filter Panel (collapsible) */}
          {showFilters && (
            <div className="bg-white px-5 pb-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Jenis Buah
                  </label>
                  <select
                    value={fruitTypeId}
                    onChange={(e) => setFruitTypeId(e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option value="">Semua Jenis Buah</option>
                    {fruitTypes.map((ft) => (
                      <option key={ft.id} value={ft.id}>
                        {ft.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Farm
                  </label>
                  <select
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <option value="">Semua Farm</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </select>
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
          {(fruitTypeId || farmId || search) && (
            <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-emerald-800">Filter aktif:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    "{search}"
                  </span>
                )}
                {fruitTypeId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    {fruitTypes.find(ft => ft.id.toString() === fruitTypeId)?.name}
                  </span>
                )}
                {farmId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    {farms.find(f => f.id.toString() === farmId)?.name}
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
              Menampilkan <span className="font-bold text-gray-900">{lots.data.length}</span> dari <span className="font-bold text-gray-900">{lots.total}</span> lot
            </p>
          </div>

          {/* Lots List */}
          {lots.data.length > 0 ? (
            <div className="bg-white px-5 pt-5 pb-6 min-h-[50vh]">
              {lots.data.map((lot, index) => (
                <div key={lot.id}>
                  <Link
                    href={route('investor.lots.show', lot.id)}
                    className="block p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors mb-3"
                  >
                    {/* Lot Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-emerald-200">
                        <IconPlant className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-gray-900 text-sm truncate">
                            {lot.name}
                          </h3>
                          <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex-shrink-0">
                            {lot.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {lot.fruit_crop?.variant && (
                          <p className="text-xs text-gray-500 truncate">
                            {lot.fruit_crop.variant}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Compact Location Hierarchy */}
                    {lot.rack?.warehouse?.farm && (
                      <LocationHierarchy
                        farm={lot.rack.warehouse.farm}
                        warehouse={lot.rack.warehouse}
                        rack={lot.rack}
                        lot={lot}
                        compact={true}
                      />
                    )}

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                          Total Pohon
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {lot.total_trees}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                          Harga/Pohon
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          {formatRupiah(lot.current_price_per_tree_idr)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                          Investor
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {lot.investments_count || 0}
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
                  {index < lots.data.length - 1 && (
                    <div className="h-px bg-gray-100 mx-4" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white px-5 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconTree className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                Belum ada lot tersedia
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
          {lots.last_page > 1 && (
            <div className="bg-white px-5 pt-4 pb-6">
              <div className="flex justify-center items-center gap-2">
                {lots.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${link.active
                      ? 'bg-emerald-600 text-white'
                      : link.url
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    preserveState
                  />
                ))}
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
