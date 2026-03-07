import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps } from '@/types';

interface FruitCrop {
    id: number;
    variant: string;
    description?: string;
    harvest_cycle: string;
    farm?: {
        id: number;
        name: string;
        city?: string;
        country?: string;
        status: string;
    };
}

interface FruitType {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    fruit_crops?: FruitCrop[];
}

interface Props extends PageProps {
    fruitType: FruitType;
}

export default function Show({ fruitType }: Props) {
    const handleToggleActive = () => {
        const action = fruitType.is_active ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} this fruit type?`)) {
            router.patch(route('admin.fruit-types.update', fruitType.id), {
                is_active: !fruitType.is_active,
            });
        }
    };

    return (
        <AppLayout title={`Fruit Type: ${fruitType.name}`}>
            <Head title={`Fruit Type: ${fruitType.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link
                                href={route('admin.fruit-types.index')}
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                &larr; Back to Fruit Types
                            </Link>
                            <h2 className="mt-2 text-2xl font-bold text-gray-900">{fruitType.name}</h2>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={route('admin.fruit-types.edit', fruitType.id)}
                                className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={handleToggleActive}
                                className={`px-4 py-2 rounded text-sm font-medium ${fruitType.is_active
                                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {fruitType.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Details */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">Name</dt>
                                    <dd className="text-sm font-medium text-gray-900">{fruitType.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Slug</dt>
                                    <dd className="text-sm font-medium text-gray-900">{fruitType.slug}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Status</dt>
                                    <dd>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${fruitType.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {fruitType.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">Associated Crops</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {fruitType.fruit_crops?.length ?? 0}
                                    </dd>
                                </div>
                                {fruitType.description && (
                                    <div className="col-span-2">
                                        <dt className="text-sm text-gray-500">Description</dt>
                                        <dd className="text-sm text-gray-700 mt-1">{fruitType.description}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Associated Crops */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Associated Fruit Crops ({fruitType.fruit_crops?.length ?? 0})
                            </h3>
                            {fruitType.fruit_crops && fruitType.fruit_crops.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Variant
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Farm
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Harvest Cycle
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Farm Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {fruitType.fruit_crops.map((crop) => (
                                            <tr key={crop.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {crop.variant}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {crop.farm ? (
                                                        <Link
                                                            href={route('admin.farms.show', crop.farm.id)}
                                                            className="text-indigo-600 hover:underline"
                                                        >
                                                            {crop.farm.name}
                                                        </Link>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                    {crop.farm?.city && (
                                                        <span className="text-gray-500 ml-1">
                                                            ({[crop.farm.city, crop.farm.country].filter(Boolean).join(', ')})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                                                    {crop.harvest_cycle}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {crop.farm && (
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${crop.farm.status === 'active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : crop.farm.status === 'pending_approval'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {crop.farm.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-sm text-gray-500">No fruit crops associated with this fruit type.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
