import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import FarmCard from '@/Components/FarmCard';
import FarmMap from '@/Components/FarmMap';
import { Farm } from '@/types';

interface Props {
    farms: {
        data: Farm[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        country?: string;
        climate?: string;
    };
    options: {
        countries: string[];
        climates: string[];
    };
}

export default function Index({ farms, filters, options }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Browse Farms</h1>
                    <p className="mt-2 text-gray-600">
                        Discover fruit tree investment opportunities
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search farms..."
                                defaultValue={filters.search}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                        <select
                            defaultValue={filters.country}
                            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        >
                            <option value="">All Countries</option>
                            {options.countries.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={filters.climate}
                            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        >
                            <option value="">All Climates</option>
                            {options.climates.map((climate) => (
                                <option key={climate} value={climate}>
                                    {climate}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 rounded-md ${
                                    viewMode === 'grid'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-2 rounded-md ${
                                    viewMode === 'map'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                Map
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <>
                        {farms.data.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {farms.data.map((farm) => (
                                    <FarmCard key={farm.id} farm={farm} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No farms found</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <FarmMap farms={farms.data} />
                    </div>
                )}

                {farms.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: farms.last_page }, (_, i) => i + 1).map((page) => (
                            <a
                                key={page}
                                href={`?page=${page}`}
                                className={`px-4 py-2 rounded-md ${
                                    page === farms.current_page
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 border'
                                }`}
                            >
                                {page}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
