import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, PaginatedHarvests } from '@/types';
import HarvestStatusBadge from '@/Components/HarvestStatusBadge';
import { formatDate } from '@/utils/date';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface FruitType {
  id: number;
  name: string;
}

interface Props extends PageProps {
  harvests: PaginatedHarvests;
  filters: {
    search?: string;
    fruit_type_id?: number;
  };
  fruitTypes: FruitType[];
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <svg
          className="h-7 w-7 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">
        {t('no_harvests')}
      </h3>
      <p className="mb-6 max-w-xs text-sm text-gray-500">
        {t('no_harvests_desc')}
      </p>
      <Link
        href={route('farm-owner.harvests.create')}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        {t('schedule_first_harvest')}
      </Link>
    </div>
  );
}

export default function Index({ harvests, flash, filters, fruitTypes }: Props) {
  const { t } = useTranslation('harvests');
  const [search, setSearch] = useState(filters?.search ?? '');
  const activeCrop = filters?.fruit_type_id ?? '';

  const applySearch = () => {
    const params: Record<string, string | number> = {};
    if (search) params.search = search;
    if (activeCrop) params.fruit_type_id = activeCrop;
    router.get(route('farm-owner.harvests.index'), params, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applySearch();
  };

  const applyCropFilter = (cropId: number | '') => {
    const params: Record<string, string | number> = {};
    if (search) params.search = search;
    if (cropId) params.fruit_type_id = cropId;
    router.get(route('farm-owner.harvests.index'), params, {
      preserveState: true,
      replace: true,
    });
  };

  const goToPage = (page: number) => {
    const params: Record<string, string | number> = { page };
    if (search) params.search = search;
    if (activeCrop) params.fruit_type_id = activeCrop;
    router.get(route('farm-owner.harvests.index'), params, { preserveState: true });
  };

  return (
    <AppLayout title={t('my_harvests')}>
      <Head title={t('my_harvests')} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('my_harvests')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('my_harvests_subtitle')}
            </p>
          </div>
          <Link
            href={route('farm-owner.harvests.create')}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:self-auto"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {t('schedule_harvest')}
          </Link>
        </div>

        {/* Search and Crop Filter */}
        {harvests.total > 0 && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by tree or farm name..."
                  className="block w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Search
              </button>
            </form>

            {/* Crop Filter */}
            {fruitTypes.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="crop-filter" className="text-sm font-medium text-gray-600">
                  Crop:
                </label>
                <select
                  id="crop-filter"
                  value={activeCrop}
                  onChange={(e) => applyCropFilter(e.target.value ? Number(e.target.value) : '')}
                  className="rounded-lg border border-gray-200 py-2 pl-3 pr-8 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">All Crops</option>
                  {fruitTypes.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Flash message */}
        {flash?.success && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {flash.success}
          </div>
        )}

        {harvests.total > 0 && (
          <p className="mb-4 text-sm text-gray-500">
            {t('showing_results', { from: harvests.from, to: harvests.to, total: harvests.total })}
          </p>
        )}

        {/* Harvest list */}
        {harvests.data.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="space-y-3">
            {harvests.data.map((harvest) => (
              <Link
                key={harvest.id}
                href={route(
                  'farm-owner.harvests.show',
                  harvest.id,
                )}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:flex-row sm:items-center sm:gap-6"
              >
                {/* Left: dates + status */}
                <div className="flex min-w-[10rem] flex-col gap-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {t('scheduled_date')}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(harvest.scheduled_date)}
                  </p>
                  <div className="mt-1">
                    <HarvestStatusBadge
                      status={harvest.status}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden self-stretch border-l border-gray-100 sm:block" />

                {/* Middle: crop + farm info */}
                <div className="mt-3 flex-1 sm:mt-0">
                  <p className="font-semibold text-gray-900 group-hover:text-emerald-700">
                    {harvest.tree?.tree_identifier ?? `Harvest #${harvest.id}`}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {harvest.fruit_crop?.farm?.name && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-emerald-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                          />
                        </svg>
                        {harvest.fruit_crop.farm.name}
                      </span>
                    )}
                    {harvest.fruit_crop?.fruit_type?.name && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-emerald-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                          />
                        </svg>
                        {harvest.fruit_crop.fruit_type.name}{' '}
                        {harvest.fruit_crop.variant
                          ? `— ${harvest.fruit_crop.variant}`
                          : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: yield info + chevron */}
                <div className="mt-3 flex items-center justify-between gap-6 sm:mt-0 sm:justify-end">
                  <div className="flex gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {t('estimated_yield')}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {harvest.estimated_yield_kg != null
                          ? `${Number(harvest.estimated_yield_kg).toLocaleString()} kg`
                          : '—'}
                      </p>
                    </div>
                    {harvest.actual_yield_kg != null && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {t('actual_yield')}
                        </p>
                        <p className="text-sm font-semibold text-emerald-700">
                          {Number(
                            harvest.actual_yield_kg,
                          ).toLocaleString()}{' '}
                          kg
                        </p>
                      </div>
                    )}
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-300 transition group-hover:text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {harvests.last_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              disabled={harvests.current_page === 1}
              onClick={() =>
                goToPage(harvests.current_page - 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {Array.from(
              { length: harvests.last_page },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${page === harvests.current_page
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={
                harvests.current_page === harvests.last_page
              }
              onClick={() =>
                goToPage(harvests.current_page + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
