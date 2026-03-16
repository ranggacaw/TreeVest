import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/Layouts';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';

interface HealthUpdate {
  id: number;
  title: string;
  description: string;
  severity: string;
  update_type: string;
  created_at: string;
  fruit_crop: {
    id: number;
    fruit_type: {
      name: string;
    };
    farm: {
      id: number;
      name: string;
    };
  };
  author: {
    name: string;
  };
}

interface Farm {
  id: number;
  name: string;
  fruit_crops: {
    id: number;
    fruit_type: {
      name: string;
    };
  }[];
}

interface Props {
  healthUpdates: {
    data: HealthUpdate[];
    current_page: number;
    last_page: number;
    total: number;
  };
  farms: Farm[];
}

export default function Index({ healthUpdates, farms }: Props) {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUpdateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      routine: 'Routine Check',
      pest: 'Pest Issue',
      disease: 'Disease',
      damage: 'Physical Damage',
      weather_impact: 'Weather Impact',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const canEdit = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  const handleDelete = () => {
    if (deletingId === null) return;
    setDeleting(true);
    router.delete(route('farm-owner.health-updates.destroy', deletingId), {
      onFinish: () => {
        setDeleting(false);
        setShowDeleteModal(false);
        setDeletingId(null);
      },
    });
  };

  return (
    <AppLayout title="Health Updates">
      <Head title="Health Updates" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Health Updates
          </h1>
          <Link
            href={route('farm-owner.health-updates.create')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            + Create Health Update
          </Link>
        </div>

        {farms.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              You can submit health updates for: {farms.map(f => f.name).join(', ')}
            </p>
          </div>
        )}

        {healthUpdates.data.length > 0 ? (
          <div className="space-y-4">
            {healthUpdates.data.map((update) => (
              <div
                key={update.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <HealthSeverityBadge severity={update.severity} />
                      <span className="text-sm text-gray-500">
                        {getUpdateTypeLabel(update.update_type)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {update.title}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(update.created_at)}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {update.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-emerald-600">
                      {update.fruit_crop?.farm?.name}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">
                      {update.fruit_crop?.fruit_type?.name}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={route('farm-owner.health-updates.show', update.id)}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    {canEdit(update.created_at) && (
                      <Link
                        href={route('farm-owner.health-updates.edit', update.id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeletingId(update.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No health updates found.
            </p>
            <Link
              href={route('farm-owner.health-updates.create')}
              className="mt-4 inline-block text-emerald-600 hover:text-emerald-700"
            >
              Create your first health update
            </Link>
          </div>
        )}

        {healthUpdates.last_page > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex gap-2">
              {Array.from({ length: healthUpdates.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`?page=${page}`}
                  className={`px-4 py-2 rounded-lg ${page === healthUpdates.current_page
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {page}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Health Update
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this health update? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
