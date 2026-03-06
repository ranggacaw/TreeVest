import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ReviewCard from './ReviewCard';

interface QueueItem {
    id: number;
    type_name: string;
    item_id: number;
    field: string;
    status: string;
    source: string;
    original: string;
    translated: string;
    updated_at: string;
}

interface PaginationData {
    data: QueueItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface QueueProps {
    translations: PaginationData;
    locale: string;
    availableLocales: Record<string, string>;
}

export default function Queue({ translations, locale, availableLocales }: QueueProps) {
    const { t } = useTranslation(['admin', 'translation']);

    return (
        <AppLayout title={t('admin.translations.review_queue', 'Translation Review Queue')}>
            <Head title={t('admin.translations.review_queue', 'Translation Review Queue')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {t('admin.translations.review_queue', 'Translation Review Queue')}
                            </h3>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {translations.total} pending
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('admin.translations.index', { locale })}
                                className="text-sm text-indigo-600 hover:text-indigo-900"
                            >
                                {t('admin.translations.back_to_dashboard', 'Back to Dashboard')}
                            </Link>

                            <form method="get" className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">
                                    {t('admin.translations.target_locale', 'Target Locale')}:
                                </span>
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

                    <div className="space-y-6">
                        {translations.data.length > 0 ? (
                            translations.data.map(item => (
                                <ReviewCard key={item.id} item={item} locale={locale} />
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No translations to review</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    All content for {locale.toUpperCase()} has been reviewed.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {translations.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {translations.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                ${link.active
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}
                                                ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                                ${i === 0 ? 'rounded-l-md' : ''}
                                                ${i === translations.links.length - 1 ? 'rounded-r-md' : ''}
                                            `}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
