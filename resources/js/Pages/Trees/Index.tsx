import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import GuestLayout from '@/Layouts/GuestLayout';
import TreeCard from '@/Components/TreeCard';
import Navbar from '@/Components/Navbar';
import { useTranslation } from 'react-i18next';

export default function Index({ trees, filters = {}, auth, wishlistedTreeIds = [] }: PageProps<{ trees: any, filters?: any, wishlistedTreeIds?: number[] }>) {
    const { t } = useTranslation('trees');
    const { data, setData, get } = useForm({
        fruit_type: filters?.fruit_type || '',
        variant: filters?.variant || '',
        risk_rating: filters?.risk_rating || '',
        harvest_cycle: filters?.harvest_cycle || '',
        price_min: filters?.price_min || '',
        price_max: filters?.price_max || '',
    });

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('trees.index'), { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Head title={t('marketplace')} />

            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('tree_marketplace')}</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                            {t('tree_marketplace_subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('filters')}</h3>
                                <form onSubmit={applyFilters} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('variant_search')}</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={data.variant}
                                            onChange={e => setData('variant', e.target.value)}
                                            placeholder={t('variant_search_placeholder')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('risk_rating')}</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={data.risk_rating}
                                            onChange={e => setData('risk_rating', e.target.value)}
                                        >
                                            <option value="">{t('any')}</option>
                                            <option value="low">{t('low')}</option>
                                            <option value="medium">{t('medium')}</option>
                                            <option value="high">{t('high')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('harvest_cycle')}</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={data.harvest_cycle}
                                            onChange={e => setData('harvest_cycle', e.target.value)}
                                        >
                                            <option value="">{t('any')}</option>
                                            <option value="annual">{t('annual')}</option>
                                            <option value="biannual">{t('biannual')}</option>
                                            <option value="seasonal">{t('seasonal')}</option>
                                        </select>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {t('apply_filters')}
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
                                        <TreeCard key={tree.id} tree={tree} isWishlisted={(wishlistedTreeIds || []).includes(tree.id)} authenticated={!!auth?.user} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_trees_found')}</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {t('try_adjusting_filters')}
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
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
