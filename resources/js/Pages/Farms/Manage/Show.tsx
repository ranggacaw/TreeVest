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
        <AppLayout title="Farm Details" subtitle={farm.name} >
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">{farm.name}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                Back
                            </button>
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
                                {/* Description */}
                                {farm.description && (
                                    <div className="col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                        <p className="text-sm text-gray-700">{farm.description}</p>
                                    </div>
                                )}
                            </dl>
                        </div>

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
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Fruit Crops {farm.fruit_crops && farm.fruit_crops.length > 0 && `(${farm.fruit_crops.length})`}
                                </h3>
                                <Link
                                    href={route('farm-owner.crops.create')}
                                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition"
                                >
                                    + Add Crop
                                </Link>
                            </div>

                            {farm.fruit_crops && farm.fruit_crops.length > 0 ? (
                                <div className="space-y-4">
                                    {farm.fruit_crops.map((crop) => (
                                        <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{crop.variant}</p>
                                                    <p className="text-xs text-gray-500">{crop.fruit_type.name} — <span className="capitalize">{crop.harvest_cycle.replace('_', ' ')}</span></p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('farm-owner.crops.edit', crop.id)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        Edit Crop
                                                    </Link>
                                                    <Link
                                                        href={`${route('farm-owner.trees.create')}?crop_id=${crop.id}`}
                                                        className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded hover:bg-indigo-100 transition"
                                                    >
                                                        + Add Tree
                                                    </Link>
                                                </div>
                                            </div>
                                            {crop.description && (
                                                <p className="text-sm text-gray-600 mb-3">{crop.description}</p>
                                            )}
                                            {crop.trees && crop.trees.length > 0 ? (
                                                <div className="mt-2 overflow-x-auto">
                                                    <table className="min-w-full text-xs divide-y divide-gray-100">
                                                        <thead>
                                                            <tr className="text-gray-500 uppercase tracking-wider">
                                                                <th className="pb-2 text-left font-medium pr-4">Tree ID</th>
                                                                <th className="pb-2 text-left font-medium pr-4">Age</th>
                                                                <th className="pb-2 text-left font-medium pr-4">Lifespan</th>
                                                                <th className="pb-2 text-left font-medium pr-4">Status</th>
                                                                <th className="pb-2 text-left font-medium pr-4">Price</th>
                                                                <th className="pb-2 text-right font-medium">ROI</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {crop.trees.map((tree: any) => (
                                                                <tr key={tree.id} className="text-gray-700">
                                                                    <td className="py-2 pr-4 font-mono">{tree.tree_identifier}</td>
                                                                    <td className="py-2 pr-4">{tree.age_years} yrs</td>
                                                                    <td className="py-2 pr-4">{tree.productive_lifespan_years} yrs</td>
                                                                    <td className="py-2 pr-4 capitalize">{tree.status?.replace('_', ' ')}</td>
                                                                    <td className="py-2 pr-4">Rp {(tree.price_cents / 100).toLocaleString('id-ID')}</td>
                                                                    <td className="py-2 text-right">
                                                                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                                                                            {tree.expected_roi_percent}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                    <p className="text-xs text-gray-500">No trees added yet for this crop.</p>
                                                    <Link
                                                        href={`${route('farm-owner.trees.create')}?crop_id=${crop.id}`}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        Add first tree →
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-3">No fruit crops have been added to this farm yet.</p>
                                    <Link
                                        href={route('farm-owner.crops.create')}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition"
                                    >
                                        + Add Your First Crop
                                    </Link>
                                </div>
                            )}
                        </div>

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
