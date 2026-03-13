import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps } from '@/types';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';
import { IconArrowLeft, IconFlash, IconCheck, IconMapPin, IconTree } from '@/Components/Icons/AppIcons';

interface HealthAlert {
    id: number;
    title: string;
    message: string;
    severity: string;
    alert_type: string;
    created_at: string;
    is_resolved: boolean;
    resolved_at: string | null;
    farm: {
        id: number;
        name: string;
    };
    fruit_crop?: {
        id: number;
        variant: string;
        fruit_type: {
            name: string;
        };
    };
}

interface Props extends PageProps {
    healthAlerts: {
        data: HealthAlert[];
        current_page: number;
        last_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    filters: {
        severity?: string;
        unresolved?: string;
    };
}

export default function Alerts({ auth, healthAlerts, filters, unread_notifications_count }: Props) {
    const [filterSeverity, setFilterSeverity] = useState(filters.severity || '');
    const [filterUnresolved, setFilterUnresolved] = useState(filters.unresolved || '');

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'severity') setFilterSeverity(value);
        if (key === 'unresolved') setFilterUnresolved(value);

        router.get(
            route('investments.health-alerts'),
            {
                ...filters,
                [key]: value,
                severity: key === 'severity' ? value : filterSeverity,
                unresolved: key === 'unresolved' ? value : filterUnresolved
            },
            { preserveState: true, replace: true }
        );
    };

    const alertTypeLabels: Record<string, string> = {
        weather: 'Weather Alert',
        pest: 'Pest Infestation',
        disease: 'Disease Outbreak',
        damage: 'Physical Damage',
        growth: 'Growth Issue',
        other: 'Other',
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppShellLayout>
            <Head title="Health Alerts" />

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

                    <div className="bg-white px-6 pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <IconFlash className="w-6 h-6 text-amber-500" />
                                Health Alerts
                            </h2>
                            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                {healthAlerts.data.filter(a => !a.is_resolved).length} Unresolved
                            </span>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            <select
                                className="rounded-xl border-gray-200 text-sm py-2 pl-3 pr-8 focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50"
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
                                className="rounded-xl border-gray-200 text-sm py-2 pl-3 pr-8 focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50"
                                value={filterUnresolved}
                                onChange={(e) => handleFilterChange('unresolved', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="1">Unresolved Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    <div className="bg-white p-6 min-h-[50vh]">
                        {healthAlerts.data.length > 0 ? (
                            <div className="space-y-4">
                                {healthAlerts.data.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`rounded-2xl border p-4 shadow-sm transition-shadow ${
                                            alert.is_resolved
                                                ? 'bg-white border-gray-100'
                                                : 'bg-red-50 border-red-100'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <HealthSeverityBadge severity={alert.severity} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    {alertTypeLabels[alert.alert_type] || alert.alert_type}
                                                </span>
                                            </div>
                                            {alert.is_resolved ? (
                                                 <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-800">
                                                    <IconCheck className="w-3 h-3 mr-0.5" />
                                                    Resolved
                                                </span>
                                            ) : (
                                                <span className="text-xs text-red-500 font-bold animate-pulse">Active</span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-gray-900 mb-1">{alert.title}</h3>
                                        <p className="text-xs text-gray-400 mb-3">{formatDate(alert.created_at)}</p>
                                        
                                        <p className="text-sm text-gray-700 mb-4 leading-relaxed bg-white/50 p-2 rounded-lg">
                                            {alert.message}
                                        </p>

                                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100/50">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <IconMapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-medium text-gray-700">{alert.farm.name}</span>
                                            </div>
                                            {alert.fruit_crop && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <IconTree className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{alert.fruit_crop.variant} ({alert.fruit_crop.fruit_type?.name})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <IconFlash className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 mb-6">No health alerts found.</p>
                                <Link
                                  href={route('investments.health-feed.index')}
                                  className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 rounded-xl font-semibold text-sm text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                  Back to Feed
                                </Link>
                              </div>
                        )}

                        {/* Pagination */}
                        {healthAlerts.last_page > 1 && (
                             <div className="mt-8 flex justify-center gap-2">
                                {healthAlerts.prev_page_url && (
                                  <Link
                                    href={healthAlerts.prev_page_url}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                                  >
                                    Previous
                                  </Link>
                                )}
                                {healthAlerts.next_page_url && (
                                  <Link
                                    href={healthAlerts.next_page_url}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                                  >
                                    Next
                                  </Link>
                                )}
                              </div>
                        )}
                    </div>
                </div>

                <BottomNav activeTab="portfolio" />
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
