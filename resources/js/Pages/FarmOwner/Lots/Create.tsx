import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler } from 'react';
import { FruitCrop, Rack } from '@/types';

interface Props {
    racks: Rack[];
    fruitCrops: FruitCrop[];
}

export default function Create({ racks, fruitCrops }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        rack_id: '',
        fruit_crop_id: '',
        name: '',
        total_trees: '',
        base_price_per_tree_cents: '',
        monthly_increase_rate: '0.05',
        cycle_months: '',
        last_investment_month: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('farm-owner.lots.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Lot" />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href={route('farm-owner.lots.index')} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Lots
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Lot</h1>
                </div>

                <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                        <select
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.rack_id}
                            onChange={(e) => setData('rack_id', e.target.value)}
                        >
                            <option value="">Select a rack</option>
                            {racks.map((rack: any) => (
                                <option key={rack.id} value={rack.id}>
                                    {rack.label}
                                </option>
                            ))}
                        </select>
                        {errors.rack_id && <p className="text-red-500 text-xs mt-1">{errors.rack_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fruit Crop</label>
                        <select
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.fruit_crop_id}
                            onChange={(e) => setData('fruit_crop_id', e.target.value)}
                        >
                            <option value="">Select a crop</option>
                            {fruitCrops.map((crop) => (
                                <option key={crop.id} value={crop.id}>{crop.variant}</option>
                            ))}
                        </select>
                        {errors.fruit_crop_id && <p className="text-red-500 text-xs mt-1">{errors.fruit_crop_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lot Name</label>
                        <input
                            type="text"
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Trees</label>
                            <input
                                type="number" min="1"
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.total_trees}
                                onChange={(e) => setData('total_trees', e.target.value)}
                            />
                            {errors.total_trees && <p className="text-red-500 text-xs mt-1">{errors.total_trees}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price / Tree (IDR)</label>
                            <input
                                type="number" min="1"
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.base_price_per_tree_cents}
                                onChange={(e) => setData('base_price_per_tree_cents', e.target.value)}
                            />
                            {errors.base_price_per_tree_cents && <p className="text-red-500 text-xs mt-1">{errors.base_price_per_tree_cents}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rate (e.g. 0.05)</label>
                            <input
                                type="number" step="0.001"
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.monthly_increase_rate}
                                onChange={(e) => setData('monthly_increase_rate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cycle Months</label>
                            <input
                                type="number" min="1"
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.cycle_months}
                                onChange={(e) => setData('cycle_months', e.target.value)}
                            />
                            {errors.cycle_months && <p className="text-red-500 text-xs mt-1">{errors.cycle_months}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Investment Month</label>
                            <input
                                type="number" min="1"
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.last_investment_month}
                                onChange={(e) => setData('last_investment_month', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                            Create Lot
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
