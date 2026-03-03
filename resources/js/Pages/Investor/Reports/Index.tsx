import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportFilterForm from '@/Components/ReportFilterForm';
import ProfitLossTable from '@/Components/ProfitLossTable';
import PerformanceBarChart from '@/Components/PerformanceBarChart';
import ReturnsTrendChart from '@/Components/ReturnsTrendChart';
import { GeneratedReportStatus } from '@/types';

interface Props {
    profitLoss: {
        rows: Array<{
            investmentId: number;
            treeIdentifier: string;
            fruitType: string;
            variant: string;
            farmName: string;
            amountInvestedCents: number;
            totalPayoutsCents: number;
            netCents: number;
            actualRoiPercent: number;
            status: string;
            purchaseDate: string;
        }>;
        summary: {
            totalInvestedCents: number;
            totalPayoutsCents: number;
            netCents: number;
            overallRoiPercent: number;
        };
    };
    performance: Array<{
        month: string;
        investedCents: number;
        payoutsCents: number;
        cumulativeCents: number;
    }>;
    filters: {
        from?: string;
        to?: string;
        farm_id?: number;
        fruit_type_id?: number;
        investment_id?: number;
    };
    filterOptions: {
        farms: Array<{ id: number; name: string }>;
        fruitTypes: Array<{ id: number; name: string }>;
        investments: Array<{ id: number; label: string }>;
    };
    recentReports: Array<{
        id: number;
        status: GeneratedReportStatus;
        created_at: string;
        expires_at: string | null;
    }>;
}

export default function Index({
    profitLoss,
    performance,
    filters,
    filterOptions,
    recentReports,
}: Props) {
    const formatCurrency = (cents: number) => {
        return `Rp ${(cents / 100).toFixed(2)}`;
    };

    const { post: requestPdf, processing: pdfGenerating } = useForm(filters);

    const handlePdfRequest = () => {
        requestPdf(route('reports.pdf.request'), {
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    const handleCsvExport = () => {
        window.location.href = route('reports.csv', filters);
    };

    const handleDownloadReport = (reportId: number) => {
        window.location.href = route('reports.download', reportId);
    };

    const getReportStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'generating':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Financial Reports</h2>}>
            <Head title="Financial Reports" />

            <div className="space-y-6 py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                Profit & Loss Summary
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Total Invested
                                    </dt>
                                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                                        {formatCurrency(profitLoss.summary.totalInvestedCents)}
                                    </dd>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Total Payouts
                                    </dt>
                                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                                        {formatCurrency(profitLoss.summary.totalPayoutsCents)}
                                    </dd>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Net Return
                                    </dt>
                                    <dd
                                        className={`mt-1 text-2xl font-semibold ${profitLoss.summary.netCents >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                    >
                                        {formatCurrency(profitLoss.summary.netCents)}
                                    </dd>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Overall ROI
                                    </dt>
                                    <dd
                                        className={`mt-1 text-2xl font-semibold ${profitLoss.summary.overallRoiPercent >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                    >
                                        {profitLoss.summary.overallRoiPercent.toFixed(2)}%
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                Filters
                            </h3>
                            <ReportFilterForm filters={filters} filterOptions={filterOptions} />
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Investment Details
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePdfRequest}
                                        disabled={pdfGenerating}
                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {pdfGenerating ? 'Generating...' : 'Download PDF'}
                                    </button>
                                    <button
                                        onClick={handleCsvExport}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Export CSV
                                    </button>
                                </div>
                            </div>
                            <ProfitLossTable rows={profitLoss.rows} summary={profitLoss.summary} />
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                Performance Analysis
                            </h3>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                                        Invested vs Payouts
                                    </h4>
                                    <PerformanceBarChart data={performance} height={300} />
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                                        Cumulative Returns Trend
                                    </h4>
                                    <ReturnsTrendChart data={performance} height={300} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {recentReports.length > 0 && (
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">
                                    Recent Reports
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Created At
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Expires At
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {recentReports.map((report) => (
                                                <tr key={report.id}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {report.id}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold uppercase ${getReportStatusColor(report.status)}`}
                                                        >
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {new Date(report.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {report.expires_at
                                                            ? new Date(report.expires_at).toLocaleString()
                                                            : '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                        {report.status === 'completed' && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDownloadReport(report.id)
                                                                }
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Download
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
