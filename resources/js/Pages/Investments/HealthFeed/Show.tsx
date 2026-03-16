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

      <div className="relative w-full max-w-md bg-bg flex flex-col" style={{ height: '100dvh' }}>
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
          <AppTopBar notificationCount={unread_notifications_count} />

          {/* Back Navigation */}
          <div className="bg-card px-6 pt-4 pb-2">
            <Link href={route('investments.health-feed.index')} className="inline-flex items-center text-sm text-textSecondary hover:text-primary transition-colors">
              <IconArrowLeft className="w-4 h-4 mr-1" />
              Back to Health Feed
            </Link>
          </div>

          <div className="bg-card px-6 pb-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <HealthSeverityBadge severity={healthUpdate.severity} />
                <span className="text-xs font-semibold text-textSecondary uppercase tracking-wide bg-bg px-2 py-0.5 rounded">
                  {updateTypeLabels[healthUpdate.update_type] || healthUpdate.update_type}
                </span>
              </div>
              <h1 className="text-xl font-bold text-text leading-snug mb-1">{healthUpdate.title}</h1>
              <p className="text-xs text-textSecondary">{formatDate(healthUpdate.created_at)}</p>
            </div>

            {/* Farm Context */}
            <div className="bg-bg rounded-xl p-4 mb-6 border border-border">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary shrink-0">
                        <IconMapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-textSecondary uppercase font-bold tracking-wider mb-0.5">Farm</p>
                        <Link href={`/farms/${healthUpdate.fruit_crop.farm.id}`} className="text-sm font-semibold text-text hover:text-primary">
                            {healthUpdate.fruit_crop.farm.name}
                        </Link>
                        {healthUpdate.fruit_crop.farm.city && (
                            <p className="text-xs text-textSecondary">{healthUpdate.fruit_crop.farm.city}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary shrink-0">
                        <IconTree className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-textSecondary uppercase font-bold tracking-wider mb-0.5">Crop</p>
                        <p className="text-sm font-semibold text-text">{healthUpdate.fruit_crop.variant}</p>
                        <p className="text-xs text-textSecondary">{healthUpdate.fruit_crop.fruit_type.name}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-text mb-6">
              {healthUpdate.description.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-2 leading-relaxed">{paragraph}</p>
              ))}
            </div>

            {/* Photos */}
            {healthUpdate.photos && healthUpdate.photos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-text mb-3">Photos ({healthUpdate.photos.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {healthUpdate.photos.map((photo, index) => (
                    <div key={index} className="rounded-xl overflow-hidden bg-bg aspect-square relative">
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
            <div className="border-t border-border pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-textSecondary">
                    <IconUser className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-text">{healthUpdate.author.name}</p>
                    <p className="text-xs text-textSecondary capitalize">{healthUpdate.author.role.replace('_', ' ')}</p>
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
