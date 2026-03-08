import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { GeneratedReportStatus } from '@/types';
import { formatRupiah } from '@/utils/currency';

interface TaxSummaryData {
    year: number;
    income: {
        rows: Array<{
            payoutId: number;
            date: string;
            farmName: string;
            grossAmountCents: number;
            platformFeeCents: number;
            netAmountCents: number;
        }>;
        totalCents: number;
    };
    investments: {
        rows: Array<{
            investmentId: number;
            date: string;
            farmName: string;
            amountCents: number;
        }>;
        totalCents: number;
    };
    summary: {
        totalIncomeCents: number;
        totalInvestedCents: number;
        netCents: number;
    };
}

interface Props {
    taxData: TaxSummaryData;
    year: number;
    recentReports: Array<{
        id: number;
        status: GeneratedReportStatus;
        created_at: string;
        expires_at: string | null;
    }>;
}

export default function Show({ taxData, year, recentReports }: Props) {
    const formatCurrency = formatRupiah;

    const { post: requestPdf, processing: pdfGenerating } = useForm({ year });

    const handlePdfRequest = () => {
        requestPdf(route('reports.tax.pdf.request', { year }), {
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    const handleCsvExport = () => {
        window.location.href = route('reports.tax.csv', { year });
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
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Tax Summary - {year}</h2>}
        >
            <Head title={`Tax Summary - ${year}`} />

            <div className="space-y-6 py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 rounded-md bg-yellow-50 p-4">
                                <h3 className="font-semibold text-yellow-800">Important Disclaimer</h3>
                                <p className="mt-2 text-sm text-yellow-700">
                                    This tax summary report is generated for informational purposes only.
                                    It is NOT official tax advice and should not be used as a substitute for
                                    professional tax consultation. Please consult with a qualified tax
                                    professional or accountant to determine your actual tax obligations.
                                </p>
                            </div>

                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Tax Summary for {year}
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

                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Total Income (Payouts)
                                    </dt>
                                    <dd className="mt-1 text-2xl font-semibold text-green-600">
                                        {formatCurrency(taxData.summary.totalIncomeCents)}
                                    </dd>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Total Investments
                                    </dt>
                                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                                        {formatCurrency(taxData.summary.totalInvestedCents)}
                                    </dd>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Net
                                    </dt>
                                    <dd
                                        className={`mt-1 text-2xl font-semibold ${taxData.summary.netCents >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                            }`}
                                    >
                                        {formatCurrency(taxData.summary.netCents)}
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
                                Income (Payouts)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Farm Name
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Gross Amount
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Platform Fee
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Net Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {taxData.income.rows.map((row) => (
                                            <tr key={row.payoutId}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {row.date}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {row.farmName}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                                    {formatCurrency(row.grossAmountCents)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                                    {formatCurrency(row.platformFeeCents)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-green-600">
                                                    {formatCurrency(row.netAmountCents)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-100 font-semibold">
                                            <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
                                                <strong>Total</strong>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                                {formatCurrency(
                                                    taxData.income.rows.reduce(
                                                        (sum, row) => sum + row.grossAmountCents,
                                                        0,
                                                    ),
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                                {formatCurrency(
                                                    taxData.income.rows.reduce(
                                                        (sum, row) => sum + row.platformFeeCents,
                                                        0,
                                                    ),
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-green-600">
                                                {formatCurrency(taxData.income.totalCents)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
                                Investment Activity
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Farm Name
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {taxData.investments.rows.map((row) => (
                                            <tr key={row.investmentId}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {row.date}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {row.farmName}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                                    {formatCurrency(row.amountCents)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-100 font-semibold">
                                            <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
                                                <strong>Total</strong>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                                {formatCurrency(taxData.investments.totalCents)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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
