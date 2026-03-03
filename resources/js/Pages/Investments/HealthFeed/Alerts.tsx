import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HealthSeverityBadge from '@/Components/HealthSeverityBadge';

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

interface Props {
    healthAlerts: {
        data: HealthAlert[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        severity?: string;
        unresolved?: string;
    };
}

export default function Alerts({ healthAlerts, filters }: Props) {
    const alertTypeLabels: Record<string, string> = {
        weather: 'Weather Alert',
        pest: 'Pest Infestation',
        disease: 'Disease Outbreak',
        damage: 'Physical Damage',
        growth: 'Growth Issue',
        other: 'Other',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Health Alerts" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Health Alerts</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {healthAlerts.data.filter(a => !a.is_resolved).length} unresolved alert(s)
                        </p>
                    </div>
                    <Link
                        href={route('investments.health-feed.index')}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                    >
                        Back to Health Feed
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <select
                        className="rounded-lg border-gray-300 text-sm"
                        value={filters.severity || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            const url = new URL(window.location.href);
                            if (value) {
                                url.searchParams.set('severity', value);
                            } else {
                                url.searchParams.delete('severity');
                            }
                            window.location.href = url.toString();
                        }}
                    >
                        <option value="">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>

                    <select
                        className="rounded-lg border-gray-300 text-sm"
                        value={filters.unresolved || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            const url = new URL(window.location.href);
                            if (value) {
                                url.searchParams.set('unresolved', value);
                            } else {
                                url.searchParams.delete('unresolved');
                            }
                            window.location.href = url.toString();
                        }}
                    >
                        <option value="">All Alerts</option>
                        <option value="1">Unresolved Only</option>
                    </select>
                </div>

                {/* Alerts List */}
                {healthAlerts.data.length > 0 ? (
                    <div className="space-y-4">
                        {healthAlerts.data.map((alert) => (
                            <div
                                key={alert.id}
                                className={`rounded-lg border ${
                                    alert.is_resolved
                                        ? 'border-gray-200 bg-gray-50'
                                        : 'border-red-200 bg-red-50'
                                } p-6`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <HealthSeverityBadge severity={alert.severity} />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {alert.title}
                                        </h3>
                                        {alert.is_resolved && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                Resolved
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(alert.created_at).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-700 mb-3">{alert.message}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <div>
                                        <span className="font-medium">Type:</span> {alertTypeLabels[alert.alert_type] || alert.alert_type}
                                    </div>
                                    <div>
                                        <span className="font-medium">Farm:</span>{' '}
                                        <Link
                                            href={route('farms.manage.show', alert.farm.id)}
                                            className="text-indigo-600 hover:underline"
                                        >
                                            {alert.farm.name}
                                        </Link>
                                    </div>
                                    {alert.fruit_crop && (
                                        <div>
                                            <span className="font-medium">Crop:</span> {alert.fruit_crop.variant} ({alert.fruit_crop.fruit_type.name})
                                        </div>
                                    )}
                                </div>

                                {alert.resolved_at && (
                                    <p className="text-xs text-gray-500">
                                        Resolved at {new Date(alert.resolved_at).toLocaleString('id-ID')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No health alerts found.</p>
                        <Link
                            href={route('investments.health-feed.index')}
                            className="mt-4 inline-block text-emerald-600 hover:text-emerald-700"
                        >
                            Back to Health Feed
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {healthAlerts.last_page > 1 && (
                    <div className="mt-6 flex justify-center">
                        <nav className="flex gap-2">
                            {Array.from({ length: healthAlerts.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`?page=${page}${filters.severity ? `&severity=${filters.severity}` : ''}${filters.unresolved ? `&unresolved=${filters.unresolved}` : ''}`}
                                    className={`px-4 py-2 rounded-lg ${
                                        page === healthAlerts.current_page
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
