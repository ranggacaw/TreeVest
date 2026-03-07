import { useState } from 'react';
import { AppLayout } from '@/Layouts';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    filters: {
        type?: string;
        status?: string;
        date_start?: string;
        date_end?: string;
    };
    contentTypes: string[];
}

export default function Queue({ translations, locale, availableLocales, filters, contentTypes }: QueueProps) {
    const { t } = useTranslation(['admin', 'translation']);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const filterForm = useForm({
        locale: locale,
        type: filters?.type || '',
        status: filters?.status || '',
        date_start: filters?.date_start || '',
        date_end: filters?.date_end || ''
    });

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        filterForm.get(route('admin.translations.queue'));
    };

    const handleSelect = (id: number, checked: boolean) => {
        setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(translations.data.map(i => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBatchApprove = () => {
        if (!selectedIds.length) return;
        if (confirm(t('translations.confirm_batch_approve', 'Are you sure you want to approve selected translations?'))) {
            router.post(route('admin.translations.batch-approve'), { ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    return (
        <AppLayout title={t('translations.review_queue', 'Translation Review Queue')}>
            <Head title={t('translations.review_queue', 'Translation Review Queue')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {t('translations.review_queue', 'Translation Review Queue')}
                            </h3>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {translations.total} pending
                            </span>
                        </div>

                        <div className="flex flex-col space-y-4 items-end">
                            <Link
                                href={route('admin.translations.index', { locale })}
                                className="text-sm text-indigo-600 hover:text-indigo-900 self-end"
                            >
                                {t('translations.back_to_dashboard', 'Back to Dashboard')}
                            </Link>

                            <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-lg border shadow-sm">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-700 mr-2">{t('translations.target_locale', 'Locale')}:</span>
                                    <select
                                        name="locale"
                                        value={filterForm.data.locale}
                                        onChange={e => filterForm.setData('locale', e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1"
                                    >
                                        {Object.entries(availableLocales).map(([code, name]) => (
                                            <option key={code} value={code}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-700 mr-2">{t('common.type', 'Type')}:</span>
                                    <select
                                        value={filterForm.data.type}
                                        onChange={e => filterForm.setData('type', e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1"
                                    >
                                        <option value="">{t('common.all', 'All')}</option>
                                        {contentTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-700 mr-2">{t('common.status', 'Status')}:</span>
                                    <select
                                        value={filterForm.data.status}
                                        onChange={e => filterForm.setData('status', e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1"
                                    >
                                        <option value="">{t('common.all_pending', 'All Pending')}</option>
                                        <option value="machine_translated">{t('translations.status_machine', 'Machine Translated')}</option>
                                        <option value="under_review">{t('translations.status_review', 'Under Review')}</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="date" value={filterForm.data.date_start} onChange={e => filterForm.setData('date_start', e.target.value)} className="rounded-md border-gray-300 sm:text-sm py-1" />
                                    <span>-</span>
                                    <input type="date" value={filterForm.data.date_end} onChange={e => filterForm.setData('date_end', e.target.value)} className="rounded-md border-gray-300 sm:text-sm py-1" />
                                </div>
                                <button type="submit" disabled={filterForm.processing} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                                    {t('common.filter', 'Filter')}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {translations.data.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-4 py-3 border rounded-lg shadow-sm">
                                <div className="flex items-center mb-3 sm:mb-0">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === translations.data.length && translations.data.length > 0}
                                        onChange={e => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-4 w-4 mr-3"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">
                                        {t('common.select_all', 'Select All')} ({selectedIds.length} {t('common.selected', 'selected')})
                                    </span>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={handleBatchApprove}
                                        disabled={!selectedIds.length}
                                        className={`px-3 py-1.5 border border-transparent rounded shadow-sm text-sm font-medium text-white ${selectedIds.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
                                            }`}
                                    >
                                        {t('translations.approve_selected', 'Approve Selected')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {translations.data.length > 0 ? (
                            translations.data.map(item => (
                                <ReviewCard
                                    key={item.id}
                                    item={item}
                                    locale={locale}
                                    selected={selectedIds.includes(item.id)}
                                    onSelect={handleSelect}
                                />
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
