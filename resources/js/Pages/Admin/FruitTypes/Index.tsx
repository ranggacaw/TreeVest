import { Head, Link } from '@inertiajs/react';

interface FruitType {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    fruit_crops_count: number;
    created_at: string;
}

interface FruitTypesData {
    data: FruitType[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    is_active?: string;
}

export default function Index({ fruitTypes, filters }: { fruitTypes: FruitTypesData; filters: Filters }) {
    return (
        <>
            <Head title="Fruit Types" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Manage Fruit Types</h3>
                        <Link
                            href={route('admin.fruit-types.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            Add Fruit Type
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form method="get" className="mb-6 flex gap-4">
                                <select
                                    name="is_active"
                                    defaultValue={filters.is_active}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Filter
                                </button>
                            </form>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crops Count</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fruitTypes.data.map((type) => (
                                        <tr key={type.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.slug}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.fruit_crops_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${type.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {type.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('admin.fruit-types.edit', type.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                                <Link href={route('admin.fruit-types.destroy', type.id)} method="delete" as="button" className="text-red-600 hover:text-red-900">Delete</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {fruitTypes.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                No fruit types found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {fruitTypes.last_page > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <div className="flex gap-2">
                                        {fruitTypes.current_page > 1 && (
                                            <Link
                                                href={route('admin.fruit-types.index', { page: fruitTypes.current_page - 1, ...filters })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        <span className="px-3 py-1 text-gray-700">
                                            Page {fruitTypes.current_page} of {fruitTypes.last_page}
                                        </span>
                                        {fruitTypes.current_page < fruitTypes.last_page && (
                                            <Link
                                                href={route('admin.fruit-types.index', { page: fruitTypes.current_page + 1, ...filters })}
                                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
