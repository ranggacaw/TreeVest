import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler } from 'react';

interface Props {
    farms: { id: number; name: string }[];
    warehouse?: {
        id: number;
        name: string;
        description: string | null;
        farm_id: number;
    };
    isEdit?: boolean;
}

export default function Create({ farms, warehouse, isEdit = false }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        farm_id: warehouse?.farm_id?.toString() || '',
        name: warehouse?.name || '',
        description: warehouse?.description || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit && warehouse) {
            put(route('farm-owner.warehouses.update', warehouse.id));
        } else {
            post(route('farm-owner.warehouses.store'));
        }
    };

    if (farms.length === 0) {
        return (
            <AppLayout>
                <Head title={isEdit ? 'Edit Warehouse' : 'Create Warehouse'} />
                <div className="max-w-2xl mx-auto py-8 px-4">
                    <div className="mb-6">
                        <Link href={route('farm-owner.warehouses.index')} className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back to Warehouses
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-2">{isEdit ? 'Edit Warehouse' : 'Create Warehouse'}</h1>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <p className="text-yellow-800">You need to create a farm first before you can create warehouses.</p>
                        <Link href={route('farms.manage.create')} className="inline-block mt-4 text-green-600 hover:underline">
                            Create Farm →
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={isEdit ? 'Edit Warehouse' : 'Create Warehouse'} />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href={route('farm-owner.warehouses.index')} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Warehouses
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{isEdit ? 'Edit Warehouse' : 'Create Warehouse'}</h1>
                </div>

                <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Farm</label>
                            <select
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.farm_id}
                                onChange={(e) => setData('farm_id', e.target.value)}
                            >
                                <option value="">Select a farm</option>
                                {farms.map((farm) => (
                                    <option key={farm.id} value={farm.id}>{farm.name}</option>
                                ))}
                            </select>
                            {errors.farm_id && <p className="text-red-500 text-xs mt-1">{errors.farm_id}</p>}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Name</label>
                        <input
                            type="text"
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                        <textarea
                            className="w-full border-gray-300 rounded-md text-sm"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={route('farm-owner.warehouses.index')} className="px-5 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                            {isEdit ? 'Update Warehouse' : 'Create Warehouse'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
