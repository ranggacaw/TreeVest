import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { AppLayout } from '@/Layouts';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';

interface HealthUpdate {
  id: number;
  fruit_crop_id: number;
  severity: string;
  update_type: string;
  title: string;
  description: string;
  visibility: string;
  photos: string[];
  thumbnail_urls: string[];
  created_at: string;
  updated_at: string;
  fruit_crop: {
    id: number;
    variant: string;
    fruit_type: {
      id: number;
      name: string;
    };
    farm: {
      id: number;
      name: string;
    };
  };
  author: {
    id: number;
    name: string;
  };
}

interface Props {
  healthUpdate: HealthUpdate;
}

export default function Show({ healthUpdate }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getVisibilityLabel = (visibility: string) => {
    const labels: Record<string, string> = {
      public: 'Public',
      investors_only: 'Investors Only',
    };
    return labels[visibility] || visibility;
  };

  const handleDelete = () => {
    setDeleting(true);
    router.delete(route('farm-owner.health-updates.destroy', healthUpdate.id), {
      onFinish: () => setDeleting(false),
    });
  };

  const canEdit = () => {
    const createdAt = new Date(healthUpdate.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  return (
    <AppLayout title="Health Update Details">
      <Head title="Health Update Details" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={route('farm-owner.health-updates.index')}
            className="text-emerald-600 hover:text-emerald-700 text-sm"
          >
            ← Back to Health Updates
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <HealthSeverityBadge severity={healthUpdate.severity} />
                  <span className="text-sm text-gray-500">
                    {getUpdateTypeLabel(healthUpdate.update_type)}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {healthUpdate.title}
                </h1>
              </div>
              <div className="flex gap-2">
                {canEdit() && (
                  <Link
                    href={route('farm-owner.health-updates.edit', healthUpdate.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                  >
                    Edit
                  </Link>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Farm</h3>
                <p className="text-gray-900">{healthUpdate.fruit_crop?.farm?.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Fruit Crop</h3>
                <p className="text-gray-900">
                  {healthUpdate.fruit_crop?.fruit_type?.name} - {healthUpdate.fruit_crop?.variant}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Author</h3>
                <p className="text-gray-900">{healthUpdate.author?.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Visibility</h3>
                <p className="text-gray-900">{getVisibilityLabel(healthUpdate.visibility)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <p className="text-gray-900">{formatDate(healthUpdate.created_at)}</p>
              </div>
              {healthUpdate.updated_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                  <p className="text-gray-900">{formatDate(healthUpdate.updated_at)}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <div className="text-gray-900 whitespace-pre-wrap">
                {healthUpdate.description}
              </div>
            </div>

            {healthUpdate.photos && healthUpdate.photos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {healthUpdate.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
