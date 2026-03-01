import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HealthUpdateCard from '@/Components/HealthUpdateCard';
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

interface HealthAlert {
  id: number;
  title: string;
  message: string;
  severity: string;
  alert_type: string;
  created_at: string;
  is_resolved: boolean;
  farm: {
    id: number;
    name: string;
  };
}

interface Props {
  healthUpdates: {
    data: HealthUpdate[];
    current_page: number;
    last_page: number;
    total: number;
  };
  healthAlerts: {
    data: HealthAlert[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    severity?: string;
    update_type?: string;
    farm_id?: string;
  };
}

export default function Index({ healthUpdates, healthAlerts, filters }: Props) {
  const { t } = useTranslation('health');

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('healthFeed.title')}
          </h1>
          <div className="flex gap-2">
            <Link
              href={route('investments.health-alerts')}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 border border-yellow-200"
            >
              {t('healthFeed.alerts')} ({healthAlerts.total})
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-4">
            <select
              className="rounded-lg border-gray-300 text-sm"
              defaultValue={filters.severity || ''}
            >
              <option value="">{t('filters.allSeverities')}</option>
              <option value="low">{t('severity.low')}</option>
              <option value="medium">{t('severity.medium')}</option>
              <option value="high">{t('severity.high')}</option>
              <option value="critical">{t('severity.critical')}</option>
            </select>

            <select
              className="rounded-lg border-gray-300 text-sm"
              defaultValue={filters.update_type || ''}
            >
              <option value="">{t('filters.allTypes')}</option>
              <option value="routine">{t('updateType.routine')}</option>
              <option value="pest">{t('updateType.pest')}</option>
              <option value="disease">{t('updateType.disease')}</option>
              <option value="damage">{t('updateType.damage')}</option>
              <option value="weather_impact">{t('updateType.weather_impact')}</option>
            </select>
          </div>
        </div>

        {healthUpdates.data.length > 0 ? (
          <div className="space-y-4">
            {healthUpdates.data.map((update) => (
              <HealthUpdateCard key={update.id} healthUpdate={update} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{t('healthFeed.noUpdates')}</p>
            <Link
              href={route('trees.index')}
              className="mt-4 inline-block text-emerald-600 hover:text-emerald-700"
            >
              {t('healthFeed.exploreTrees')}
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
                  className={`px-4 py-2 rounded-lg ${
                    page === healthUpdates.current_page
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
    </AuthenticatedLayout>
  );
}
