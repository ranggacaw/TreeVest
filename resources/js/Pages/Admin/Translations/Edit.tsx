import { AppLayout } from '@/Layouts';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { FormEventHandler } from 'react';

interface ContentItem {
    id: number;
    original_model: string; // e.g., 'App\\Models\\Farm'
    original_id: number;
    fields: Record<string, {
        original: string;
        translated: string | null;
        status: string;
        source: string;
        translation_id: number | null;
    }>;
}

interface EditProps {
    item: ContentItem;
    locale: string;
    type: string;
}

export default function Edit({ item, locale, type }: EditProps) {
    const { t } = useTranslation(['admin', 'translation']);

    // Initialize form with fields
    const initialValues: Record<string, string> = {};
    Object.keys(item.fields).forEach(field => {
        initialValues[field] = item.fields[field].translated || '';
    });

    const { data, setData, patch, post, processing, errors } = useForm(initialValues);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('admin.translations.update', { type, id: item.original_id, locale }));
    };

    return (
        <AppLayout title={t('admin.translations.edit_title', 'Edit Translation')}>
            <Head title={t('admin.translations.edit_title', 'Edit Translation')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <Link
                                href={route('admin.translations.list', { type, locale })}
                                className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
                            >
                                &larr; {t('common.back', 'Back')}
                            </Link>
                            <h3 className="text-xl font-medium text-gray-900">
                                {t('admin.translations.translate_item', 'Translate')} {type.split('\\').pop()} #{item.original_id}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {t('admin.translations.target_locale', 'Target Locale')}: <span className="font-semibold uppercase">{locale}</span>
                            </p>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                post(route('admin.translations.draft', { type, id: item.original_id, locale }), {
                                    preserveScroll: true,
                                });
                            }}
                        >
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 disabled:opacity-50 text-sm font-medium shadow-sm transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                                </svg>
                                {t('admin.translations.generate_draft', 'Generate Draft Translation')}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={submit}>
                                {Object.entries(item.fields).map(([field, dataObj]) => (
                                    <div key={field} className="mb-8 p-4 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                                            <h4 className="text-lg font-medium capitalize text-gray-800">
                                                {field.replace('_', ' ')}
                                            </h4>
                                            {dataObj.status && (
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${dataObj.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    dataObj.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                                        dataObj.status === 'machine_translated' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {dataObj.status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Original Content Column */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">
                                                    {t('admin.translations.original_content', 'Original Content')}
                                                </label>
                                                <div className="bg-gray-100 p-4 rounded-md border text-gray-700 min-h-[150px] whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                                                    {dataObj.original || <span className="text-gray-400 italic">Empty</span>}
                                                </div>
                                            </div>

                                            {/* Translated Content Column */}
                                            <div>
                                                <label className="block text-sm font-medium text-indigo-600 mb-2">
                                                    {t('admin.translations.translated_content', 'Translated Content')} ({locale.toUpperCase()})
                                                </label>
                                                <textarea
                                                    name={field}
                                                    value={data[field] as string}
                                                    onChange={e => setData(field, e.target.value)}
                                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[150px] ${errors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                                                        }`}
                                                    placeholder={`${t('admin.translations.enter_translation_for', 'Enter translation for')} ${field}...`}
                                                    rows={8}
                                                />
                                                {errors[field] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
                                                )}

                                                {dataObj.source === 'machine' && (
                                                    <p className="mt-2 text-xs text-blue-600 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                                        </svg>
                                                        {t('admin.translations.machine_translated', 'Draft generated by Machine Translation')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end gap-4 mt-6">
                                    <Link
                                        href={route('admin.translations.list', { type, locale })}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        {t('common.cancel', 'Cancel')}
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-colors"
                                    >
                                        {processing ? t('common.saving', 'Saving...') : t('admin.translations.save_and_approve', 'Save & Approve')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
