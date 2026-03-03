import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, Farm } from '@/types';

interface Props extends PageProps {
    farm: Farm;
}

const statusColors: Record<string, string> = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    deactivated: 'bg-gray-100 text-gray-800',
};

export default function Show({ farm }: Props) {
    return (
        <AppLayout title="Farm Details">
            <Head title={farm.name} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link
                                href={route('farms.manage.index')}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                &larr; Back to My Farms
                            </Link>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">{farm.name}</h2>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={route('farms.manage.edit', farm.id)}
                                className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                            >
                                Edit
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Farm Details */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Details</h3>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Status</dt>
                                    <dd>
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[farm.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                            {farm.status.replace('_', ' ')}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Location</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {[farm.address, farm.city, farm.state, farm.country].filter(Boolean).join(', ')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Size</dt>
                                    <dd className="text-sm font-medium text-gray-900">{farm.size_hectares} hectares</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Capacity</dt>
                                    <dd className="text-sm font-medium text-gray-900">{farm.capacity_trees} trees</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Soil Type</dt>
                                    <dd className="text-sm font-medium text-gray-900">{farm.soil_type ?? 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Climate</dt>
                                    <dd className="text-sm font-medium text-gray-900">{farm.climate ?? 'N/A'}</dd>
                                </div>
                                {farm.latitude && farm.longitude && (
                                    <div className="col-span-2">
                                        <dt className="text-sm text-gray-500">Coordinates</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {farm.latitude.toFixed(6)}, {farm.longitude.toFixed(6)}
                                        </dd>
                                    </div>
                                )}
                                {farm.rejection_reason && (
                                    <div className="col-span-2">
                                        <dt className="text-sm text-gray-500">Rejection Reason</dt>
                                        <dd className="text-sm font-medium text-red-700">{farm.rejection_reason}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Description */}
                        {farm.description && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-sm text-gray-700">{farm.description}</p>
                            </div>
                        )}

                        {/* Images */}
                        {farm.images && farm.images.length > 0 && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Images ({farm.images.length})</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {farm.images.map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.file_path.startsWith('http') ? img.file_path : `/storage/${img.file_path}`}
                                            alt={img.caption || 'Farm image'}
                                            className="rounded-lg object-cover h-40 w-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {farm.certifications && farm.certifications.length > 0 && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                                <ul className="divide-y divide-gray-200">
                                    {farm.certifications.map((cert) => (
                                        <li key={cert.id} className="py-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                                                    <p className="text-xs text-gray-500">{cert.issuer} — #{cert.certificate_number}</p>
                                                </div>
                                                <div className="text-xs text-gray-500 text-right">
                                                    {cert.issued_date && `Issued: ${new Date(cert.issued_date).toLocaleDateString('id-ID')}`}
                                                    {cert.issued_date && cert.expiry_date && <br />}
                                                    {cert.expiry_date && `Expires: ${new Date(cert.expiry_date).toLocaleDateString('id-ID')}`}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Fruit Crops */}
                        {farm.fruit_crops && farm.fruit_crops.length > 0 && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fruit Crops ({farm.fruit_crops.length})</h3>
                                <div className="space-y-4">
                                    {farm.fruit_crops.map((crop) => (
                                        <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {crop.variant}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{crop.fruit_type.name}</p>
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    {crop.harvest_cycle.replace('_', ' ')}
                                                </div>
                                            </div>
                                            {crop.description && (
                                                <p className="text-sm text-gray-700">{crop.description}</p>
                                            )}
                                            {crop.trees && crop.trees.length > 0 && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {crop.trees.length} tree(s) available
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Historical Performance */}
                        {farm.historical_performance && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Historical Performance</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{farm.historical_performance}</p>
                            </div>
                        )}

                        {/* Virtual Tour */}
                        {farm.virtual_tour_url && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Virtual Tour</h3>
                                <Link
                                    href={farm.virtual_tour_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
                                >
                                    Open Virtual Tour
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
