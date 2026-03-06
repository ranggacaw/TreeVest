import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuditLog {
    id: number;
    user_id: number | null;
    event_type: string;
    ip_address: string | null;
    created_at: string;
    user: User | null;
}

interface AuditLogsData {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    event_type?: string;
    user_id?: string;
    user_email?: string;
    date_from?: string;
    date_to?: string;
}

export default function Index({ auditLogs, filters }: { auditLogs: AuditLogsData; filters: Filters }) {
    const { t } = useTranslation();
    return (
        <AppLayout title={t('admin.audit_logs.title')}>
            <Head title={t('admin.audit_logs.title')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{t('admin.audit_logs.title')}</h3>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form method="get" className="mb-6 flex flex-wrap gap-4">
                                <select
                                    name="event_type"
                                    defaultValue={filters.event_type}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">{t('admin.audit_logs.all_event_types')}</option>
                                    <option value="login">{t('admin.audit_logs.event_login')}</option>
                                    <option value="failed_login">{t('admin.audit_logs.event_failed_login')}</option>
                                    <option value="user.registered">{t('admin.audit_logs.event_registration')}</option>
                                    <option value="kyc_submitted">{t('admin.audit_logs.event_kyc_submitted')}</option>
                                    <option value="kyc_verified">{t('admin.audit_logs.event_kyc_verified')}</option>
                                    <option value="kyc_rejected">{t('admin.audit_logs.event_kyc_rejected')}</option>
                                    <option value="investment_purchased">{t('admin.audit_logs.event_investment')}</option>
                                    <option value="payout_processed">{t('admin.audit_logs.event_payout')}</option>
                                    <option value="admin_action">{t('admin.audit_logs.event_admin')}</option>
                                    <option value="role.changed">{t('admin.audit_logs.event_role')}</option>
                                </select>
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        name="user_id"
                                        placeholder={t('admin.audit_logs.user_id_placeholder')}
                                        defaultValue={filters.user_id}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        name="user_email"
                                        placeholder="User Email..."
                                        defaultValue={filters.user_email}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        name="date_from"
                                        placeholder="From"
                                        defaultValue={filters.date_from}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        name="date_to"
                                        placeholder="To"
                                        defaultValue={filters.date_to}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Filter
                                </button>
                            </form>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {auditLogs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.event_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {log.user ? (
                                                    <div>
                                                        <div className="text-gray-900">{log.user.name}</div>
                                                        <div className="text-gray-500 text-xs">{log.user.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">System</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip_address || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('admin.audit-logs.show', log.id)} className="text-indigo-600 hover:text-indigo-900">{t('common.view')}</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {auditLogs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                No audit logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {auditLogs.last_page > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <div className="flex gap-2">
                                        {auditLogs.current_page > 1 && (
                                            <Link
                                                href={route('admin.audit-logs.index', { page: auditLogs.current_page - 1, ...filters })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        <span className="px-3 py-1 text-gray-700">
                                            Page {auditLogs.current_page} of {auditLogs.last_page}
                                        </span>
                                        {auditLogs.current_page < auditLogs.last_page && (
                                            <Link
                                                href={route('admin.audit-logs.index', { page: auditLogs.current_page + 1, ...filters })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
