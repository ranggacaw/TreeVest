import React from 'react';
import { Farm } from '@/types';
import FarmStatusBadge from './FarmStatusBadge';
import { MapPin, Trees, Sun } from 'lucide-react';

interface Props {
    farm: Farm;
}

export default function FarmCard({ farm }: Props) {
    const featuredImage = farm.images?.find((img) => img.is_featured);
    
    // Use an organic Unsplash placeholder if no image exists
    const fallbackImage = 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=800';
    const imageUrl = featuredImage?.file_path 
        ? `/storage/${featuredImage.file_path}`
        : fallbackImage;

    return (
        <div className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-soft transition-all duration-300 border border-sand group flex flex-col h-full">
            <div className="relative h-56 bg-sand overflow-hidden">
                <img
                    src={imageUrl}
                    alt={farm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 right-4">
                    <FarmStatusBadge status={farm.status} />
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-pine leading-tight line-clamp-1">
                            {farm.name}
                        </h3>
                        <div className="flex items-center text-sm text-earth-500 mt-1.5">
                            <MapPin className="w-4 h-4 mr-1 text-sage-500 flex-shrink-0" />
                            <span className="truncate">{farm.city}, {farm.country}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-sm text-earth-600">
                    {farm.size_hectares && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-sand/50 text-pine rounded-lg border border-sand">
                            <Sun className="w-3.5 h-3.5 mr-1.5 text-sun-500" />
                            {farm.size_hectares} ha
                        </span>
                    )}
                    {farm.capacity_trees && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-sage-50 text-pine rounded-lg border border-sage-100">
                            <Trees className="w-3.5 h-3.5 mr-1.5 text-sage-500" />
                            {farm.capacity_trees.toLocaleString()} trees
                        </span>
                    )}
                    {farm.climate && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-sun-50 text-sun-800 rounded-lg border border-sun-100">
                            {farm.climate}
                        </span>
                    )}
                </div>

                {farm.description && (
                    <p className="mt-4 text-sm text-earth-600 line-clamp-2 leading-relaxed">
                        {farm.description}
                    </p>
                )}

                <div className="mt-auto pt-6">
                    <a
                        href={`/farms/${farm.id}`}
                        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-pine-50 hover:bg-pine-100 text-pine font-medium rounded-xl transition-colors duration-200"
                    >
                        View Farm Details
                    </a>
                </div>
            </div>
        </div>
    );
}
