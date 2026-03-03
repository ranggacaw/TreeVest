import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Farm, PageProps } from '@/types';

interface Props extends PageProps {
    farm: Farm;
}

export default function Show({ farm }: Props) {
    const handleApprove = () => {
        if (confirm('Approve this farm?')) {
            router.post(route('admin.farms.approve', farm.id));
        }
    };

    const handleReject = () => {
        const reason = prompt('Reason for rejection:');
        if (reason) {
            router.post(route('admin.farms.reject', farm.id), { reason });
        }
    };

    const handleSuspend = () => {
        if (confirm('Suspend this farm?')) {
            router.post(route('admin.farms.suspend', farm.id));
        }
    };

    const handleReinstate = () => {
        if (confirm('Reinstate this farm?')) {
            router.post(route('admin.farms.reinstate', farm.id));
        }
    };

    return (
        <AppLayout title="Farm Review">
            <Head title={`Farm: ${farm.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link href={route('admin.farms.index')} className="text-sm text-indigo-600 hover:underline">
                                &larr; Back to Farms
                            </Link>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">{farm.name}</h2>
                        </div>
                        <div className="flex gap-2">
                            {farm.status === 'pending_approval' && (
                                <>
                                    <button onClick={handleApprove} className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                                        Approve
                                    </button>
                                    <button onClick={handleReject} className="px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                                        Reject
                                    </button>
                                </>
                            )}
                            {farm.status === 'active' && (
                                <button onClick={handleSuspend} className="px-4 py-2 rounded bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700">
                                    Suspend
                                </button>
                            )}
                            {farm.status === 'suspended' && (
                                <button onClick={handleReinstate} className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                                    Reinstate
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Farm Details */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Details</h3>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Owner</dt>
                                    <dd className="text-sm font-medium text-gray-900">{farm.owner?.name ?? 'N/A'} ({farm.owner?.email})</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Status</dt>
                                    <dd className="text-sm font-medium text-gray-900 capitalize">{farm.status.replace('_', ' ')}</dd>
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
                                            alt="Farm image"
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
                                                <div className="text-xs text-gray-500">
                                                    {cert.expiry_date && `Expires: ${cert.expiry_date}`}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
