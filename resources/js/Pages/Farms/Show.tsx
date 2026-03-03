import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import FarmImageGallery from '@/Components/FarmImageGallery';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import FarmMap from '@/Components/FarmMap';
import { Farm } from '@/types';

interface Props {
    farm: Farm;
}

export default function Show({ farm }: Props) {
    const [expandedCrops, setExpandedCrops] = useState<Record<number, boolean>>({});

    const toggleCrop = (cropId: number) => {
        setExpandedCrops(prev => ({
            ...prev,
            [cropId]: !prev[cropId]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-6">
                    <a
                        href="/farms"
                        className="text-green-600 hover:text-green-700 flex items-center gap-2"
                    >
                        ← Back to Farms
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {farm.images && farm.images.length > 0 ? (
                            <FarmImageGallery images={farm.images} />
                        ) : (
                            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                                <span className="text-gray-500">No images available</span>
                            </div>
                        )}

                        <div className="mt-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {farm.name}
                            </h1>
                            <div className="mt-2 flex items-center gap-4">
                                <FarmStatusBadge status={farm.status} />
                                <span className="text-gray-600">
                                    {farm.city}, {farm.country}
                                </span>
                            </div>
                        </div>

                        {farm.description && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    About This Farm
                                </h2>
                                <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                                    {farm.description}
                                </p>
                            </div>
                        )}

                        {farm.historical_performance && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Historical Performance
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    {farm.historical_performance}
                                </p>
                            </div>
                        )}

                        {farm.certifications && farm.certifications.length > 0 && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Certifications
                                </h2>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {farm.certifications.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="bg-white border rounded-lg p-4"
                                        >
                                            <h3 className="font-medium text-gray-900">
                                                {cert.name}
                                            </h3>
                                            {cert.issuer && (
                                                <p className="text-sm text-gray-600">
                                                    Issuer: {cert.issuer}
                                                </p>
                                            )}
                                            {cert.certificate_number && (
                                                <p className="text-sm text-gray-600">
                                                    Certificate #: {cert.certificate_number}
                                                </p>
                                            )}
                                            {cert.expiry_date && (
                                                <p className="text-sm text-gray-600">
                                                    Expires: {cert.expiry_date}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Farm Details
                            </h2>
                            <dl className="mt-4 space-y-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Size</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {farm.size_hectares} hectares
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Capacity</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {farm.capacity_trees?.toLocaleString()} trees
                                    </dd>
                                </div>
                                {farm.soil_type && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Soil Type</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {farm.soil_type}
                                        </dd>
                                    </div>
                                )}
                                {farm.climate && (
                                    <div>
                                        <dt className="text-sm text-gray-500">Climate</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {farm.climate}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Location
                            </h2>
                            <div className="mt-4">
                                {farm.latitude && farm.longitude ? (
                                    <FarmMap farms={[farm]} zoom={15} />
                                ) : (
                                    <p className="text-gray-500">Location not available</p>
                                )}
                            </div>
                            <p className="mt-4 text-sm text-gray-600">
                                {farm.address}<br />
                                {farm.city}, {farm.state} {farm.postal_code}<br />
                                {farm.country}
                            </p>
                        </div>

                        {farm.virtual_tour_url && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Virtual Tour
                                </h2>
                                <a
                                    href={farm.virtual_tour_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    View Virtual Tour
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1">
                    {farm.fruit_crops && farm.fruit_crops.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Opportunities</h2>
                            <div className="space-y-8">
                                {farm.fruit_crops.map((crop) => (
                                    <div key={crop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                                                    {crop.fruit_type?.name}{' '}
                                                    <span className="text-sm font-normal px-2 py-1 bg-green-50 text-green-700 rounded-full">
                                                        {crop.variant}
                                                    </span>
                                                </h3>
                                                {crop.description && <p className="text-gray-600 mt-2">{crop.description}</p>}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="bg-gray-50 px-3 py-1 rounded text-sm text-gray-600 whitespace-nowrap">
                                                    Cycle: <span className="font-medium capitalize">{crop.harvest_cycle}</span>
                                                </div>
                                                {crop.trees && crop.trees.length > 1 && (
                                                    <button
                                                        onClick={() => toggleCrop(crop.id)}
                                                        className="text-sm font-medium text-green-600 hover:text-green-700 focus:outline-none flex items-center gap-1"
                                                    >
                                                        {expandedCrops[crop.id] ? 'Hide Options' : `View ${crop.trees.length} Options`}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {crop.trees && crop.trees.length > 0 ? (
                                            <div className={`mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4 ${!expandedCrops[crop.id] && crop.trees.length > 1 ? 'hidden' : ''}`}>
                                                {crop.trees.map((tree) => (
                                                    <div
                                                        key={tree.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="font-mono text-sm text-gray-500">
                                                                {tree.tree_identifier || tree.identifier}
                                                            </span>
                                                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                                                ROI {tree.expected_roi_percent}%
                                                            </span>
                                                        </div>
                                                        <div className="mb-4">
                                                            <div className="text-2xl font-bold text-gray-900">
                                                                Rp{' '}
                                                                {(tree.price_cents / 100).toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1 flex justify-between">
                                                                <span>
                                                                    Min: Rp {(tree.min_investment_cents / 100).toLocaleString('id-ID')}
                                                                </span>
                                                                <span>
                                                                    Max: Rp {(tree.max_investment_cents / 100).toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={`/investments/create/${tree.id}`}
                                                            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                                                        >
                                                            Invest Now
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                                                No trees currently available for investment in this crop.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
