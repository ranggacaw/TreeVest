import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface Item {
    id: number;
    title: string;
    status: string;
    updated_at: string;
}

interface ListProps {
    items: {
        data: Item[];
        current_page: number;
        last_page: number;
        total: number;
    };
    type: string;
    locale: string;
}

export default function List({ items, type, locale }: ListProps) {
    const { t } = useTranslation(['admin', 'translation']);

    return (
        <AppLayout title={t('admin.translations.list_title', 'Translations List')}>
            <Head title={t('admin.translations.list_title', 'Translations List')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link
                                href={route('admin.translations.index')}
                                className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
                            >
                                &larr; {t('common.back', 'Back')}
                            </Link>
                            <h3 className="text-xl font-medium text-gray-900">
                                {type} Translations
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {t('admin.translations.target_locale', 'Target Locale')}: <span className="font-semibold uppercase">{locale}</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.id', 'ID')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('admin.translations.item_title', 'Title / Name')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.status', 'Status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.last_updated', 'Last Updated')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.actions', 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                                                {item.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                                            item.status === 'machine_translated' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('admin.translations.edit', { type, id: item.id, locale })}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    {t('common.edit', 'Edit')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {items.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 text-sm">
                                                {t('admin.translations.no_items', 'No items found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination would go here */}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
