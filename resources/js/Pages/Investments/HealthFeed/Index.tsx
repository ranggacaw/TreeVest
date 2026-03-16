import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps } from '@/types';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';
import { IconPlant, IconFlash, IconTree, IconMapPin, IconCalendar } from '@/Components/Icons/AppIcons';

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

interface Props extends PageProps {
  healthUpdates: {
    data: HealthUpdate[];
    current_page: number;
    last_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  healthAlerts: {
    data: HealthAlert[];
    total: number;
  };
  filters: {
    severity?: string;
    update_type?: string;
    farm_id?: string;
  };
}

export default function Index({ auth, healthUpdates, healthAlerts, filters, unread_notifications_count }: Props) {
  const [filterSeverity, setFilterSeverity] = useState(filters.severity || '');
  const [filterType, setFilterType] = useState(filters.update_type || '');

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'severity') setFilterSeverity(value);
    if (key === 'update_type') setFilterType(value);
    
    router.get(
      route('investments.health-feed.index'),
      { 
        ...filters, 
        [key]: value,
        severity: key === 'severity' ? value : filterSeverity,
        update_type: key === 'update_type' ? value : filterType
      },
      { preserveState: true, replace: true }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getUpdateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      routine: 'Routine',
      pest: 'Pest',
      disease: 'Disease',
      damage: 'Damage',
      weather_impact: 'Weather',
      other: 'Other',
    };
    return labels[type] || type;
  };

  return (
    <AppShellLayout>
      <Head title="Health Feed" />

          <div className="relative w-full max-w-md bg-bg flex flex-col" style={{ height: '100dvh' }}>
            <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
              <AppTopBar notificationCount={unread_notifications_count} />

              {/* Header & Alerts Link */}
              <div className="bg-card px-6 pt-6 pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-text flex items-center gap-2">
                    <IconPlant className="w-6 h-6 text-primary" />
                    Health Feed
                  </h2>
                  <Link
                    href={route('investments.health-alerts')}
                    className="relative inline-flex items-center px-3 py-1.5 bg-warning-50 text-warning-700 rounded-lg text-xs font-semibold border border-warning-100"
                  >
                    <IconFlash className="w-3.5 h-3.5 mr-1" />
                    Alerts
                    {healthAlerts.total > 0 && (
                      <span className="ml-1.5 bg-warning-200 text-warning-800 rounded-full px-1.5 py-0.5 text-[10px]">
                        {healthAlerts.total}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  <select
                    className="rounded-xl border-border text-sm py-2 pl-3 pr-8 focus:border-primary focus:ring-primary bg-bg text-text"
                    value={filterSeverity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                  >
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>

                  <select
                    className="rounded-xl border-border text-sm py-2 pl-3 pr-8 focus:border-primary focus:ring-primary bg-bg text-text"
                    value={filterType}
                    onChange={(e) => handleFilterChange('update_type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="routine">Routine</option>
                    <option value="pest">Pest</option>
                    <option value="disease">Disease</option>
                    <option value="damage">Damage</option>
                    <option value="weather_impact">Weather</option>
                  </select>
                </div>
              </div>

              <div className="h-3 bg-bg" />

              {/* Feed Content */}
              <div className="bg-card p-6 min-h-[50vh]">
                {healthUpdates.data.length > 0 ? (
                  <div className="space-y-6">
                    {healthUpdates.data.map((update) => (
                      <Link 
                        key={update.id} 
                        href={route('investments.health-feed.show', update.id)}
                        className="block relative pl-4 border-l-2 border-primary-100 hover:border-primary transition-colors py-1 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <HealthSeverityBadge severity={update.severity} />
                            <span className="text-xs font-medium text-textSecondary uppercase tracking-wide">
                              {getUpdateTypeLabel(update.update_type)}
                            </span>
                          </div>
                          <span className="text-xs text-textSecondary font-medium">
                            {formatDate(update.created_at)}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-text mb-2 group-hover:text-primary-700 transition-colors">
                          {update.title}
                        </h3>
                        
                        <p className="text-sm text-textSecondary mb-3 line-clamp-2">
                          {update.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-textSecondary">
                          <div className="flex items-center gap-1">
                            <IconMapPin className="w-3.5 h-3.5 text-textSecondary" />
                            {update.fruit_crop.farm.name}
                          </div>
                          <div className="w-1 h-1 bg-border rounded-full" />
                          <div className="flex items-center gap-1">
                            <IconTree className="w-3.5 h-3.5 text-textSecondary" />
                            {update.fruit_crop.fruit_type.name}
                          </div>
                        </div>

                        {update.photos && update.photos.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                            {update.photos.slice(0, 3).map((photo, i) => (
                              <div key={i} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-bg">
                                <img src={photo} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {update.photos.length > 3 && (
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-bg flex items-center justify-center text-xs text-textSecondary font-medium border border-border">
                                +{update.photos.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4">
                       <IconPlant className="w-8 h-8 text-textSecondary" />
                    </div>
                    <p className="text-textSecondary mb-6">No health updates available for these filters.</p>
                    <Link
                      href={route('trees.index')}
                      className="inline-flex items-center justify-center px-6 py-2.5 bg-primary rounded-xl font-semibold text-sm text-white hover:bg-primary-dark transition-colors shadow-floating"
                    >
                      Explore Trees
                    </Link>
                  </div>
                )}

                {/* Simple Pagination */}
                {healthUpdates.last_page > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {healthUpdates.prev_page_url && (
                      <Link
                        href={healthUpdates.prev_page_url}
                        className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-text hover:bg-bg shadow-card"
                      >
                        Previous
                      </Link>
                    )}
                    {healthUpdates.next_page_url && (
                      <Link
                        href={healthUpdates.next_page_url}
                        className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-text hover:bg-bg shadow-card"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
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
