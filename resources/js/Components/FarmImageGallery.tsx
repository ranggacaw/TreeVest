import React, { useState } from 'react';
import { FarmImage } from '@/types';

interface Props {
    images: FarmImage[];
}

export default function FarmImageGallery({ images }: Props) {
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
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                    src={`/storage/${selectedImage.file_path}`}
                    alt={selectedImage.caption || 'Farm image'}
                    className="w-full h-full object-cover"
                />
            </div>

            {sortedImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                index === selectedIndex
                                    ? 'border-green-600'
                                    : 'border-transparent hover:border-gray-300'
                            }`}
                        >
                            <img
                                src={`/storage/${image.file_path}`}
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
