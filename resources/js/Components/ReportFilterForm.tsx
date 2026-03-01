import { useForm, router } from '@inertiajs/react';

interface ReportFilterFormProps {
    filters: {
        from?: string;
        to?: string;
        farm_id?: number;
        fruit_type_id?: number;
        investment_id?: number;
    };
    filterOptions: {
        farms: Array<{ id: number; name: string }>;
        fruitTypes: Array<{ id: number; name: string }>;
        investments: Array<{ id: number; label: string }>;
    };
}

export default function ReportFilterForm({ filters, filterOptions }: ReportFilterFormProps) {
    const { data, setData, reset } = useForm({
        from: filters.from || '',
        to: filters.to || '',
        farm_id: filters.farm_id || '',
        fruit_type_id: filters.fruit_type_id || '',
        investment_id: filters.investment_id || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('reports.index'), data, { preserveState: true });
    };

    const handleReset = () => {
        reset();
        router.get(route('reports.index'), {});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                    <label
                        htmlFor="from"
                        className="block text-sm font-medium text-gray-700"
                    >
                        From Date
                    </label>
                    <input
                        type="date"
                        id="from"
                        value={data.from}
                        onChange={(e) => setData('from', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label
                        htmlFor="to"
                        className="block text-sm font-medium text-gray-700"
                    >
                        To Date
                    </label>
                    <input
                        type="date"
                        id="to"
                        value={data.to}
                        onChange={(e) => setData('to', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label
                        htmlFor="farm_id"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Farm
                    </label>
                    <select
                        id="farm_id"
                        value={data.farm_id}
                        onChange={(e) =>
                            setData(
                                'farm_id',
                                e.target.value ? Number(e.target.value) : '',
                            )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">All Farms</option>
                        {filterOptions.farms.map((farm) => (
                            <option key={farm.id} value={farm.id}>
                                {farm.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="fruit_type_id"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Fruit Type
                    </label>
                    <select
                        id="fruit_type_id"
                        value={data.fruit_type_id}
                        onChange={(e) =>
                            setData(
                                'fruit_type_id',
                                e.target.value ? Number(e.target.value) : '',
                            )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">All Types</option>
                        {filterOptions.fruitTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="investment_id"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Investment
                    </label>
                    <select
                        id="investment_id"
                        value={data.investment_id}
                        onChange={(e) =>
                            setData(
                                'investment_id',
                                e.target.value ? Number(e.target.value) : '',
                            )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">All Investments</option>
                        {filterOptions.investments.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                                {inv.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Reset
                </button>
                <button
                    type="submit"
                    className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    Apply Filters
                </button>
            </div>
        </form>
    );
}
