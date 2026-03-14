import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import ReportFilterForm from '@/Components/ReportFilterForm';
import PerformanceBarChart from '@/Components/PerformanceBarChart';
import ReturnsTrendChart from '@/Components/ReturnsTrendChart';
import { GeneratedReportStatus } from '@/types';
import { IconChart, IconDollar, IconArrowLeft, IconCheck, IconX, IconFlash } from '@/Components/Icons/AppIcons';

interface Props {
    profitLoss: {
        rows: Array<{
            investmentId: number;
            treeIdentifier: string;
            fruitType: string;
            variant: string;
            farmName: string;
            amountInvestedIdr: number;
            totalPayoutsIdr: number;
            netIdr: number;
            actualRoiPercent: number;
            status: string;
            purchaseDate: string;
        }>;
        summary: {
            totalInvestedIdr: number;
            totalPayoutsIdr: number;
            netIdr: number;
            overallRoiPercent: number;
        };
    };
    performance: Array<{
        month: string;
        investedIdr: number;
        payoutsIdr: number;
        cumulativeIdr: number;
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
    const page = usePage();
    const unreadCount = (page.props as any).unread_notifications_count ?? 0;

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
                return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
            case 'generating':
                return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'completed':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'failed':
                return 'bg-red-50 text-red-600 border border-red-100';
            default:
                return 'bg-gray-50 text-gray-600 border border-gray-100';
        }
    };

    return (
        <AppShellLayout>
            <Head title="Laporan Keuangan" />
            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unreadCount} />

                    {/* Header */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-[20px] font-extrabold text-gray-900">Laporan Keuangan</h1>
                            <Link href={route('investor.dashboard')} className="text-[13px] text-emerald-600 font-bold">
                                Dashboard
                            </Link>
                        </div>
                        <p className="text-[13px] text-gray-500 leading-snug">
                            Analisis performa investasi dan unduh laporan.
                        </p>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Summary Cards */}
                    <div className="bg-white px-5 pt-5 pb-6">
                         <h2 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <IconChart className="w-5 h-5 text-emerald-600" />
                            Ringkasan Portofolio
                         </h2>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wide">Total Invested</p>
                                <p className="text-[15px] font-extrabold text-gray-900 truncate">
                                    {formatRupiah(profitLoss.summary.totalInvestedIdr)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wide">Total Payouts</p>
                                <p className="text-[15px] font-extrabold text-gray-900 truncate">
                                    {formatRupiah(profitLoss.summary.totalPayoutsIdr)}
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[11px] text-emerald-600 font-bold mb-1 uppercase tracking-wide">Net Return</p>
                                <p className={`text-[15px] font-extrabold ${profitLoss.summary.netIdr >= 0 ? 'text-emerald-700' : 'text-red-600'} truncate`}>
                                    {formatRupiah(profitLoss.summary.netIdr)}
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[11px] text-blue-600 font-bold mb-1 uppercase tracking-wide">Overall ROI</p>
                                <p className={`text-[15px] font-extrabold ${profitLoss.summary.overallRoiPercent >= 0 ? 'text-blue-700' : 'text-red-600'} truncate`}>
                                    {profitLoss.summary.overallRoiPercent.toFixed(2)}%
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handlePdfRequest}
                                disabled={pdfGenerating}
                                className="flex-1 py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {pdfGenerating ? 'Generating...' : (
                                    <>Download PDF</>
                                )}
                            </button>
                            <button
                                onClick={handleCsvExport}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-[13px] font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Filters */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-wide">Filter Data Laporan</h3>
                            <ReportFilterForm filters={filters} filterOptions={filterOptions} />
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Charts */}
                    <div className="bg-white px-5 pt-5 pb-6 space-y-8">
                        <div>
                            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Invested vs Payouts</h3>
                            <div className="h-56 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                                <PerformanceBarChart data={performance} height={210} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Cumulative Trend</h3>
                            <div className="h-56 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                                <ReturnsTrendChart data={performance} height={210} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Reports */}
                    {recentReports.length > 0 && (
                        <>
                            <div className="h-3 bg-gray-50" />
                            <div className="bg-white px-5 pt-5 pb-6">
                                <h3 className="text-[15px] font-bold text-gray-900 mb-4">Laporan Terakhir</h3>
                                <div className="space-y-3">
                                    {recentReports.map((report) => (
                                        <div key={report.id} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[13px] font-bold text-gray-900">Report #{report.id}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getReportStatusColor(report.status)}`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(report.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {report.status === 'completed' && (
                                                <button
                                                    onClick={() => handleDownloadReport(report.id)}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                                                >
                                                    Download
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="h-3 bg-gray-50" />

                    {/* Detail Table (Card List) */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Detail Investasi</h3>
                        <div className="space-y-3">
                            {profitLoss.rows.map((row) => (
                                <div key={row.investmentId} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-100 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-[13px]">{row.treeIdentifier}</h4>
                                            <p className="text-[11px] text-gray-500">{row.fruitType} - {row.variant}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{row.farmName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-[13px] ${row.netIdr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {formatRupiah(row.netIdr)}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium">Net Profit</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Invested</p>
                                            <p className="text-[11px] font-semibold text-gray-700">{formatRupiah(row.amountInvestedIdr)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Payouts</p>
                                            <p className="text-[11px] font-semibold text-gray-700">{formatRupiah(row.totalPayoutsIdr)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">ROI</p>
                                            <p className={`text-[11px] font-bold ${row.actualRoiPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {row.actualRoiPercent.toFixed(2)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Status</p>
                                            <p className="text-[11px] font-semibold text-gray-700 capitalize">{row.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {profitLoss.rows.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-[13px] text-gray-400 font-medium">Tidak ada data investasi untuk periode ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                <BottomNav />
            </div>
            <style>{`::-webkit-scrollbar { display: none; } * { -webkit-tap-highlight-color: transparent; }`}</style>
        </AppShellLayout>
    );
}
