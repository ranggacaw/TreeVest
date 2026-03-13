import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { Warehouse } from '@/types';

interface Props {
    warehouses: Warehouse[];
}

export default function Index({ warehouses }: Props) {
    return (
        <AppLayout>
            <Head title="Warehouses" />
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
                    <Link
                        href={route('farm-owner.warehouses.create')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                        Add Warehouse
                    </Link>
                </div>

                {warehouses.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-lg">No warehouses yet.</p>
                        <p className="text-sm mt-1">Create your first warehouse to start organising lots.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {warehouses.map((warehouse) => (
                            <div
                                key={warehouse.id}
                                className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm"
                            >
                                <div>
                                    <h2 className="font-semibold text-gray-900">{warehouse.name}</h2>
                                    {warehouse.description && (
                                        <p className="text-sm text-gray-500 mt-0.5">{warehouse.description}</p>
                                    )}
                                </div>
                                <Link
                                    href={route('farm-owner.warehouses.show', warehouse.id)}
                                    className="text-green-600 text-sm font-medium hover:underline"
                                >
                                    View Racks →
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
