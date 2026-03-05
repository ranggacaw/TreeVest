import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, Harvest, HarvestStatus } from '@/types';

interface FruitCrop {
  id: number;
  variant: string;
  fruit_type_id: number;
  fruit_type: {
    id: number;
    name: string;
  };
  farm: {
    id: number;
    name: string;
    owner?: {
      id: number;
      name: string;
    };
  };
}

interface HarvestWithRelations extends Harvest {
  tree: {
    id: number;
    tree_identifier: string;
    price_cents: number;
    expected_roi_percent: number;
    risk_rating: string;
    fruit_crop?: {
      farm?: {
        name: string;
        owner?: { name: string };
      };
    };
  };
  fruit_crop: FruitCrop;
}

interface PaginatedHarvests {
  data: HarvestWithRelations[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface Props extends PageProps {
  harvests: PaginatedHarvests;
  filters: {
    status?: HarvestStatus;
  };
}

const STATUS_CONFIG: Record<
  HarvestStatus,
  { label: string; badge: string; dot: string }
> = {
  scheduled: {
    label: 'Scheduled',
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-500',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    dot: 'bg-red-500',
  },
};

const ALL_STATUSES: Array<{ value: HarvestStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

function StatusBadge({ status }: { status: HarvestStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    badge: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
    dot: 'bg-gray-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Index({ harvests, filters }: Props) {
  const activeStatus = filters?.status ?? '';

  const applyFilter = (status: HarvestStatus | '') => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    router.get(route('admin.harvests.index'), params, {
      preserveState: true,
      replace: true,
    });
  };

  const goToPage = (page: number) => {
    const params: Record<string, string | number> = { page };
    if (activeStatus) params.status = activeStatus;
    router.get(route('admin.harvests.index'), params, {
      preserveState: true,
    });
  };

  return (
    <AppLayout title="All Harvests">
      <Head title="All Harvests" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            All Harvests
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform-wide harvest overview — monitor status,
            yield data, and payout processing across all farms.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {ALL_STATUSES.map(({ value, label }) => {
            const isActive = activeStatus === value;
            return (
              <button
                key={value}
                onClick={() =>
                  applyFilter(value as HarvestStatus | '')
                }
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Summary bar */}
        {harvests.total > 0 && (
          <p className="mb-4 text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">
              {harvests.from}–{harvests.to}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-700">
              {harvests.total}
            </span>{' '}
            {activeStatus
              ? STATUS_CONFIG[activeStatus]?.label.toLowerCase()
              : ''}{' '}
            harvest{harvests.total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Table */}
        {harvests.data.length === 0 ? (
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
              No harvests found
            </h3>
            <p className="max-w-xs text-sm text-gray-500">
              {activeStatus
                ? `There are no ${STATUS_CONFIG[activeStatus]?.label.toLowerCase()} harvests right now.`
                : 'No harvests have been scheduled on the platform yet.'}
            </p>
            {activeStatus && (
              <button
                onClick={() => applyFilter('')}
                className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tree / Crop
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Farm
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Scheduled Date
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Est. Yield
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actual Yield
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {harvests.data.map((harvest) => (
                    <tr
                      key={harvest.id}
                      className="group transition hover:bg-gray-50"
                    >
                      {/* Tree / Crop */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {harvest.tree
                            ?.tree_identifier ??
                            `#${harvest.id}`}
                        </p>
                        {harvest.fruit_crop && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {harvest.fruit_crop
                              .fruit_type?.name}{' '}
                            {harvest.fruit_crop
                              .variant
                              ? `— ${harvest.fruit_crop.variant}`
                              : ''}
                          </p>
                        )}
                      </td>

                      {/* Farm */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-900">
                          {harvest.fruit_crop?.farm
                            ?.name ?? '—'}
                        </p>
                        {harvest.fruit_crop?.farm
                          ?.owner?.name && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {
                                harvest.fruit_crop
                                  .farm.owner
                                  .name
                              }
                            </p>
                          )}
                      </td>

                      {/* Scheduled date */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatDate(
                          harvest.scheduled_date,
                        )}
                      </td>

                      {/* Est. Yield */}
                      <td className="px-5 py-4 text-right text-sm text-gray-700">
                        {harvest.estimated_yield_kg !=
                          null
                          ? `${Number(harvest.estimated_yield_kg).toLocaleString()} kg`
                          : '—'}
                      </td>

                      {/* Actual Yield */}
                      <td className="px-5 py-4 text-right text-sm">
                        {harvest.actual_yield_kg !=
                          null ? (
                          <span className="font-semibold text-emerald-700">
                            {Number(
                              harvest.actual_yield_kg,
                            ).toLocaleString()}{' '}
                            kg
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={harvest.status}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={route(
                            'admin.harvests.show',
                            harvest.id,
                          )}
                          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 opacity-0 transition group-hover:opacity-100 hover:text-emerald-800"
                        >
                          View
                          <svg
                            className="h-3.5 w-3.5"
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
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
