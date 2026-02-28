import React from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KycStatusBadge from '@/Components/KycStatusBadge';

interface KycVerification {
    id: number;
    status: 'pending' | 'submitted' | 'verified' | 'rejected';
    submitted_at?: string;
    verified_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
    expires_at?: string;
    has_required_documents: boolean;
    documents: KycDocument[];
}

interface KycDocument {
    id: number;
    document_type: string;
    original_filename: string;
    file_size: number;
    uploaded_at: string;
}

interface Props {
    verification: KycVerification | null;
    required_documents: string[];
    optional_documents: string[];
}

export default function Index({ verification, required_documents, optional_documents }: Props) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="KYC Verification" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                                KYC Verification
                            </h1>

                            {flash?.success && (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-800">{flash.success}</p>
                                </div>
                            )}

                            {flash?.error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-800">{flash.error}</p>
                                </div>
                            )}

                            {!verification ? (
                                <div>
                                    <p className="text-gray-600 mb-6">
                                        You haven't started the KYC verification process yet.
                                    </p>
                                    <a
                                        href={route('kyc.upload')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Start Verification
                                    </a>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-6">
                                        <h2 className="text-lg font-medium text-gray-900 mb-2">
                                            Verification Status
                                        </h2>
                                        <KycStatusBadge status={verification.status} />
                                    </div>

                                    {verification.rejection_reason && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-sm text-red-800">
                                                <strong>Reason:</strong> {verification.rejection_reason}
                                            </p>
                                        </div>
                                    )}

                                    {verification.expires_at && (
                                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <p className="text-sm text-yellow-800">
                                                <strong>Expires:</strong> {new Date(verification.expires_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {verification.documents.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                Uploaded Documents
                                            </h3>
                                            <div className="space-y-3">
                                                {verification.documents.map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {doc.document_type.replace('_', ' ').toUpperCase()}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {doc.original_filename} ({doc.file_size.toFixed(2)} MB)
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(verification.status === 'pending' || verification.status === 'rejected') && (
                                        <a
                                            href={route('kyc.upload')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {verification.status === 'rejected' ? 'Resubmit' : 'Continue Verification'}
                                        </a>
                                    )}

                                    {verification.status === 'submitted' && (
                                        <p className="text-gray-600">
                                            Your verification is under review. We'll notify you once it's processed.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
