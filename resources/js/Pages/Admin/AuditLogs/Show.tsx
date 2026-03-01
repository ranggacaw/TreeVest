import { Head, Link, usePage } from '@inertiajs/react';

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
    user_agent: string | null;
    event_data: Record<string, unknown>;
    created_at: string;
    updated_at: string | null;
    user: User | null;
}

export default function Show() {
    const { auditLog } = usePage<{ auditLog: AuditLog }>().props;

    return (
        <>
            <Head title="Audit Log Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                        <Link href={route('admin.audit-logs.index')} className="text-indigo-600 hover:text-indigo-900">
                            Back to Audit Logs
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">ID</dt>
                                        <dd className="text-sm text-gray-900">{auditLog.id}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Event Type</dt>
                                        <dd className="text-sm text-gray-900">{auditLog.event_type}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                                        <dd className="text-sm text-gray-900">{auditLog.ip_address || 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                                        <dd className="text-sm text-gray-900 break-all">{auditLog.user_agent || 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                                        <dd className="text-sm text-gray-900">{new Date(auditLog.created_at).toLocaleString()}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">User</h4>
                                {auditLog.user ? (
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                                            <dd className="text-sm text-gray-900">{auditLog.user.id}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                                            <dd className="text-sm text-gray-900">{auditLog.user.name}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{auditLog.user.email}</dd>
                                        </div>
                                        <div className="mt-4">
                                            <Link
                                                href={route('admin.users.show', auditLog.user.id)}
                                                className="text-sm text-indigo-600 hover:text-indigo-900"
                                            >
                                                View User Profile →
                                            </Link>
                                        </div>
                                    </dl>
                                ) : (
                                    <p className="text-sm text-gray-500">System event (no user)</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg lg:col-span-2">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Event Data</h4>
                                <div className="bg-gray-50 rounded-md p-4 overflow-x-auto">
                                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                        {JSON.stringify(auditLog.event_data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
