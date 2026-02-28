import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import FarmImageGallery from '@/Components/FarmImageGallery';
import { Farm } from '@/types';

interface Props {
    farm: Farm;
}

interface Certification {
    name: string;
    issuer: string;
    certificate_number: string;
    issued_date: string;
    expiry_date: string;
}

export default function Edit({ farm }: Props) {
    const { data, setData, put, errors, processing } = useForm({
        name: farm.name || '',
        description: farm.description || '',
        address: farm.address || '',
        city: farm.city || '',
        state: farm.state || '',
        country: farm.country || '',
        postal_code: farm.postal_code || '',
        latitude: farm.latitude?.toString() || '',
        longitude: farm.longitude?.toString() || '',
        size_hectares: farm.size_hectares?.toString() || '',
        capacity_trees: farm.capacity_trees?.toString() || '',
        soil_type: farm.soil_type || '',
        climate: farm.climate || '',
        historical_performance: farm.historical_performance || '',
        virtual_tour_url: farm.virtual_tour_url || '',
        certifications: farm.certifications || [] as Certification[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/farms/manage/${farm.id}`, {
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <a
                        href="/farms/manage"
                        className="text-green-600 hover:text-green-700 flex items-center gap-2"
                    >
                        ← Back to My Farms
                    </a>
                    <div className="mt-4 flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Edit Farm
                        </h1>
                        <FarmStatusBadge status={farm.status} />
                    </div>
                    {farm.status === 'pending_approval' && (
                        <p className="mt-2 text-yellow-600">
                            This farm is pending approval. Any changes will require re-approval.
                        </p>
                    )}
                </div>

                {farm.images && farm.images.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Current Images
                        </h2>
                        <FarmImageGallery images={farm.images} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Farm Name *" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                {errors.name && <InputError message={errors.name} className="mt-2" />}
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Location
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="address" value="Address *" />
                                <TextInput
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="city" value="City *" />
                                    <TextInput
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="state" value="State" />
                                    <TextInput
                                        id="state"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="country" value="Country *" />
                                    <TextInput
                                        id="country"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="postal_code" value="Postal Code" />
                                    <TextInput
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="latitude" value="Latitude *" />
                                    <TextInput
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="longitude" value="Longitude *" />
                                    <TextInput
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Farm Details
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="size_hectares" value="Size (hectares) *" />
                                    <TextInput
                                        id="size_hectares"
                                        type="number"
                                        step="0.01"
                                        value={data.size_hectares}
                                        onChange={(e) => setData('size_hectares', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="capacity_trees" value="Tree Capacity *" />
                                    <TextInput
                                        id="capacity_trees"
                                        type="number"
                                        value={data.capacity_trees}
                                        onChange={(e) => setData('capacity_trees', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="soil_type" value="Soil Type" />
                                    <select
                                        id="soil_type"
                                        value={data.soil_type}
                                        onChange={(e) => setData('soil_type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        <option value="">Select soil type</option>
                                        <option value="Clay">Clay</option>
                                        <option value="Sandy">Sandy</option>
                                        <option value="Loam">Loam</option>
                                        <option value="Silt">Silt</option>
                                        <option value="Peat">Peat</option>
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="climate" value="Climate" />
                                    <select
                                        id="climate"
                                        value={data.climate}
                                        onChange={(e) => setData('climate', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        <option value="">Select climate</option>
                                        <option value="Tropical">Tropical</option>
                                        <option value="Subtropical">Subtropical</option>
                                        <option value="Mediterranean">Mediterranean</option>
                                        <option value="Temperate">Temperate</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="historical_performance" value="Historical Performance" />
                                <textarea
                                    id="historical_performance"
                                    value={data.historical_performance}
                                    onChange={(e) => setData('historical_performance', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="virtual_tour_url" value="Virtual Tour URL" />
                                <TextInput
                                    id="virtual_tour_url"
                                    type="url"
                                    value={data.virtual_tour_url}
                                    onChange={(e) => setData('virtual_tour_url', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="https://"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <a
                            href="/farms/manage"
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </a>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
