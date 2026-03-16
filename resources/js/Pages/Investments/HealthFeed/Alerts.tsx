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

                    <div className="bg-card px-6 pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-text flex items-center gap-2">
                                <IconFlash className="w-6 h-6 text-warning" />
                                Health Alerts
                            </h2>
                            <span className="text-xs font-semibold bg-warning-100 text-warning-800 px-2 py-1 rounded-full">
                                {healthAlerts.data.filter(a => !a.is_resolved).length} Unresolved
                            </span>
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
                                value={filterUnresolved}
                                onChange={(e) => handleFilterChange('unresolved', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="1">Unresolved Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-3 bg-bg" />

                    <div className="bg-card p-6 min-h-[50vh]">
                        {healthAlerts.data.length > 0 ? (
                            <div className="space-y-4">
                                {healthAlerts.data.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`rounded-2xl border p-4 shadow-sm transition-shadow ${
                                            alert.is_resolved
                                                ? 'bg-card border-border'
                                                : 'bg-danger-50 border-danger-100'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <HealthSeverityBadge severity={alert.severity} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                                                    {alertTypeLabels[alert.alert_type] || alert.alert_type}
                                                </span>
                                            </div>
                                            {alert.is_resolved ? (
                                                 <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-success-100 text-success-800">
                                                    <IconCheck className="w-3 h-3 mr-0.5" />
                                                    Resolved
                                                </span>
                                            ) : (
                                                <span className="text-xs text-danger-500 font-bold animate-pulse">Active</span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-text mb-1">{alert.title}</h3>
                                        <p className="text-xs text-textSecondary mb-3">{formatDate(alert.created_at)}</p>
                                        
                                        <p className="text-sm text-text mb-4 leading-relaxed bg-bg/50 p-2 rounded-lg">
                                            {alert.message}
                                        </p>

                                        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                                            <div className="flex items-center gap-2 text-xs text-textSecondary">
                                                <IconMapPin className="w-3.5 h-3.5 text-textSecondary" />
                                                <span className="font-medium text-text">{alert.farm.name}</span>
                                            </div>
                                            {alert.fruit_crop && (
                                                <div className="flex items-center gap-2 text-xs text-textSecondary">
                                                    <IconTree className="w-3.5 h-3.5 text-textSecondary" />
                                                    <span>{alert.fruit_crop.variant} ({alert.fruit_crop.fruit_type?.name})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12">
                                <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4">
                                   <IconFlash className="w-8 h-8 text-textSecondary" />
                                </div>
                                <p className="text-textSecondary mb-6">No health alerts found.</p>
                                <Link
                                  href={route('investments.health-feed.index')}
                                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary rounded-xl font-semibold text-sm text-white hover:bg-primary-dark transition-colors shadow-floating"
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
                                    className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-text hover:bg-bg shadow-card"
                                  >
                                    Previous
                                  </Link>
                                )}
                                {healthAlerts.next_page_url && (
                                  <Link
                                    href={healthAlerts.next_page_url}
                                    className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium text-text hover:bg-bg shadow-card"
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
