import { useState, useRef } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';

interface AvatarUploadProps {
    currentAvatar?: string;
    maxSize?: number;
    allowedTypes?: string[];
    onUpload: (file: File) => void;
    onDelete: () => void;
}

export default function AvatarUpload({
    currentAvatar,
    maxSize = 2 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    onUpload,
    onDelete,
}: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatar || null);
    const [error, setError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
        }

        if (file.size > maxSize) {
            return `File size exceeds ${maxSize / (1024 * 1024)}MB limit.`;
        }

        return null;
    };

    const handleFileSelect = (file: File | null) => {
        if (!file) {
            setError('');
            return;
        }

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onUpload(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFileSelect(file || null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = () => {
        setPreview(null);
        setError('');
        onDelete();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Profile Avatar
                </label>
                <p className="mt-1 text-sm text-gray-500">
                    Upload a profile picture. Recommended size: 512x512px. Max file size: {maxSize / (1024 * 1024)}MB.
                </p>
            </div>

            <div className="flex items-start gap-6">
                <div className="relative h-32 w-32 shrink-0">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Avatar preview"
                            className="h-full w-full rounded-full border-4 border-gray-200 object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-dashed border-gray-300 bg-gray-50">
                            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
                            isDragging
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-indigo-600 hover:text-indigo-500">
                                Upload a file
                            </span>{' '}
                            or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            JPEG, PNG, or WebP up to {maxSize / (1024 * 1024)}MB
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={allowedTypes.join(',')}
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    <div className="flex gap-3">
                        <SecondaryButton onClick={handleClick}>
                            Choose File
                        </SecondaryButton>
                        {preview && currentAvatar && (
                            <DangerButton onClick={handleDelete}>
                                Remove Avatar
                            </DangerButton>
                        )}
                    </div>
                </div>
            </div>

            <InputError message={error} />
        </div>
    );
}
