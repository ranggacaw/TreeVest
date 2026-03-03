import React, { useState } from 'react';
import { FarmImage } from '@/types';

interface Props {
    images: FarmImage[];
    onDelete?: (image: FarmImage) => void;
}

export default function FarmImageGallery({ images, onDelete }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <span className="text-gray-500">No images available</span>
            </div>
        );
    }

    const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
    const selectedImage = sortedImages[selectedIndex];

    return (
        <div className="space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                <img
                    src={selectedImage.file_path.startsWith('http') ? selectedImage.file_path : `/storage/${selectedImage.file_path}`}
                    alt={selectedImage.caption || 'Farm image'}
                    className="w-full h-full object-cover"
                />
                {onDelete && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete(selectedImage);
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md"
                        title="Delete image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {sortedImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${index === selectedIndex
                                ? 'border-green-600'
                                : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            <img
                                src={image.file_path.startsWith('http') ? image.file_path : `/storage/${image.file_path}`}
                                alt={image.caption || `Farm image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {image.is_featured && (
                                <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                                    Featured
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
