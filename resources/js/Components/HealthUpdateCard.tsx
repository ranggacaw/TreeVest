import { Link } from '@inertiajs/react';
import HealthSeverityBadge from './HealthSeverityBadge';

interface HealthUpdate {
  id: number;
  title: string;
  description: string;
  severity: string;
  update_type: string;
  created_at: string;
  photos?: string[];
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

interface Props {
  healthUpdate: HealthUpdate;
}

export default function HealthUpdateCard({ healthUpdate }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <HealthSeverityBadge severity={healthUpdate.severity} />
            <span className="text-sm text-gray-500">
              {getUpdateTypeLabel(healthUpdate.update_type)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {healthUpdate.title}
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(healthUpdate.created_at)}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {healthUpdate.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/farms/${healthUpdate.fruit_crop.farm.id}`}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            {healthUpdate.fruit_crop.farm.name}
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">
            {healthUpdate.fruit_crop.fruit_type.name}
          </span>
        </div>
        
        <Link
          href={route('investments.health-feed.show', healthUpdate.id)}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View Details →
        </Link>
      </div>

      {healthUpdate.photos && healthUpdate.photos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {healthUpdate.photos.slice(0, 5).map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Health photo ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
}
