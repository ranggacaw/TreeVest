import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler } from 'react';

interface Props {
    warehouse: {
        id: number;
        name: string;
        description: string | null;
        farm_id: number;
    };
}

export default function Edit({ warehouse }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: warehouse.name || '',
        description: warehouse.description || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('farm-owner.warehouses.update', warehouse.id));
    };

    return (
        <AppLayout>
            <Head title="Edit Warehouse" />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href={route('farm-owner.warehouses.show', warehouse.id)} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Warehouse
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Warehouse</h1>
                </div>

                <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
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
                        <Link href={route('farm-owner.warehouses.show', warehouse.id)} className="px-5 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                            Update Warehouse
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
