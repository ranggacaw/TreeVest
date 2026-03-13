import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler } from 'react';

interface Lot {
    id: number;
    name: string;
    status: string;
    rack: { name: string; warehouse: { name: string; farm: { name: string } } };
}

interface Props {
    lot: Lot;
}

export default function Harvest({ lot }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        harvest_date: string;
        total_weight_kg: string;
        notes: string;
        photos: File[];
    }>({
        harvest_date: '',
        total_weight_kg: '',
        notes: '',
        photos: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('farm-owner.lots.record-harvest', lot.id));
    };

    return (
        <AppLayout>
            <Head title={`Record Harvest — ${lot.name}`} />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href={route('farm-owner.lots.show', lot.id)} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Lot
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Record Harvest</h1>
                    <p className="text-sm text-gray-500">{lot.name}</p>
                </div>

                <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                        <input
                            type="date"
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.harvest_date}
                            onChange={(e) => setData('harvest_date', e.target.value)}
                        />
                        {errors.harvest_date && <p className="text-red-500 text-xs mt-1">{errors.harvest_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (kg)</label>
                        <input
                            type="number" step="0.01" min="0"
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.total_weight_kg}
                            onChange={(e) => setData('total_weight_kg', e.target.value)}
                        />
                        {errors.total_weight_kg && <p className="text-red-500 text-xs mt-1">{errors.total_weight_kg}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <textarea
                            rows={3}
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Photos</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="text-sm"
                            onChange={(e) => setData('photos', Array.from(e.target.files ?? []))}
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 disabled:opacity-50"
                        >
                            Record Harvest
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
