import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface Certification {
    name: string;
    issuer: string;
    certificate_number: string;
    issued_date: string;
    expiry_date: string;
}

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        latitude: '',
        longitude: '',
        size_hectares: '',
        capacity_trees: '',
        soil_type: '',
        climate: '',
        historical_performance: '',
        virtual_tour_url: '',
        certifications: [] as Certification[],
        images: [] as File[],
        image_urls: [] as string[],
    });

    const [certCount, setCertCount] = useState(0);
    const [imageUrlInput, setImageUrlInput] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('images', Array.from(e.target.files));
        }
    };

    const addCertification = () => {
        setCertCount(certCount + 1);
        setData('certifications', [
            ...data.certifications,
            { name: '', issuer: '', certificate_number: '', issued_date: '', expiry_date: '' },
        ]);
    };

    const removeCertification = (index: number) => {
        const certs = [...data.certifications];
        certs.splice(index, 1);
        setData('certifications', certs);
        setCertCount(certCount - 1);
    };

    const updateCertification = (index: number, field: keyof Certification, value: string) => {
        const certs = [...data.certifications];
        certs[index] = { ...certs[index], [field]: value };
        setData('certifications', certs);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/farms/manage', {
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
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Create New Farm
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Add a new farm listing for tree investment
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Farm Name *" />
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                                <input
                                    id="address"
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="city" value="City *" />
                                    <input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="state" value="State" />
                                    <input
                                        id="state"
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="country" value="Country *" />
                                    <input
                                        id="country"
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="postal_code" value="Postal Code" />
                                    <input
                                        id="postal_code"
                                        type="text"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="latitude" value="Latitude *" />
                                    <input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="longitude" value="Longitude *" />
                                    <input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                                    <input
                                        id="size_hectares"
                                        type="number"
                                        step="0.01"
                                        value={data.size_hectares}
                                        onChange={(e) => setData('size_hectares', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="capacity_trees" value="Tree Capacity *" />
                                    <input
                                        id="capacity_trees"
                                        type="number"
                                        value={data.capacity_trees}
                                        onChange={(e) => setData('capacity_trees', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                                    placeholder="Describe the farm's historical yield and performance..."
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="virtual_tour_url" value="Virtual Tour URL" />
                                <input
                                    id="virtual_tour_url"
                                    type="url"
                                    value={data.virtual_tour_url}
                                    onChange={(e) => setData('virtual_tour_url', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="https://"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Farm Images
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="images" value="Upload Images (Max 10 files)" />
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

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Certifications
                            </h2>
                            <button
                                type="button"
                                onClick={addCertification}
                                className="text-sm text-green-600 hover:text-green-700"
                            >
                                + Add Certification
                            </button>
                        </div>

                        {data.certifications.map((cert, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium">Certification {index + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeCertification(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Name" />
                                        <input
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                            placeholder="e.g., Organic Certification"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Issuer" />
                                        <input
                                            type="text"
                                            value={cert.issuer}
                                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Certificate Number" />
                                        <input
                                            type="text"
                                            value={cert.certificate_number}
                                            onChange={(e) => updateCertification(index, 'certificate_number', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Expiry Date" />
                                        <input
                                            type="date"
                                            value={cert.expiry_date}
                                            onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4">
                        <a
                            href="/farms/manage"
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </a>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Creating...' : 'Create Farm'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
