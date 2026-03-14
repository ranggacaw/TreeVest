import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Warehouse, Rack } from '@/types';

interface Props {
    warehouse: Warehouse;
}

export default function Show({ warehouse }: Props) {
    const rackForm = useForm({ name: '', description: '' });

    function submitRack(e: React.FormEvent) {
        e.preventDefault();
        rackForm.post(route('farm-owner.warehouses.racks.store', warehouse.id), {
            onSuccess: () => rackForm.reset(),
        });
    }

    return (
        <AppLayout>
            <Head title={`Warehouse: ${warehouse.name}`} />
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link
                        href={route('farm-owner.warehouses.index')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back to Warehouses
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">{warehouse.name}</h1>
                    <p className="text-sm text-gray-500">{warehouse.farm?.name}</p>
                </div>

                {/* Racks list */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Racks</h2>
                    {!warehouse.racks || warehouse.racks.length === 0 ? (
                        <p className="text-gray-500 text-sm">No racks yet. Add one below.</p>
                    ) : (
                        <div className="grid gap-3">
                            {warehouse.racks.map((rack) => (
                                <div
                                    key={rack.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                                >
                                    <div>
                                        <span className="font-medium text-gray-900">{rack.name}</span>
                                        {rack.description && (
                                            <span className="ml-2 text-sm text-gray-500">{rack.description}</span>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {rack.lots?.length ?? 0} lot(s)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add rack form */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Add Rack</h3>
                    <form onSubmit={submitRack} className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={rackForm.data.name}
                                onChange={(e) => rackForm.setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="e.g. R1"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                            <input
                                type="text"
                                value={rackForm.data.description}
                                onChange={(e) => rackForm.setData('description', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={rackForm.processing}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                            Add Rack
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
