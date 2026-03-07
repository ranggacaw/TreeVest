import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import FarmImageGallery from '@/Components/FarmImageGallery';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import FarmMap from '@/Components/FarmMap';
import { Farm } from '@/types';
import { useTranslation } from 'react-i18next';

interface Props {
    farm: Farm;
}

export default function Show({ farm }: Props) {
    const { t } = useTranslation('farms');
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
                        {t('back_to_farms')}
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {farm.images && farm.images.length > 0 ? (
                            <FarmImageGallery images={farm.images} />
                        ) : (
                            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                                <span className="text-gray-500">{t('no_images_available')}</span>
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
                                    {t('about_this_farm')}
                                </h2>
                                <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                                    {farm.description}
                                </p>
                            </div>
                        )}

                        {farm.historical_performance && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {t('historical_performance')}
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    {farm.historical_performance}
                                </p>
                            </div>
                        )}

                        {farm.certifications && farm.certifications.length > 0 && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {t('certifications')}
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
                                                    {t('issuer')} {cert.issuer}
                                                </p>
                                            )}
                                            {cert.certificate_number && (
                                                <p className="text-sm text-gray-600">
                                                    {t('certificate_no')} {cert.certificate_number}
                                                </p>
                                            )}
                                            {cert.expiry_date && (
                                                <p className="text-sm text-gray-600">
                                                    {t('expires')} {cert.expiry_date}
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
                                {t('farm_details')}
                            </h2>
                            <dl className="mt-4 space-y-4">
                                <div>
                                    <dt className="text-sm text-gray-500">{t('size')}</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {farm.size_hectares} {t('hectares')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">{t('capacity')}</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {farm.capacity_trees?.toLocaleString()} {t('trees')}
                                    </dd>
                                </div>
                                {farm.soil_type && (
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('soil_type')}</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {farm.soil_type}
                                        </dd>
                                    </div>
                                )}
                                {farm.climate && (
                                    <div>
                                        <dt className="text-sm text-gray-500">{t('climate')}</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {farm.climate}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('location')}
                            </h2>
                            <div className="mt-4">
                                {farm.latitude && farm.longitude ? (
                                    <FarmMap farms={[farm]} zoom={15} />
                                ) : (
                                    <p className="text-gray-500">{t('location_not_available')}</p>
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
                                    {t('virtual_tour')}
                                </h2>
                                <a
                                    href={farm.virtual_tour_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    {t('view_virtual_tour')}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1">
                    {farm.fruit_crops && farm.fruit_crops.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('investment_opportunities')}</h2>

                            <div className="py-6 mb-8">
                                <h3 className="text-lg font-semibold text-green-900 mb-4">{t('understanding_your_investment', 'Understanding Your Investment')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className='bg-green-50 border border-green-100 rounded-xl px-6 py-4'>
                                        <h4 className="font-semibold text-green-800">{t('how_roi_works', 'How ROI Works')}</h4>
                                        <p className="text-sm text-green-700 mt-2">
                                            {t('roi_explanation', 'The Expected ROI is the estimated profit percentage you will earn over the harvest cycle. This is calculated based on historical yield data and current market prices.')}
                                        </p>
                                    </div>
                                    <div className='bg-green-50 border border-green-100 rounded-xl px-6 py-4'>
                                        <h4 className="font-semibold text-green-800">{t('return_of_capital', 'Return of Capital')}</h4>
                                        <p className="text-sm text-green-700 mt-2">
                                            {t('capital_explanation', 'Once the crop is harvested and sold, your initial capital is returned to you alongside your calculated profits as a final payout or reinvestment option.')}
                                        </p>
                                    </div>
                                    <div className='bg-green-50 border border-green-100 rounded-xl px-6 py-4'>
                                        <h4 className="font-semibold text-green-800">{t('tree_age_and_lifecycle', 'Tree Lifespan & Yield')}</h4>
                                        <p className="text-sm text-green-700 mt-2">
                                            {t('age_explanation', "A tree's 'Remaining Productivity' is its Total Lifespan minus its Current Age. This tells you exactly how many more years the tree will continue to produce harvests and generate ongoing revenue for you.")}
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                                    {t('cycle')} <span className="font-medium capitalize">{crop.harvest_cycle}</span>
                                                </div>
                                                {crop.trees && crop.trees.length > 1 && (
                                                    <button
                                                        onClick={() => toggleCrop(crop.id)}
                                                        className="text-sm font-medium text-green-600 hover:text-green-700 focus:outline-none flex items-center gap-1"
                                                    >
                                                        {expandedCrops[crop.id] ? t('hide_options') : t('view_options', { count: crop.trees.length })}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {crop.trees && crop.trees.length > 0 ? (
                                            <div className={`mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4 ${!expandedCrops[crop.id] && crop.trees.length > 1 ? 'hidden' : ''}`}>
                                                {crop.trees.map((tree: any) => (
                                                    <div
                                                        key={tree.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="font-mono text-sm text-gray-500">
                                                                {tree.tree_identifier || tree.identifier}
                                                            </span>
                                                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                                                {t('expected_roi', 'Expected ROI:')} {tree.expected_roi_percent}%
                                                            </span>
                                                        </div>
                                                        {tree.age_years !== undefined && tree.productive_lifespan_years !== undefined && (
                                                            <div className="flex flex-col text-xs text-gray-500 mb-3 gap-1">
                                                                <div className="flex justify-between">
                                                                    <span>{t('tree_age', 'Tree Age')}: {tree.age_years} {t('years_short', 'yrs')}</span>
                                                                    <span>{t('total_lifespan', 'Total Lifespan')}: {tree.productive_lifespan_years} {t('years_short', 'yrs')}</span>
                                                                </div>
                                                                <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-center mt-1 border border-green-100">
                                                                    {t('produces_yields_for', 'Produces yields for the next')} <span className="font-bold">{Math.max(0, tree.productive_lifespan_years - tree.age_years)} {t('years', 'years')}</span>
                                                                </div>
                                                            </div>
                                                        )}
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
                                                                    {t('min')} Rp {(tree.min_investment_cents / 100).toLocaleString('id-ID')}
                                                                </span>
                                                                <span>
                                                                    {t('max')} Rp {(tree.max_investment_cents / 100).toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={`/investments/create/${tree.id}`}
                                                            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                                                        >
                                                            {t('invest_now')}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                                                {t('no_trees_available')}
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
