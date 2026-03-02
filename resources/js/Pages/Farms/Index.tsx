import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import FarmCard from '@/Components/FarmCard';
import FarmMap from '@/Components/FarmMap';
import { Farm } from '@/types';
import { Search, Map as MapIcon, LayoutGrid, Leaf, MapPin, ThermometerSun } from 'lucide-react';

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
        <div className="min-h-screen bg-[#FDFBF7] font-sans pb-16">
            {/* Hero Section */}
            <div className="bg-pine text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="p-2 bg-sage/20 rounded-xl">
                            <Leaf className="w-6 h-6 text-sage-300" />
                        </span>
                        <span className="text-sage-100 font-medium tracking-wide uppercase text-sm">PARTNER FARMS</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Browse Farms</h1>
                    <p className="text-lg text-sage-100 max-w-2xl">
                        Discover vetted agricultural opportunities across the globe. Invest directly in mature orchards and share in the harvest yields.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Filter Bar */}
                <div className="bg-white rounded-2xl shadow-card p-2 md:p-4 mb-8 border border-sand flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-earth-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by farm name or location..."
                            defaultValue={filters.search}
                            className="block w-full pl-11 pr-3 py-3 border-0 bg-sand/30 rounded-xl text-pine placeholder-earth-400 focus:ring-2 focus:ring-pine-500 focus:bg-white transition-colors"
                        />
                    </div>
                    
                    <div className="flex w-full md:w-auto gap-3">
                        <div className="relative w-full md:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-4 w-4 text-earth-400" />
                            </div>
                            <select
                                defaultValue={filters.country}
                                className="block w-full pl-9 pr-10 py-3 border-0 bg-sand/30 rounded-xl text-pine focus:ring-2 focus:ring-pine-500 focus:bg-white transition-colors appearance-none"
                            >
                                <option value="">All Regions</option>
                                {options.countries.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="relative w-full md:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ThermometerSun className="h-4 w-4 text-earth-400" />
                            </div>
                            <select
                                defaultValue={filters.climate}
                                className="block w-full pl-9 pr-10 py-3 border-0 bg-sand/30 rounded-xl text-pine focus:ring-2 focus:ring-pine-500 focus:bg-white transition-colors appearance-none"
                            >
                                <option value="">All Climates</option>
                                {options.climates.map((climate) => (
                                    <option key={climate} value={climate}>
                                        {climate}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="hidden md:flex bg-sand/50 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white text-pine shadow-sm'
                                    : 'text-earth-500 hover:text-pine hover:bg-sand'
                            }`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                                viewMode === 'map'
                                    ? 'bg-white text-pine shadow-sm'
                                    : 'text-earth-500 hover:text-pine hover:bg-sand'
                            }`}
                            title="Map View"
                        >
                            <MapIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* View Content */}
                {viewMode === 'grid' ? (
                    <>
                        {farms.data.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {farms.data.map((farm) => (
                                    <FarmCard key={farm.id} farm={farm} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-sand">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sand mb-4">
                                    <Leaf className="w-8 h-8 text-earth-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-pine mb-2">No farms found</h3>
                                <p className="text-earth-500 max-w-md mx-auto">
                                    We couldn't find any farms matching your current filters. Try adjusting your search criteria or exploring different regions.
                                </p>
                                <button 
                                    onClick={() => window.location.href = '/farms'}
                                    className="mt-6 px-6 py-2.5 bg-pine text-white rounded-xl hover:bg-pine-600 transition-colors font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-3xl shadow-card p-4 border border-sand h-[600px] overflow-hidden">
                        <FarmMap farms={farms.data} />
                    </div>
                )}

                {/* Pagination */}
                {farms.last_page > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                        {Array.from({ length: farms.last_page }, (_, i) => i + 1).map((page) => (
                            <a
                                key={page}
                                href={`?page=${page}`}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all ${
                                    page === farms.current_page
                                        ? 'bg-pine text-white shadow-soft'
                                        : 'bg-white text-earth-600 border border-sand hover:border-pine-300 hover:text-pine'
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
