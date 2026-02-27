import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface FraudAlert {
    id: number;
    user_id: number;
    rule_type: string;
    severity: string;
    detected_at: string;
    notes: string;
}

export default function FraudAlerts({ auth }: PageProps) {
    // This is a placeholder for the actual datatable implementation
    const alerts: FraudAlert[] = []; 

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-6">
            <Head title="Fraud Alerts" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900 dark:text-gray-100">
                        <h1 className="text-2xl font-bold mb-4">Fraud Alerts</h1>
                        <p>Monitoring suspicious activities.</p>
                        
                        <div className="mt-4">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detected At</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {alerts.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                No alerts found.
                                            </td>
                                        </tr>
                                    ) : (
                                        alerts.map(alert => (
                                            <tr key={alert.id}>
                                                <td className="px-6 py-4">{alert.rule_type}</td>
                                                <td className="px-6 py-4">{alert.severity}</td>
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
