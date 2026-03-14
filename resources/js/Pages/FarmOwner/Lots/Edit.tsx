import { Head, Link, useForm, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler, useState, useEffect } from 'react';
import { Lot, Rack, FruitCrop } from '@/types';

interface Props {
    lot: Lot;
    racks: Rack[];
    fruitCrops: FruitCrop[];
}

export default function Edit({ lot, racks, fruitCrops }: Props) {
    const [autoGenerateName, setAutoGenerateName] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        rack_id: lot.rack_id.toString(),
        fruit_crop_id: lot.fruit_crop_id?.toString() || '',
        name: lot.name,
        total_trees: lot.total_trees.toString(),
        base_price_per_tree_idr: lot.current_price_per_tree_idr?.toString() || '',
        monthly_increase_rate: (lot.monthly_increase_rate * 100).toString(),
        cycle_months: lot.cycle_months.toString(),
        last_investment_month: (lot.cycle_months - 1).toString(),
        cycle_started_at: lot.cycle_started_at ? lot.cycle_started_at.split('T')[0] : '',
    });

    const generateAutoName = () => {
        const selectedRack = racks.find((r: any) => r.id === parseInt(data.rack_id));
        const selectedCrop = fruitCrops.find((c: any) => c.id === parseInt(data.fruit_crop_id));

        if (selectedRack?.label && selectedCrop) {
            const farmName = selectedRack.label.split(' → ')[0];
            const rackName = selectedRack.label.split(' → ')[2];
            const cropName = selectedCrop.variant;

            // Abbreviate farm name (take first letter of each word, max 4-5 chars)
            const farmAbbr = farmName
                .split(' ')
                .map((w: string) => w[0]?.toUpperCase())
                .join('')
                .substring(0, 5);

            // Abbreviate crop name (take first letter of each word, max 4 chars)
            const cropAbbr = cropName
                .split(' ')
                .map((w: string) => w[0]?.toUpperCase())
                .join('')
                .substring(0, 4);

            // Clean rack name (remove non-alphanumeric, keep R prefix if exists)
            const rackClean = rackName.replace(/[^a-zA-Z0-9]/g, '');

            return `${farmAbbr}-${cropAbbr}-${rackClean}-${data.total_trees || 0}Trees`;
        }
        return '';
    };

    useEffect(() => {
        if (autoGenerateName) {
            const autoName = generateAutoName();
            setData('name', autoName);
        }
    }, [autoGenerateName, data.rack_id, data.fruit_crop_id, data.total_trees]);

    const handleAutoGenerateToggle = (checked: boolean) => {
        setAutoGenerateName(checked);
        if (checked) {
            const autoName = generateAutoName();
            setData('name', autoName);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const ratePercentage = parseFloat(data.monthly_increase_rate) || 0;
        const rateDecimal = ratePercentage / 100;
        
        setData('monthly_increase_rate', rateDecimal.toString());
        put(route('farm-owner.lots.update', lot.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this lot? This action cannot be undone.')) {
            router.delete(route('farm-owner.lots.destroy', lot.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit Lot: ${lot.name}`} />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href={route('farm-owner.lots.index')} className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Lots
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Lot</h1>
                    <p className="text-sm text-gray-500">{lot.name}</p>
                </div>

                <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lot Name</label>
                        <div className="flex items-center gap-3 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoGenerateName}
                                    onChange={(e) => handleAutoGenerateToggle(e.target.checked)}
                                    className="w-4 h-4 text-green-600 rounded"
                                />
                                <span className="text-sm text-gray-600">Auto-generate from selection</span>
                            </label>
                        </div>
                        <input
                            type="text"
                            className={`w-full border-gray-300 rounded-md text-sm ${autoGenerateName ? 'bg-gray-100' : ''}`}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={autoGenerateName}
                            placeholder={autoGenerateName ? 'Auto-generated name' : 'Enter lot name'}
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
                                value={data.base_price_per_tree_idr}
                                onChange={(e) => setData('base_price_per_tree_idr', e.target.value)}
                            />
                            {errors.base_price_per_tree_idr && <p className="text-red-500 text-xs mt-1">{errors.base_price_per_tree_idr}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rate (%)</label>
                            <input
                                type="number" step="0.1" min="0"
                                className="w-full border-gray-300 rounded-md text-sm"
                                value={data.monthly_increase_rate}
                                onChange={(e) => setData('monthly_increase_rate', e.target.value)}
                                placeholder="e.g., 5"
                            />
                            {errors.monthly_increase_rate && <p className="text-red-500 text-xs mt-1">{errors.monthly_increase_rate}</p>}
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
                            {errors.last_investment_month && <p className="text-red-500 text-xs mt-1">{errors.last_investment_month}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cycle Started At</label>
                        <input
                            type="date"
                            className="w-full border-gray-300 rounded-md text-sm"
                            value={data.cycle_started_at}
                            onChange={(e) => setData('cycle_started_at', e.target.value)}
                        />
                        {errors.cycle_started_at && <p className="text-red-500 text-xs mt-1">{errors.cycle_started_at}</p>}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                        >
                            Delete Lot
                        </button>
                        <div className="flex gap-3">
                            <Link
                                href={route('farm-owner.lots.show', lot.id)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Only active lots with no investments can be edited or deleted. Once a lot has investments, certain fields become read-only.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
