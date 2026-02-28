import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Verification {
    id: number;
    documents: Document[];
}

interface Document {
    id: number;
    document_type: string;
    original_filename: string;
    file_size: number;
    uploaded_at: string;
}

interface Props {
    verification: Verification;
}

export default function Upload({ verification }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        document_type: '',
        file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', data.file!);
        formData.append('document_type', data.document_type);

        router.post(route('kyc.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setData({ document_type: '', file: null });
                router.reload();
            },
        });
    };

    const handleSubmitVerification = () => {
        router.post(route('kyc.submit'));
    };

    const documentTypes = [
        { value: 'passport', label: 'Passport' },
        { value: 'national_id', label: 'National ID' },
        { value: 'drivers_license', label: 'Driver\'s License' },
        { value: 'proof_of_address', label: 'Proof of Address' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Upload KYC Documents" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                                Upload KYC Documents
                            </h1>

                            {verification.documents.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                                        Uploaded Documents
                                    </h2>
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

                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">
                                    Upload New Document
                                </h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="document_type"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Document Type
                                        </label>
                                        <select
                                            id="document_type"
                                            value={data.document_type}
                                            onChange={(e) => setData('document_type', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select a document type</option>
                                            {documentTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.document_type && (
                                            <p className="mt-2 text-sm text-red-600">{errors.document_type}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label
                                            htmlFor="file"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            File
                                        </label>
                                        <input
                                            type="file"
                                            id="file"
                                            onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                            className="mt-1 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                        />
                                        {errors.file && (
                                            <p className="mt-2 text-sm text-red-600">{errors.file}</p>
                                        )}
                                        <p className="mt-2 text-xs text-gray-500">
                                            Accepted formats: JPG, PNG, PDF (max 10MB)
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Uploading...' : 'Upload Document'}
                                    </button>
                                </form>
                            </div>

                            <div className="border-t pt-6">
                                <button
                                    onClick={handleSubmitVerification}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                >
                                    Submit Verification
                                </button>
                                <p className="mt-2 text-sm text-gray-600">
                                    Make sure you have uploaded all required documents before submitting.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
