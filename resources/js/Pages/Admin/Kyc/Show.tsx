import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface Document {
    id: number;
    document_type: string;
    original_filename: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    created_at: string;
}

interface Verification {
    id: number;
    user_id: number;
    status: string;
    jurisdiction_code: string;
    submitted_at: string | null;
    verified_at: string | null;
    rejected_at: string | null;
    rejection_reason: string | null;
    expires_at: string | null;
    created_at: string;
    user: User;
    documents: Document[];
    verified_by: User | null;
}

export default function Show() {
    const { verification } = usePage<{ verification: Verification }>().props;
    const { data, setData, post, errors } = useForm({
        reason: '',
    });

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

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Are you sure you want to approve this KYC verification?')) {
            post(route('admin.kyc.approve', verification.id), {
                preserveScroll: true,
            });
        }
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.kyc.reject', verification.id), {
            preserveScroll: true,
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <>
            <Head title="KYC Verification Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">KYC Verification Details</h3>
                        <Link href={route('admin.kyc.index')} className="text-indigo-600 hover:text-indigo-900">
                            Back to KYC Queue
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">User Information</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="text-sm text-gray-900">{verification.user.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900">{verification.user.email}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                        <dd className="text-sm text-gray-900">{verification.user.phone || 'N/A'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Verification Status</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(verification.status)}`}>
                                                {verification.status}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Jurisdiction</dt>
                                        <dd className="text-sm text-gray-900">{verification.jurisdiction_code}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                                        <dd className="text-sm text-gray-900">{verification.submitted_at ? new Date(verification.submitted_at).toLocaleString() : 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Expires</dt>
                                        <dd className="text-sm text-gray-900">{verification.expires_at ? new Date(verification.expires_at).toLocaleDateString() : 'N/A'}</dd>
                                    </div>
                                    {verification.verified_by && (
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Verified By</dt>
                                            <dd className="text-sm text-gray-900">{verification.verified_by.name}</dd>
                                        </div>
                                    )}
                                    {verification.rejection_reason && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                                            <dd className="text-sm text-red-600 mt-1">{verification.rejection_reason}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg lg:col-span-2">
                            <div className="p-6 bg-white border-b border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Documents</h4>
                                {verification.documents && verification.documents.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {verification.documents.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.document_type}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.original_filename}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(doc.file_size)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <a
                                                                href={route('admin.kyc.document-preview', doc.id)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Preview
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No documents uploaded.</p>
                                )}
                            </div>
                        </div>

                        {verification.status === 'submitted' && (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg lg:col-span-2">
                                <div className="p-6 bg-white border-b border-gray-200">
                                    <h4 className="text-md font-semibold text-gray-900 mb-4">Review Actions</h4>
                                    <div className="flex flex-wrap gap-4">
                                        <form onSubmit={handleApprove}>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                Approve
                                            </button>
                                        </form>
                                        <form onSubmit={handleReject} className="flex-1">
                                            <div className="mb-4">
                                                <textarea
                                                    value={data.reason}
                                                    onChange={(e) => setData('reason', e.target.value)}
                                                    placeholder="Reason for rejection (required)"
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    rows={3}
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                                disabled={!data.reason}
                                            >
                                                Reject
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
