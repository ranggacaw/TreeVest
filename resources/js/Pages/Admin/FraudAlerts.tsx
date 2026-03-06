import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';

interface FraudAlert {
    id: number;
    user_id: number;
    rule_type: string;
    severity: string;
    detected_at: string;
    notes: string;
}

export default function FraudAlerts({ auth }: PageProps) {
    const { t } = useTranslation();
    // This is a placeholder for the actual datatable implementation
    const alerts: FraudAlert[] = []; 

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-6">
            <Head title={t('admin.fraud_alerts.title')} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h1 className="text-2xl font-bold mb-4">{t('admin.fraud_alerts.title')}</h1>
                        <p>{t('admin.fraud_alerts.subtitle')}</p>
                        
                        <div className="mt-4">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.fraud_alerts.type')}</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.fraud_alerts.severity')}</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.fraud_alerts.detected_at')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {alerts.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                {t('admin.fraud_alerts.no_alerts')}
                                            </td>
                                        </tr>
                                    ) : (
                                        alerts.map(alert => (
                                            <tr key={alert.id}>
                                                <td className="px-6 py-4">{alert.rule_type}</td>
                                                <td className="px-6 py-4">{t(`admin.fraud_alerts.${alert.severity}`)}</td>
                                                <td className="px-6 py-4">{alert.detected_at}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
