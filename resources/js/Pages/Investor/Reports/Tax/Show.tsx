import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { GeneratedReportStatus } from '@/types';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { IconArrowLeft, IconDollar, IconPlant } from '@/Components/Icons/AppIcons';

interface TaxSummaryData {
    year: number;
    income: {
        rows: Array<{
            payoutId: number;
            date: string;
            farmName: string;
            grossAmountIdr: number;
            platformFeeIdr: number;
            netAmountIdr: number;
        }>;
        totalIdr: number;
    };
    investments: {
        rows: Array<{
            investmentId: number;
            date: string;
            farmName: string;
            amountIdr: number;
        }>;
        totalIdr: number;
    };
    summary: {
        totalIncomeIdr: number;
        totalInvestedIdr: number;
        netIdr: number;
        overallRoiPercent?: number; // Added optional just in case, though not in props
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

    return (
        <AppShellLayout>
            <Head title={`Tax Summary - ${year}`} />
            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={0} />

                    {/* Header */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <Link href={route('reports.index')} className="text-[13px] text-gray-500 font-bold mb-4 flex items-center gap-2 hover:text-gray-900 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <IconArrowLeft className="w-4 h-4" />
                            </div>
                            Kembali ke Laporan
                        </Link>

                        <h1 className="text-[20px] font-extrabold text-gray-900 mb-2">Tax Summary {year}</h1>

                        {/* Disclaimer */}
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                <strong>Disclaimer:</strong> Laporan ini hanya untuk informasi dan bukan saran pajak resmi. Konsultasikan dengan profesional pajak.
                            </p>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Summary Cards */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h2 className="text-[15px] font-bold text-gray-900 mb-4">Ringkasan Pajak</h2>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[11px] text-emerald-600 font-bold mb-1 uppercase tracking-wide">Total Income</p>
                                <p className="text-[15px] font-extrabold text-gray-900 truncate">{formatRupiah(taxData.summary.totalIncomeIdr)}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[11px] text-blue-600 font-bold mb-1 uppercase tracking-wide">Total Investments</p>
                                <p className="text-[15px] font-extrabold text-gray-900 truncate">{formatRupiah(taxData.summary.totalInvestedIdr)}</p>
                            </div>
                            <div className="col-span-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                                <span className="text-[13px] text-gray-600 font-bold">Net (Pemasukan Bersih)</span>
                                <span className={`text-[17px] font-extrabold ${taxData.summary.netIdr >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {formatRupiah(taxData.summary.netIdr)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button onClick={handlePdfRequest} disabled={pdfGenerating} className="flex-1 py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                {pdfGenerating ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button onClick={handleCsvExport} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-[13px] font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Income List */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <IconDollar className="w-5 h-5 text-emerald-600" />
                            Pendapatan (Payouts)
                        </h3>
                        <div className="space-y-3">
                            {taxData.income.rows.map(row => (
                                <div key={row.payoutId} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:border-emerald-100 transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[11px] text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-full">{row.date}</span>
                                        <span className="text-[13px] font-extrabold text-emerald-600">+{formatRupiah(row.netAmountIdr)}</span>
                                    </div>
                                    <p className="text-[13px] font-bold text-gray-900 mb-1">{row.farmName}</p>
                                    <div className="flex justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-2 mt-2">
                                        <span className="font-medium">Gross: {formatRupiah(row.grossAmountIdr)}</span>
                                        <span className="font-medium">Fee: {formatRupiah(row.platformFeeIdr)}</span>
                                    </div>
                                </div>
                            ))}
                            {taxData.income.rows.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-[13px] text-gray-400 font-medium">Tidak ada data pendapatan untuk tahun ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Investments List */}
                    <div className="bg-white px-5 pt-5 pb-6">
                        <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
                             <IconPlant className="w-5 h-5 text-blue-500" />
                             Investasi Baru
                        </h3>
                        <div className="space-y-3">
                            {taxData.investments.rows.map(row => (
                                <div key={row.investmentId} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex justify-between items-center">
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded-full">{row.date}</p>
                                        <p className="text-[13px] font-bold text-gray-900">{row.farmName}</p>
                                    </div>
                                    <p className="text-[13px] font-extrabold text-gray-900">{formatRupiah(row.amountIdr)}</p>
                                </div>
                            ))}
                            {taxData.investments.rows.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-[13px] text-gray-400 font-medium">Tidak ada data investasi untuk tahun ini.</p>
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
