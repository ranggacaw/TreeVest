import React, { useState } from 'react';
import { format } from 'date-fns';

interface GrowthTimelineEntry {
    id: number;
    title: string;
    description?: string;
    milestone_type: {
        value: string;
        label: string;
        icon: string;
        color: string;
    };
    health_status?: {
        value: string;
        label: string;
        icon: string;
        color: string;
    };
    photos?: string[];
    tree_height_cm?: number;
    trunk_diameter_cm?: number;
    estimated_fruit_count?: number;
    notes?: string;
    recorded_date: string;
    recorded_by?: {
        name: string;
    };
}

interface GrowthTimelineProps {
    entries: GrowthTimelineEntry[];
    title?: string;
    emptyMessage?: string;
}

export default function GrowthTimeline({
    entries,
    title = 'Growth Timeline',
    emptyMessage = 'No growth updates available yet.',
}: GrowthTimelineProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    if (entries.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                </svg>
                <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    const getColorClasses = (color: string) => {
        const colorMap: Record<string, { bg: string; border: string; text: string }> = {
            green: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700' },
            blue: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700' },
            yellow: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700' },
            pink: { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-700' },
            orange: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700' },
            purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700' },
            red: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700' },
            gray: { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-700' },
            indigo: { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-700' },
            cyan: { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-700' },
            slate: { bg: 'bg-slate-100', border: 'border-slate-500', text: 'text-slate-700' },
        };

        return colorMap[color] || colorMap.slate;
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    {title}
                </h3>

                <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

                    {/* Timeline Entries */}
                    <div className="space-y-8">
                        {entries.map((entry, index) => {
                            const colors = getColorClasses(entry.milestone_type.color);

                            return (
                                <div key={entry.id} className="relative flex gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`flex-shrink-0 w-16 h-16 ${colors.bg} ${colors.border} border-4 rounded-full flex items-center justify-center text-2xl z-10`}
                                    >
                                        {entry.milestone_type.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-semibold text-gray-900">
                                                        {entry.title}
                                                    </h4>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}
                                                    >
                                                        {entry.milestone_type.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    {format(new Date(entry.recorded_date), 'MMMM d, yyyy')}
                                                    {entry.recorded_by && (
                                                        <span className="text-gray-400"> · by {entry.recorded_by.name}</span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Health Status Badge */}
                                            {entry.health_status && (
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-${entry.health_status.color}-100 text-${entry.health_status.color}-700`}
                                                >
                                                    <span>{entry.health_status.icon}</span>
                                                    <span>{entry.health_status.label}</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {entry.description && (
                                            <p className="text-sm text-gray-700 mb-3">{entry.description}</p>
                                        )}

                                        {/* Measurements */}
                                        {(entry.tree_height_cm ||
                                            entry.trunk_diameter_cm ||
                                            entry.estimated_fruit_count) && (
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                {entry.tree_height_cm && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                                            />
                                                        </svg>
                                                        <span className="text-gray-600">
                                                            Height: <strong>{entry.tree_height_cm} cm</strong>
                                                        </span>
                                                    </div>
                                                )}
                                                {entry.trunk_diameter_cm && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <svg
                                                            className="w-4 h-4 text-gray-500"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        <span className="text-gray-600">
                                                            Diameter: <strong>{entry.trunk_diameter_cm} cm</strong>
                                                        </span>
                                                    </div>
                                                )}
                                                {entry.estimated_fruit_count && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <span className="text-lg">🍎</span>
                                                        <span className="text-gray-600">
                                                            Est. Fruits: <strong>{entry.estimated_fruit_count}</strong>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Photos */}
                                        {entry.photos && entry.photos.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                                                {entry.photos.map((photo, photoIndex) => (
                                                    <button
                                                        key={photoIndex}
                                                        onClick={() => setSelectedPhoto(photo)}
                                                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-green-500 transition-colors"
                                                    >
                                                        <img
                                                            src={photo}
                                                            alt={`${entry.title} - Photo ${photoIndex + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {entry.notes && (
                                            <div className="bg-white rounded p-3 text-sm text-gray-700 border border-gray-200">
                                                <span className="font-medium text-gray-900">Notes: </span>
                                                {entry.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Photo Lightbox */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <img
                            src={selectedPhoto}
                            alt="Full size"
                            className="max-w-full max-h-full rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
