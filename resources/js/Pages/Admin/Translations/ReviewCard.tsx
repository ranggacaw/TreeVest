import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

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

interface ReviewCardProps {
    item: QueueItem;
    locale: string;
}

export default function ReviewCard({ item, locale }: ReviewCardProps) {
    const { t } = useTranslation(['admin', 'translation']);
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        value: item.translated
    });

    const handleApprove = () => {
        post(route('admin.translations.approve', { id: item.id }), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false)
        });
    };

    const handleReject = () => {
        if (confirm(t('admin.translations.confirm_reject', 'Are you sure you want to reject and delete this translation?'))) {
            post(route('admin.translations.reject', { id: item.id }), {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="bg-white border rounded-lg shadow-sm mb-4 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-800">
                        {item.type_name} #{item.item_id}
                    </span>
                    <span className="text-gray-400">&bull;</span>
                    <span className="text-sm font-medium text-gray-600 capitalize">
                        Field: {item.field.replace('_', ' ')}
                    </span>
                    <span className="text-gray-400">&bull;</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${item.status === 'machine_translated' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {item.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="text-sm text-gray-500">
                    {new Date(item.updated_at).toLocaleDateString()}
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {t('admin.translations.original_content', 'Original Content')}
                    </h5>
                    <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {item.original || <span className="italic text-gray-400">Empty</span>}
                    </div>
                </div>

                <div>
                    <h5 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                        {t('admin.translations.target_locale', 'Target')}: {locale.toUpperCase()}
                    </h5>
                    {isEditing ? (
                        <div>
                            <textarea
                                value={data.value}
                                onChange={e => setData('value', e.target.value)}
                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[150px]"
                                rows={6}
                            />
                            {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                        </div>
                    ) : (
                        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {item.translated || <span className="italic text-gray-400">Empty</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                <div>
                    {item.source === 'machine' && (
                        <p className="text-xs text-blue-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            {t('admin.translations.source_machine', 'Machine Translated')}
                        </p>
                    )}
                </div>
                <div className="flex space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setData('value', item.translated);
                                }}
                                className="px-3 py-1.5 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleApprove}
                                disabled={processing}
                                className="px-3 py-1.5 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                {t('admin.translations.save_and_approve', 'Save & Approve')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={processing}
                                className="px-3 py-1.5 border border-red-300 rounded shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                            >
                                {t('common.reject', 'Reject')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="px-3 py-1.5 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                {t('common.edit', 'Edit')}
                            </button>
                            <button
                                type="button"
                                onClick={handleApprove}
                                disabled={processing}
                                className="px-3 py-1.5 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                {t('common.approve', 'Approve')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
