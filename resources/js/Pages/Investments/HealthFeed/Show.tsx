import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';

interface HealthUpdate {
  id: number;
  title: string;
  description: string;
  severity: string;
  update_type: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  photos: string[];
  fruit_crop: {
    id: number;
    variant: string;
    description?: string;
    fruit_type: {
      id: number;
      name: string;
    };
    farm: {
      id: number;
      name: string;
      city?: string;
      country?: string;
    };
  };
  author: {
    id: number;
    name: string;
    role: string;
  };
}

interface Props {
  healthUpdate: HealthUpdate;
}

const updateTypeLabels: Record<string, string> = {
  routine: 'Routine Check',
  pest: 'Pest Issue',
  disease: 'Disease',
  damage: 'Physical Damage',
  weather_impact: 'Weather Impact',
  growth_update: 'Growth Update',
  harvest_preparation: 'Harvest Preparation',
  other: 'Other',
};

const visibilityLabels: Record<string, string> = {
  public: 'Public',
  investors_only: 'Investors Only',
  private: 'Private',
};

export default function Show({ healthUpdate }: Props) {
  return (
    <AuthenticatedLayout>
      <Head title={healthUpdate.title} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Trees Details
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Title Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <HealthSeverityBadge severity={healthUpdate.severity} />
                <h1 className="text-2xl font-bold text-gray-900">{healthUpdate.title}</h1>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(healthUpdate.created_at).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <div>
                <span className="font-medium">Type:</span> {updateTypeLabels[healthUpdate.update_type] || healthUpdate.update_type}
              </div>
              <div>
                <span className="font-medium">Visibility:</span> {visibilityLabels[healthUpdate.visibility] || healthUpdate.visibility}
              </div>
            </div>

            {/* Farm & Crop Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Farm:</span>{' '}
                  <Link
                    href={route('farms.manage.show', healthUpdate.fruit_crop.farm.id)}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    {healthUpdate.fruit_crop.farm.name}
                  </Link>
                  {healthUpdate.fruit_crop.farm.city && (
                    <span className="text-gray-500"> ({healthUpdate.fruit_crop.farm.city}, {healthUpdate.fruit_crop.farm.country})</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500">Crop:</span>{' '}
                  <span className="font-medium">{healthUpdate.fruit_crop.variant}</span>
                  <span className="text-gray-500"> ({healthUpdate.fruit_crop.fruit_type.name})</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                {healthUpdate.description.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-2 last:mb-0">{paragraph || <>&nbsp;</>}</p>
                ))}
              </div>
            </div>

            {/* Photos */}
            {healthUpdate.photos && healthUpdate.photos.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Photos ({healthUpdate.photos.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {healthUpdate.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Health update photo ${index + 1}`}
                      className="rounded-lg object-cover h-48 w-full border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Posted by{' '}
                <span className="font-medium text-gray-900">
                  {healthUpdate.author.name}
                </span>
                <span className="text-gray-500">
                  {' '}({healthUpdate.author.role.replace('_', ' ')})
                </span>
              </div>
              {healthUpdate.updated_at !== healthUpdate.created_at && (
                <div className="text-gray-500">
                  Updated {new Date(healthUpdate.updated_at).toLocaleString('id-ID')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-6 flex gap-3">
          <Link
            href={route('investments.health-feed.index')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
          >
            View All Health Updates
          </Link>
          <Link
            href={route('investments.health-alerts')}
            className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 border border-yellow-200 text-sm font-medium"
          >
            View Alerts
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
