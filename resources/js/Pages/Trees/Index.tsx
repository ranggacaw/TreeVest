import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import GuestLayout from '@/Layouts/GuestLayout';
import TreeCard from '@/Components/TreeCard';

export default function Index({ trees, filters, auth }: PageProps<{ trees: any, filters: any }>) {
    const { data, setData, get } = useForm({
        fruit_type: filters.fruit_type || '',
        variant: filters.variant || '',
        risk_rating: filters.risk_rating || '',
        harvest_cycle: filters.harvest_cycle || '',
        price_min: filters.price_min || '',
        price_max: filters.price_max || '',
    });

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('trees.index'), { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title="Marketplace" />

            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Tree Marketplace</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                            Invest in productive fruit trees and earn returns on every harvest.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                                <form onSubmit={applyFilters} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Variant Search</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={data.variant}
                                            onChange={e => setData('variant', e.target.value)}
                                            placeholder="e.g. Musang King"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Risk Rating</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={data.risk_rating}
                                            onChange={e => setData('risk_rating', e.target.value)}
                                        >
                                            <option value="">Any</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Harvest Cycle</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={data.harvest_cycle}
                                            onChange={e => setData('harvest_cycle', e.target.value)}
                                        >
                                            <option value="">Any</option>
                                            <option value="annual">Annual</option>
                                            <option value="biannual">Biannual</option>
                                            <option value="seasonal">Seasonal</option>
                                        </select>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="flex-1">
                            {trees.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {trees.data.map((tree: any) => (
                                        <TreeCard key={tree.id} tree={tree} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No trees found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Try adjusting your filters to see more results.
                                    </p>
                                </div>
                            )}

                            {/* Pagination (Simplified) */}
                            {trees.links && trees.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {trees.links.map((link: any, idx: number) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
