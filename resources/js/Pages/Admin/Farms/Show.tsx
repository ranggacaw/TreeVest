import { Link, router } from '@inertiajs/react';
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
        <AppLayout
            title="Farm Review"
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-pine-800 tracking-tight">
                            {farm.name}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        {farm.status === 'pending_approval' && (
                            <>
                                <button onClick={handleApprove} className="px-4 py-2 rounded-xl bg-pine text-sand text-sm font-bold hover:bg-pine-800 transition-colors shadow-soft">
                                    Approve
                                </button>
                                <button onClick={handleReject} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-soft">
                                    Reject
                                </button>
                            </>
                        )}
                        {farm.status === 'active' && (
                            <button onClick={handleSuspend} className="px-4 py-2 rounded-xl bg-sun text-pine-900 text-sm font-bold hover:bg-yellow-500 transition-colors shadow-soft">
                                Suspend
                            </button>
                        )}
                        {farm.status === 'suspended' && (
                            <button onClick={handleReinstate} className="px-4 py-2 rounded-xl bg-sage-500 text-white text-sm font-bold hover:bg-sage-600 transition-colors shadow-soft">
                                Reinstate
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="mb-6">
                        <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Farm Details */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-sand-200">
                            <h3 className="text-xl font-bold text-pine-800 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-pine-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Farm Details
                            </h3>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Details</h3>
                            <dl className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <dt className="text-sm font-medium text-pine-500">Owner</dt>
                                    <dd className="font-bold text-pine-800 mt-1">{farm.owner?.name ?? 'N/A'}</dd>
                                    <dd className="text-sm text-pine-500">{farm.owner?.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-pine-500">Status</dt>
                                    <dd className="font-bold text-pine-800 capitalize mt-1 border inline-block px-3 py-1 rounded-lg text-sm bg-sand-50">{farm.status.replace('_', ' ')}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-pine-500">Location</dt>
                                    <dd className="font-bold text-pine-800 mt-1">
                                        {[farm.address, farm.city, farm.state, farm.country].filter(Boolean).join(', ')}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-pine-500">Size</dt>
                                    <dd className="font-bold text-pine-800 mt-1">{farm.size_hectares} hectares</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-pine-500">Capacity</dt>
                                    <dd className="font-bold text-pine-800 mt-1">{farm.capacity_trees} trees</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-pine-500">Soil Type</dt>
                                    <dd className="font-bold text-pine-800 mt-1">{farm.soil_type ?? 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-pine-500">Climate</dt>
                                    <dd className="font-bold text-pine-800 mt-1">{farm.climate ?? 'N/A'}</dd>
                                </div>
                                {farm.rejection_reason && (
                                    <div className="col-span-2 mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                        <dt className="text-sm font-bold text-red-800">Rejection Reason</dt>
                                        <dd className="text-sm text-red-700 mt-1">{farm.rejection_reason}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Description */}
                        {farm.description && (
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-sand-200">
                                <h3 className="text-xl font-bold text-pine-800 mb-4">Description</h3>
                                <p className="text-pine-600 leading-relaxed whitespace-pre-wrap">{farm.description}</p>
                            </div>
                        )}

                        {/* Images */}
                        {farm.images && farm.images.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-sand-200">
                                <h3 className="text-xl font-bold text-pine-800 mb-6">Farm Images ({farm.images.length})</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {farm.images.map((img) => (
                                        <div key={img.id} className="relative aspect-video rounded-2xl overflow-hidden bg-sand-100">
                                            <img
                                                src={img.file_path.startsWith('http') ? img.file_path : `/storage/${img.file_path}`}
                                                alt="Farm image"
                                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {farm.certifications && farm.certifications.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-sand-200">
                                <h3 className="text-xl font-bold text-pine-800 mb-6">Certifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {farm.certifications.map((cert) => (
                                        <div key={cert.id} className="bg-sand-50 rounded-2xl border border-sand-200 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-bold text-pine-800">{cert.name}</p>
                                                    <p className="text-sm text-pine-600 mt-1">{cert.issuer}</p>
                                                    <p className="text-xs text-pine-400 font-mono mt-1">#{cert.certificate_number}</p>
                                                </div>
                                                {cert.expiry_date && (
                                                    <span className="inline-flex bg-white px-2 py-1 rounded-lg text-xs font-bold text-pine-500 border border-sand-200">
                                                        Exp: {cert.expiry_date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
