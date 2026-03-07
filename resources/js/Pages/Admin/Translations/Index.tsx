import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface TranslationStats {
    type: string;
    total: number;
    translated: number;
    pending_review: number;
    percentage: number;
}

interface IndexProps {
    stats: TranslationStats[];
    locale: string;
    availableLocales: Record<string, string>;
    apiUsage: {
        characters_this_month: number;
        estimated_cost: number;
    };
}

export default function Index({ stats, locale, availableLocales, apiUsage }: IndexProps) {
    const { t } = useTranslation(['admin', 'translation']);

    return (
        <AppLayout title={t('translations.title', 'Translation Management')}>
            <Head title={t('translations.title', 'Translation Management')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                            {t('translations.title', 'Translation Management')}
                        </h3>

                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.translations.queue', { locale })}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                {t('translations.review_queue', 'Review Queue')}
                                {stats.reduce((acc, curr) => acc + curr.pending_review, 0) > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                        {stats.reduce((acc, curr) => acc + curr.pending_review, 0)}
                                    </span>
                                )}
                            </Link>

                            <span className="text-sm text-gray-500">
                                {t('translations.target_locale', 'Target Locale')}:
                            </span>
                            <form method="get" className="flex items-center">
                                <select
                                    name="locale"
                                    defaultValue={locale}
                                    onChange={(e) => e.target.form?.submit()}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1"
                                >
                                    {Object.entries(availableLocales).map(([code, name]) => (
                                        <option key={code} value={code}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </form>
                        </div>
                    </div>

                    {apiUsage && (
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 flex items-center justify-between border-l-4 border-indigo-500">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{t('translations.api_chars_month', 'Machine Translation Characters (This Month)')}</p>
                                    <p className="text-2xl font-bold text-gray-900">{apiUsage.characters_this_month.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-full">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 flex items-center justify-between border-l-4 border-emerald-500">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{t('translations.api_estimated_cost', 'Estimated API Cost (This Month)')}</p>
                                    <p className="text-2xl font-bold text-gray-900">${apiUsage.estimated_cost.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-full">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h4 className="text-md font-semibold text-gray-800 mb-4">
                                {t('translations.coverage_by_type', 'Coverage by Content Type')} ({locale.toUpperCase()})
                            </h4>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('translations.content_type', 'Content Type')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('translations.total_items', 'Total Items')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('translations.translated', 'Translated')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('translations.pending_review', 'Pending Review')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('translations.coverage', 'Coverage')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.actions', 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.map((stat) => (
                                        <tr key={stat.type}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {stat.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {stat.total}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {stat.translated}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {stat.pending_review > 0 ? (
                                                    <span className="text-amber-600 font-semibold">{stat.pending_review}</span>
                                                ) : (
                                                    <span>0</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                        <div
                                                            className={`h-2.5 rounded-full ${stat.percentage === 100 ? 'bg-green-600' : 'bg-indigo-600'}`}
                                                            style={{ width: `${stat.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-10">{Math.round(stat.percentage)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('admin.translations.list', { type: stat.type, locale: locale })}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {t('common.manage', 'Manage')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {stats.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-sm">
                                                {t('translations.no_data', 'No translatable content found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
