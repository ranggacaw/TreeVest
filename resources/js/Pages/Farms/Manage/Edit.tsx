import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import FarmStatusBadge from '@/Components/FarmStatusBadge';
import FarmImageGallery from '@/Components/FarmImageGallery';
import { Farm, FarmImage, PageProps } from '@/types';
import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';

interface Props extends PageProps {
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
    const { data, setData, post, errors, processing } = useForm({
        _method: 'put',
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
        images: [] as File[],
        image_urls: [] as string[],
    });

    const [imageUrlInput, setImageUrlInput] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/farms/manage/${farm.id}`, {
            forceFormData: true,
        });
    };

    const handleDeleteImage = (image: FarmImage) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(`/farms/manage/${farm.id}/images/${image.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout title="Edit Farm" subtitle={farm.name}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                Edit Farm
                            </h2>
                            <FarmStatusBadge status={farm.status} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => window.history.back()} type="button" className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                Back
                            </button>
                        </div>
                    </div>
                    {farm.status === 'pending_approval' && (
                        <p className="mb-6 text-yellow-600">
                            This farm is pending approval. Any changes will require re-approval.
                        </p>
                    )}

                    {farm.images && farm.images.length > 0 && (
                        <div className="mb-6">
                            <FarmImageGallery images={farm.images} onDelete={handleDeleteImage} />
                        </div>
                    )}

                    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Upload New Images / Add Image Link
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="images" value="Select new image files to upload (Max 10)" />
                                <input
                                    type="file"
                                    id="images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                {errors.images && <InputError message={errors.images} className="mt-2" />}
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <InputLabel htmlFor="image_url" value="Or add an image via URL Link" />
                                <div className="flex gap-2 mt-1">
                                    <TextInput
                                        id="image_url"
                                        type="url"
                                        value={imageUrlInput}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                        className="block w-full"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (imageUrlInput.trim() && !data.image_urls.includes(imageUrlInput.trim())) {
                                                setData('image_urls', [...data.image_urls, imageUrlInput.trim()]);
                                                setImageUrlInput('');
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                    >
                                        Add Link
                                    </button>
                                </div>

                                {data.image_urls.length > 0 && (
                                    <ul className="mt-3 space-y-2">
                                        {data.image_urls.map((url, i) => (
                                            <li key={i} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-md">
                                                <span className="truncate mr-4 text-gray-600">{url}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('image_urls', data.image_urls.filter((_, idx) => idx !== i))}
                                                    className="text-red-500 hover:text-red-700 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.image_urls && <InputError message={errors.image_urls} className="mt-2" />}
                            </div>
                        </div>
                    </div>

                    {/* Fruit Crops Management Block */}
                    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Fruit Crops {farm.fruit_crops && farm.fruit_crops.length > 0 && `(${farm.fruit_crops.length})`}
                            </h2>
                            <Link
                                href={`${route('farm-owner.crops.create')}?farm_id=${farm.id}`}
                                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition"
                            >
                                + Add Crop
                            </Link>
                        </div>

                        {farm.fruit_crops && farm.fruit_crops.length > 0 ? (
                            <div className="space-y-4">
                                {farm.fruit_crops.map((crop: any) => (
                                    <div key={crop.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{crop.variant}</p>
                                                <p className="text-xs text-gray-500">{crop.fruit_type?.name} — <span className="capitalize">{crop.harvest_cycle?.replace('_', ' ')}</span></p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('farm-owner.crops.edit', crop.id)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-white px-2 py-1 border border-gray-200 rounded shadow-sm hover:shadow"
                                                >
                                                    Edit Crop
                                                </Link>
                                                <Link
                                                    href={`${route('farm-owner.trees.create')}?crop_id=${crop.id}`}
                                                    className="inline-flex items-center px-2.5 py-1 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition shadow-sm"
                                                >
                                                    + Add Tree
                                                </Link>
                                            </div>
                                        </div>
                                        {crop.trees && crop.trees.length > 0 ? (
                                            <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-white">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-xs divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr className="text-gray-500 uppercase tracking-wider">
                                                                <th className="py-2.5 px-4 text-left font-medium">Tree ID</th>
                                                                <th className="py-2.5 px-4 text-left font-medium">Age/Lifespan</th>
                                                                <th className="py-2.5 px-4 text-left font-medium">Status</th>
                                                                <th className="py-2.5 px-4 text-left font-medium">Price</th>
                                                                <th className="py-2.5 px-4 text-right font-medium">ROI</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {crop.trees.map((tree: any) => (
                                                                <tr key={tree.id} className="text-gray-700 hover:bg-gray-50/80 transition-colors">
                                                                    <td className="py-2 px-4 font-mono">{tree.tree_identifier}</td>
                                                                    <td className="py-2 px-4">{tree.age_years} / {tree.productive_lifespan_years} yrs</td>
                                                                    <td className="py-2 px-4 capitalize">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${tree.status === 'productive' ? 'bg-green-100 text-green-800' :
                                                                                tree.status === 'growing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                            {tree.status?.replace('_', ' ')}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2 px-4">Rp {(tree.price_cents / 100).toLocaleString('id-ID')}</td>
                                                                    <td className="py-2 px-4 text-right">
                                                                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                                                                            {tree.expected_roi_percent}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-3 flex items-center justify-between p-3 bg-white border border-dashed border-gray-300 rounded-md">
                                                <p className="text-xs text-gray-500">No trees setup yet. Investors can't invest without trees.</p>
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
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500 mb-3">No fruit crops have been added to this farm.</p>
                                <Link
                                    href={`${route('farm-owner.crops.create')}?farm_id=${farm.id}`}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition shadow-sm"
                                >
                                    + Add Your First Crop
                                </Link>
                                <p className="text-xs text-gray-400 mt-2">Crops define the variants of fruit grown (e.g., Montong Durian).</p>
                            </div>
                        )}
                    </div>

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
                            <Link
                                href="/farms/manage"
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
                            >
                                Cancel
                            </Link>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout >
    );
}
