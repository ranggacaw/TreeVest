import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Verification {
    id: number;
    user_id: number;
    status: string;
    jurisdiction_code: string;
    submitted_at: string | null;
    created_at: string;
    user: User;
}

interface VerificationsData {
    data: Verification[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    status?: string;
}

export default function Index({ verifications, filters }: { verifications: VerificationsData; filters: Filters }) {
    const getStatusBadge = (status: string) => {
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

    const pendingCount = verifications.data.filter(v => v.status === 'submitted').length;

    return (
        <AppLayout title="KYC Review">
            <Head title="KYC Review" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="mb-0">
                            <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back
                            </button>
                            {pendingCount > 0 && (
                                <p className="text-sm text-amber-600 mt-1">{pendingCount} pending review</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form method="get" className="mb-6 flex flex-wrap gap-4">
                                <select
                                    name="status"
                                    defaultValue={filters.status}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="submitted">Submitted</option>
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="">All</option>
                                </select>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurisdiction</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {verifications.data.map((verification) => (
                                        <tr key={verification.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{verification.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="text-gray-900">{verification.user.name}</div>
                                                <div className="text-gray-500 text-xs">{verification.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{verification.jurisdiction_code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(verification.status)}`}>
                                                    {verification.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {verification.submitted_at ? new Date(verification.submitted_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('admin.kyc.show', verification.id)} className="text-indigo-600 hover:text-indigo-900">Review</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {verifications.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                No verifications found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {verifications.last_page > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <div className="flex gap-2">
                                        {verifications.current_page > 1 && (
                                            <Link
                                                href={route('admin.kyc.index', { page: verifications.current_page - 1, status: filters.status })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        <span className="px-3 py-1 text-gray-700">
                                            Page {verifications.current_page} of {verifications.last_page}
                                        </span>
                                        {verifications.current_page < verifications.last_page && (
                                            <Link
                                                href={route('admin.kyc.index', { page: verifications.current_page + 1, status: filters.status })}
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
