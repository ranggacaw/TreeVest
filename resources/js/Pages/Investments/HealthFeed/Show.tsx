import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps } from '@/types';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';
import { IconArrowLeft, IconMapPin, IconTree, IconUser } from '@/Components/Icons/AppIcons';

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

interface Props extends PageProps {
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

export default function Show({ auth, healthUpdate, unread_notifications_count }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppShellLayout>
      <Head title={healthUpdate.title} />

      <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
          <AppTopBar notificationCount={unread_notifications_count} />

          {/* Back Navigation */}
          <div className="bg-white px-6 pt-4 pb-2">
            <Link href={route('investments.health-feed.index')} className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors">
              <IconArrowLeft className="w-4 h-4 mr-1" />
              Back to Health Feed
            </Link>
          </div>

          <div className="bg-white px-6 pb-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <HealthSeverityBadge severity={healthUpdate.severity} />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">
                  {updateTypeLabels[healthUpdate.update_type] || healthUpdate.update_type}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-1">{healthUpdate.title}</h1>
              <p className="text-xs text-gray-400">{formatDate(healthUpdate.created_at)}</p>
            </div>

            {/* Farm Context */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <IconMapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Farm</p>
                        <Link href={`/farms/${healthUpdate.fruit_crop.farm.id}`} className="text-sm font-semibold text-gray-900 hover:text-emerald-600">
                            {healthUpdate.fruit_crop.farm.name}
                        </Link>
                        {healthUpdate.fruit_crop.farm.city && (
                            <p className="text-xs text-gray-500">{healthUpdate.fruit_crop.farm.city}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <IconTree className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Crop</p>
                        <p className="text-sm font-semibold text-gray-900">{healthUpdate.fruit_crop.variant}</p>
                        <p className="text-xs text-gray-500">{healthUpdate.fruit_crop.fruit_type.name}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-gray-700 mb-6">
              {healthUpdate.description.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-2 leading-relaxed">{paragraph}</p>
              ))}
            </div>

            {/* Photos */}
            {healthUpdate.photos && healthUpdate.photos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Photos ({healthUpdate.photos.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {healthUpdate.photos.map((photo, index) => (
                    <div key={index} className="rounded-xl overflow-hidden bg-gray-100 aspect-square relative">
                       <img
                        src={photo}
                        alt={`Update photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer / Author */}
            <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <IconUser className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{healthUpdate.author.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{healthUpdate.author.role.replace('_', ' ')}</p>
                </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AppShellLayout>
  );
}
