import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    kyc_status: string;
    suspended_at: string | null;
    created_at: string;
}

interface KycVerification {
    id: number;
    status: string;
    created_at: string;
}

interface AuditLog {
    id: number;
    event_type: string;
    event_data: Record<string, unknown>;
    ip_address: string;
    created_at: string;
}

interface Props {
    user: User & {
        kycVerifications: KycVerification[];
    };
    auditEvents: AuditLog[];
}

export default function Show() {
    const props = usePage().props as unknown as { user: User & { kycVerifications: { id: number; status: string; created_at: string }[] }; auditEvents: AuditLog[] };
    const { user, auditEvents } = props;
    const { data, setData, post, errors } = useForm({
        role: user.role,
        reason: '',
    });

    const handleRoleChange = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.update-role', user.id), {
            preserveScroll: true,
        });
    };

    const handleSuspend = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.suspend', user.id), {
            preserveScroll: true,
        });
    };

    const handleReactivate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.reactivate', user.id), {
            preserveScroll: true,
        });
    };

    const getKycStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'investor':
                return 'bg-indigo-100 text-indigo-800';
            case 'farm_owner':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head title="User Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                        <Link href={route('admin.users.index')} className="text-indigo-600 hover:text-indigo-900">
                            Back to Users
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Profile Information</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="text-sm text-gray-900">{user.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900">{user.email}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                        <dd className="text-sm text-gray-900">{user.phone || 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                                        <dd className="text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">KYC Status</dt>
                                        <dd className="text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycStatusBadge(user.kyc_status)}`}>
                                                {user.kyc_status}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="text-sm">
                                            {user.suspended_at ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Suspended
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Joined</dt>
                                        <dd className="text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString()}</dd>
                                    </div>
                                    {user.suspended_at && (
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Suspended At</dt>
                                            <dd className="text-sm text-gray-900">{new Date(user.suspended_at).toLocaleString()}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Change Role</h4>
                                <form onSubmit={handleRoleChange}>
                                    <div className="mb-4">
                                        <select
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="investor">Investor</option>
                                            <option value="farm_owner">Farm Owner</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        Update Role
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Actions</h4>
                                <div className="space-y-3">
                                    {user.suspended_at ? (
                                        <form onSubmit={handleReactivate}>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                Reactivate User
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleSuspend}>
                                            <div className="mb-4">
                                                <textarea
                                                    value={data.reason}
                                                    onChange={(e) => setData('reason', e.target.value)}
                                                    placeholder="Reason for suspension (optional)"
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    rows={3}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                            >
                                                Suspend User
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">KYC History</h4>
                                {user.kycVerifications && user.kycVerifications.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {user.kycVerifications.map((kyc) => (
                                            <li key={kyc.id} className="py-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-900">ID: {kyc.id}</span>
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycStatusBadge(kyc.status)}`}>
                                                        {kyc.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">{new Date(kyc.created_at).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No KYC history.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg lg:col-span-2">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Audit Events</h4>
                                {auditEvents && auditEvents.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {auditEvents.map((event) => (
                                                    <tr key={event.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.event_type}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.ip_address}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.created_at).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No audit events.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
