import React from 'react';
import { Farm } from '@/types';
import FarmStatusBadge from './FarmStatusBadge';

interface Props {
    farm: Farm;
}

export default function FarmCard({ farm }: Props) {
    const featuredImage = farm.images?.find((img) => img.is_featured);
    const imageUrl = featuredImage?.file_path 
        ? `/storage/${featuredImage.file_path}`
        : '/images/placeholder-farm.jpg';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 bg-gray-200">
                <img
                    src={imageUrl}
                    alt={farm.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                    <FarmStatusBadge status={farm.status} />
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {farm.name}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                    {farm.city}, {farm.country}
                </p>

                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    {farm.size_hectares && (
                        <span>{farm.size_hectares} ha</span>
                    )}
                    {farm.capacity_trees && (
                        <span>{farm.capacity_trees.toLocaleString()} trees</span>
                    )}
                    {farm.climate && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            {farm.climate}
                        </span>
                    )}
                </div>

                {farm.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {farm.description}
                    </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                    <a
                        href={`/farms/${farm.id}`}
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                    >
                        View Details →
                    </a>
                </div>
            </div>
        </div>
    );
}
