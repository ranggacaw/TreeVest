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

export default function Selling({ lot }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        selling_revenue_idr: string;
        sold_at: string;
        notes: string;
        proof_photo: File | null;
    }>({
        selling_revenue_idr: '',
        sold_at: '',
        notes: '',
        proof_photo: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('farm-owner.lots.submit-selling', lot.id));
    };

    return (
        <AppLayout>
            <Head title={`Submit Selling Revenue — ${lot.name}`} />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href={route('farm-owner.lots.show', lot.id)} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Lot
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Submit Sales Revenue</h1>
                    <p className="text-sm text-gray-500">{lot.name}</p>
                </div>

                <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue (IDR)</label>
                        <input
                            type="number" min="1"
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.selling_revenue_idr}
                            onChange={(e) => setData('selling_revenue_idr', e.target.value)}
                            placeholder="e.g. 10000000"
                        />
                        {errors.selling_revenue_idr && <p className="text-red-500 text-xs mt-1">{errors.selling_revenue_idr}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sold Date</label>
                        <input
                            type="date"
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.sold_at}
                            onChange={(e) => setData('sold_at', e.target.value)}
                        />
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proof Photo / Receipt</label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="text-sm"
                            onChange={(e) => setData('proof_photo', e.target.files?.[0] ?? null)}
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800">
                        Submitting this form will trigger automatic profit distribution to all investors in this lot.
                        Please ensure the revenue amount is accurate.
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                            Submit Sales Revenue
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
