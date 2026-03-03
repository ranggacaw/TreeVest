import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Document {
    id: number;
    document_type: string;
    original_filename: string;
    file_size: number;
    uploaded_at: string;
}

interface Verification {
    id: number;
    status: string;
    submitted_at?: string;
    verified_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
    expires_at?: string;
    provider: string;
    provider_reference_id?: string;
    documents: Document[];
}

interface Props {
    verification: Verification;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-800' },
    submitted: { bg: 'bg-blue-100', text: 'text-blue-800' },
    verified: { bg: 'bg-green-100', text: 'text-green-800' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800' },
};

const documentTypeLabels: Record<string, string> = {
    passport: 'Passport',
    national_id: 'National ID',
    drivers_license: 'Driver\'s License',
    proof_of_address: 'Proof of Address',
};

function formatFileSize(mb: number): string {
    if (mb < 1) {
        return `${(mb * 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
}

function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('id-ID');
}

export default function Show({ verification }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="KYC Verification Details" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link
                            href={route('kyc.index')}
                            className="text-sm text-indigo-600 hover:underline"
                        >
                            &larr; Back to KYC Verification
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900">
                            Verification #{verification.id}
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Status Overview */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusColors[verification.status]?.bg} ${statusColors[verification.status]?.text}`}>
                                {verification.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-500">Provider</dt>
                                <dd className="font-medium text-gray-900">{verification.provider}</dd>
                            </div>
                            {verification.provider_reference_id && (
                                <div>
                                    <dt className="text-gray-500">Provider Reference</dt>
                                    <dd className="font-medium text-gray-900">{verification.provider_reference_id}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-gray-500">Submitted At</dt>
                                <dd className="font-medium text-gray-900">{formatDate(verification.submitted_at)}</dd>
                            </div>
                            {verification.verified_at && (
                                <div>
                                    <dt className="text-gray-500">Verified At</dt>
                                    <dd className="font-medium text-gray-900">{formatDate(verification.verified_at)}</dd>
                                </div>
                            )}
                            {verification.rejected_at && (
                                <div>
                                    <dt className="text-gray-500">Rejected At</dt>
                                    <dd className="font-medium text-red-700">{formatDate(verification.rejected_at)}</dd>
                                </div>
                            )}
                            {verification.expires_at && (
                                <div>
                                    <dt className="text-gray-500">Expires At</dt>
                                    <dd className="font-medium text-gray-900">{formatDate(verification.expires_at)}</dd>
                                </div>
                            )}
                        </dl>

                        {verification.rejection_reason && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</h3>
                                <p className="text-sm text-red-700">{verification.rejection_reason}</p>
                            </div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Uploaded Documents ({verification.documents.length})
                        </h2>

                        {verification.documents.length > 0 ? (
                            <div className="space-y-3">
                                {verification.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {documentTypeLabels[doc.document_type] || doc.document_type}
                                                </p>
                                                <p className="text-xs text-gray-500">{doc.original_filename}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">{formatFileSize(doc.file_size)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(doc.uploaded_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Link
                            href={route('kyc.index')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                            Back to KYC Overview
                        </Link>
                        {verification.status === 'verified' && verification.expires_at && new Date(verification.expires_at) < new Date() && (
                            <Link
                                href={route('kyc.index')}
                                className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 border border-yellow-200 text-sm font-medium"
                            >
                                Renew Verification
                            </Link>
                        )}
                        {(verification.status === 'pending' || verification.status === 'rejected') && (
                            <Link
                                href={route('kyc.upload')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                            >
                                Upload Documents
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
