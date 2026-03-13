import { AppLayout } from '@/Layouts';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';

export default function Index({ auth, trees, filters }: PageProps<{ trees: any, filters?: any }>) {
  const { t } = useTranslation('farms');
  const { data, setData, get } = useForm({
    search: filters?.search || '',
  });

  const updateStatus = (id: number, status: string) => {
    router.patch(route('farm-owner.trees.update-status', id), { status });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    get(route('farm-owner.trees.index'), { preserveState: true });
  };

  return (
    <AppLayout title={t('farm_owner.trees.title')} subtitle={t('farm_owner.trees.your_trees')}>
      <Head title={t('farm_owner.trees.title')} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Previous
            </button>
            <Link
              href={route('farm-owner.trees.create')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
            >
              {t('farm_owner.trees.add_tree')}
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="mb-4">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder={t('farm_owner.trees.search_placeholder', 'Search trees or crops...')}
                    value={data.search}
                    onChange={e => setData('search', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="mt-1 inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                  >
                    {t('common.search', 'Search')}
                  </button>
                </form>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.trees.tree_id')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.trees.crop_farm')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.trees.price')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.trees.status')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.trees.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trees.data.map((tree: any) => (
                    <tr key={tree.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tree.tree_identifier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tree.fruit_crop?.fruit_type?.name} ({tree.fruit_crop?.farm?.name})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {(tree.price_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select
                          value={tree.status}
                          onChange={e => updateStatus(tree.id, e.target.value)}
                          className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                        >
                          <option value="seedling">{t('farm_owner.trees.statuses.seedling')}</option>
                          <option value="growing">{t('farm_owner.trees.statuses.growing')}</option>
                          <option value="productive">{t('farm_owner.trees.statuses.productive')}</option>
                          <option value="declining">{t('farm_owner.trees.statuses.declining')}</option>
                          <option value="retired">{t('farm_owner.trees.statuses.retired')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={route('farm-owner.trees.edit', tree.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">{t('common.edit')}</Link>
                        <Link href={route('farm-owner.trees.destroy', tree.id)} method="delete" as="button" className="text-red-600 hover:text-red-900">{t('common.delete')}</Link>
                      </td>
                    </tr>
                  ))}
                  {trees.data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {t('farm_owner.trees.no_trees')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Smart pagination with page numbers */}
              {trees.links && trees.links.length > 3 && (
                <div className="mt-6 mb-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  {/* Previous Button */}
                  {trees.prev_page_url ? (
                    <Link
                      href={trees.prev_page_url}
                      className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-gray-50 border border-gray-100 rounded-full text-gray-300 cursor-not-allowed">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </span>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: trees.last_page }, (_, i) => i + 1).map((page) => {
                    const shouldShowPage = () => {
                      if (page === 1 || page === trees.last_page) return true;
                      if (Math.abs(page - trees.current_page) <= 1) return true;
                      if (page % 4 === 1 && page < trees.last_page - 2) return true;
                      return false;
                    };

                    const isActive = page === trees.current_page;
                    const link = trees.links.find((l: any) => l.label === String(page));

                    if (page === 2 && trees.current_page > 4) {
                      return (
                        <span key={`ellipsis-start-${page}`} className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (page > trees.current_page + 1 && page % 4 === 1 && page < trees.last_page - 1) {
                      return (
                        <span key={`ellipsis-mid-${page}`} className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!shouldShowPage()) return null;

                    if (link?.url) {
                      return (
                        <Link
                          key={page}
                          href={link.url}
                          className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-sm font-medium transition-all shadow-sm active:scale-95 ${isActive
                            ? 'bg-indigo-600 text-white shadow-indigo-200'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                        >
                          {page}
                        </Link>
                      );
                    }

                    return (
                      <span
                        key={page}
                        className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-sm font-medium ${isActive
                          ? 'bg-indigo-600 text-white shadow-indigo-200'
                          : 'bg-gray-50 text-gray-300'
                          }`}
                      >
                        {page}
                      </span>
                    );
                  })}

                  {/* Next Button */}
                  {trees.next_page_url ? (
                    <Link
                      href={trees.next_page_url}
                      className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-gray-50 border border-gray-100 rounded-full text-gray-300 cursor-not-allowed">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
