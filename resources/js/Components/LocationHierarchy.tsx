import React from 'react';

interface LocationHierarchyProps {
    farm: {
        id: number;
        name: string;
        city?: string;
        state?: string;
        country?: string;
    };
    warehouse?: {
        id: number;
        name: string;
    };
    rack?: {
        id: number;
        name: string;
    };
    lot?: {
        id: number;
        name: string;
    };
    tree?: {
        id: number;
        tree_identifier: string;
    };
    fruitCrop?: {
        id: number;
        variant: string;
        fruit_type: {
            name: string;
        };
    };
    compact?: boolean;
}

export default function LocationHierarchy({
    farm,
    warehouse,
    rack,
    lot,
    tree,
    fruitCrop,
    compact = false,
}: LocationHierarchyProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-medium">{farm.name}</span>
                {warehouse && (
                    <>
                        <span className="text-gray-400">›</span>
                        <span>{warehouse.name}</span>
                    </>
                )}
                {rack && (
                    <>
                        <span className="text-gray-400">›</span>
                        <span>{rack.name}</span>
                    </>
                )}
                {lot && (
                    <>
                        <span className="text-gray-400">›</span>
                        <span className="font-medium text-green-600">{lot.name}</span>
                    </>
                )}
                {tree && (
                    <>
                        <span className="text-gray-400">›</span>
                        <span className="text-blue-600">Tree {tree.tree_identifier}</span>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Tree Location
            </h3>

            <div className="space-y-3">
                {/* Farm */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Farm</div>
                        <div className="text-sm font-semibold text-gray-900">{farm.name}</div>
                        {(farm.city || farm.state || farm.country) && (
                            <div className="text-xs text-gray-600 mt-0.5">
                                {[farm.city, farm.state, farm.country].filter(Boolean).join(', ')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Warehouse */}
                {warehouse && (
                    <>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Warehouse</div>
                                <div className="text-sm font-semibold text-gray-900">{warehouse.name}</div>
                            </div>
                        </div>

                    </>
                )}

                {/* Rack */}
                {rack && (
                    <>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rack</div>
                                <div className="text-sm font-semibold text-">{rack.name}</div>
                            </div>
                        </div>
                    </>
                )}

                {/* Lot */}
                {lot && (
                    <>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Investment Lot</div>
                                <div className="text-sm font-semibold text-gray-900">{lot.name}</div>
                            </div>
                        </div>
                    </>
                )}

                {/* Tree */}
                {tree && (
                    <>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                🌳
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tree</div>
                                <div className="text-sm font-semibold text-blue-600">Tree #{tree.tree_identifier}</div>
                            </div>
                        </div>
                    </>
                )}

                {/* Fruit Crop */}
                {fruitCrop && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            🍎
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop Type</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {fruitCrop.fruit_type.name}
                                {fruitCrop.variant && <span className="text-gray-600"> - {fruitCrop.variant}</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
