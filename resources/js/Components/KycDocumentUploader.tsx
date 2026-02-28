import React, { useCallback, useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { KycDocumentType } from '@/types';

interface Props {
    documentType: KycDocumentType;
    label: string;
    required?: boolean;
    acceptedFileTypes?: string[];
    maxFileSize?: number;
    onUploadSuccess?: (document: { id: string; file_path: string }) => void;
}

export default function KycDocumentUploader({
    documentType,
    label,
    required = false,
    acceptedFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    maxFileSize = 10 * 1024 * 1024,
    onUploadSuccess,
}: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (!acceptedFileTypes.includes(file.type)) {
            return 'Invalid file type. Please upload a PDF, JPEG, or PNG file.';
        }
        if (file.size > maxFileSize) {
            return `File is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB.`;
        }
        return null;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, [acceptedFileTypes, maxFileSize]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = useCallback(() => {
        if (!selectedFile) return;

        setUploadProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('document', selectedFile);

        fetch('/profile/kyc/documents', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((err) => Promise.reject(err));
                }
                return response.json();
            })
            .then((data) => {
                setUploadProgress(100);
                if (onUploadSuccess && data.kyc_document) {
                    onUploadSuccess(data.kyc_document);
                }
                setPreview(null);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            })
            .catch((err: any) => {
                setError(err.document || err.message || 'Upload failed. Please try again.');
                setUploadProgress(null);
            });
    }, [selectedFile, documentType, onUploadSuccess]);

    const handleRemove = () => {
        setPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <span className="text-xs text-gray-500">
                    Max: {Math.round(maxFileSize / 1024 / 1024)}MB
                </span>
            </div>

            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}
                    ${error ? 'border-red-300 bg-red-50' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {preview ? (
                    <div className="space-y-3">
                        <img
                            src={preview}
                            alt="Document preview"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="text-sm text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <svg
                            className="mx-auto h-10 w-10 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                <span>Upload a file</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="sr-only"
                                    accept={acceptedFileTypes.join(',')}
                                    onChange={handleChange}
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                            PDF, JPEG, PNG up to {Math.round(maxFileSize / 1024 / 1024)}MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {selectedFile && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(selectedFile.size)})</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploadProgress !== null}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Upload
                    </button>
                </div>
            )}
        </div>
    );
}
