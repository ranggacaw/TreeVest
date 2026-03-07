import React, { useState, useEffect } from 'react';
import { Farm } from '@/types';
import FarmStatusBadge from './FarmStatusBadge';
import { MapPin, Trees, Sun, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    farm: Farm;
}

export default function FarmCard({ farm }: Props) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const images = farm.images?.length ? farm.images : [];

    // Use an organic Unsplash placeholder if no image exists
    const fallbackImage = 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=800';

    useEffect(() => {
        if (images.length > 0) {
            const featuredIndex = images.findIndex((img) => img.is_featured);
            setCurrentImageIndex(featuredIndex >= 0 ? featuredIndex : 0);
        }
    }, [farm.id, images.length]);

    const getImageUrl = (filePath?: string) => {
        if (!filePath) return fallbackImage;
        return filePath.startsWith('http') ? filePath : `/storage/${filePath}`;
    };

    return (
        <div className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-soft transition-all duration-300 border border-sand group flex flex-col h-full">
            <div
                className="relative h-56 bg-sand overflow-hidden group/image"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img
                    src={images.length > 0 ? getImageUrl(images[currentImageIndex]?.file_path) : fallbackImage}
                    alt={farm.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />

                {images.length > 1 && isHovered && (
                    <>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm transition-all z-10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm transition-all z-10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {images.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}

                <div className="absolute top-4 right-4 z-20">
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
