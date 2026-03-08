import { AppLayout } from '@/Layouts';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';

export default function Index({ auth, crops }: PageProps<{ crops: any }>) {
    const { t } = useTranslation('farms');
    return (
        <AppLayout
            title={t('farm_owner.crops.title')}
            subtitle={t('farm_owner.crops.your_crops')}
        >
            <Head title={t('farm_owner.crops.title')} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Previous
                        </button>
                        <Link
                            href={route('farm-owner.crops.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                        >
                            {t('farm_owner.crops.add_crop')}
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.crops.farm')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.crops.fruit_type')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.crops.variant')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.crops.harvest_cycle')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('farm_owner.crops.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {crops.data.map((crop: any) => (
                                        <tr key={crop.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{crop.farm?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{crop.fruit_type?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{crop.variant}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{crop.harvest_cycle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('farm-owner.crops.edit', crop.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">{t('common.edit')}</Link>
                                                <Link href={route('farm-owner.crops.destroy', crop.id)} method="delete" as="button" className="text-red-600 hover:text-red-900">{t('common.delete')}</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {crops.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {t('farm_owner.crops.no_crops')}
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
