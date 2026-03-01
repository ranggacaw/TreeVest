import { Head, Link } from '@inertiajs/react';

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

interface UsersData {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    search?: string;
    role?: string;
    kyc_status?: string;
}

export default function Index({ users, filters }: { users: UsersData; filters: Filters }) {
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

    const buildQueryString = (newFilters: Record<string, string>) => {
        const params = new URLSearchParams();
        Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        return params.toString();
    };

    return (
        <>
            <Head title="User Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form method="get" className="mb-6 flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search by name, email, or phone..."
                                        defaultValue={filters.search}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <select
                                    name="role"
                                    defaultValue={filters.role}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="investor">Investor</option>
                                    <option value="farm_owner">Farm Owner</option>
                                </select>
                                <select
                                    name="kyc_status"
                                    defaultValue={filters.kyc_status}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All KYC Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="verified">Verified</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Search
                                </button>
                            </form>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.data.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycStatusBadge(user.kyc_status)}`}>
                                                    {user.kyc_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {user.suspended_at ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Suspended
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('admin.users.show', user.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">View</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {users.last_page > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <div className="flex gap-2">
                                        {users.current_page > 1 && (
                                            <Link
                                                href={route('admin.users.index', { page: users.current_page - 1 })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        <span className="px-3 py-1 text-gray-700">
                                            Page {users.current_page} of {users.last_page}
                                        </span>
                                        {users.current_page < users.last_page && (
                                            <Link
                                                href={route('admin.users.index', { page: users.current_page + 1 })}
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
        </>
    );
}
