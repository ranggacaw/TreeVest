import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link } from '@inertiajs/react';
import { Payout } from '@/types';
import { formatRupiah } from '@/utils/currency';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { IconDollar, IconArrowLeft, IconCheck } from '@/Components/Icons/AppIcons';

interface Props {
  payout: Payout;
}

export default function Show({ payout }: Props) {
    const farmName = (payout.harvest?.tree as any)?.farm?.name ?? (payout.investment?.tree as any)?.farm?.name ?? '-';

    return (
        <AppShellLayout>
             <Head title={`Payout #${payout.id}`} />
             <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '88px' }}>
                     <AppTopBar notificationCount={0} />

                     <div className="bg-white px-5 pt-5 pb-6">
                        <Link 
                            href={route('investor.payouts.index')} 
                            className="inline-flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <IconArrowLeft className="w-4 h-4" />
                            </div>
                            Kembali ke Payouts
                        </Link>

                        <div className="text-center mb-8 relative">
                             {/* Decorative glow */}
                             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
                             
                             <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                                <IconDollar className="w-10 h-10 text-emerald-600" />
                                {payout.status === 'completed' && (
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <IconCheck className="w-4 h-4 text-white" />
                                    </div>
                                )}
                             </div>
                             
                             <p className="text-[13px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Total Payout</p>
                             <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight leading-none mb-3">
                                {formatRupiah(payout.net_amount_cents)}
                             </h1>
                             <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                                 payout.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                 payout.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                 'bg-gray-50 text-gray-700 border-gray-200'
                             }`}>
                                 {payout.status === 'completed' ? 'Berhasil Dibayarkan' : payout.status}
                             </span>
                        </div>

                        {/* Receipt Card */}
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-5 relative overflow-hidden">
                             {/* Ticket cutouts */}
                             <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full" />
                             <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full" />
                             
                             <h3 className="text-center text-[13px] font-bold text-gray-900 mb-6 uppercase tracking-wider border-b border-gray-200 pb-4 mx-4">
                                Detail Transaksi
                             </h3>

                             <div className="space-y-4">
                                 <div className="flex justify-between items-center text-[13px]">
                                     <span className="text-gray-500">Tanggal</span>
                                     <span className="font-bold text-gray-900">
                                         {new Date(payout.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                     </span>
                                 </div>
                                 <div className="flex justify-between items-center text-[13px]">
                                     <span className="text-gray-500">Sumber Farm</span>
                                     <span className="font-bold text-gray-900 text-right max-w-[60%] truncate">
                                         {farmName}
                                     </span>
                                 </div>
                                 <div className="flex justify-between items-center text-[13px]">
                                     <span className="text-gray-500">Metode</span>
                                     <span className="font-bold text-gray-900 uppercase bg-white border border-gray-200 px-2 py-0.5 rounded text-[10px]">
                                         {payout.payout_method?.replace('_', ' ') ?? '-'}
                                     </span>
                                 </div>
                                 
                                 <div className="border-t border-dashed border-gray-300 my-4" />
                                 
                                 <div className="flex justify-between items-center text-[13px]">
                                     <span className="text-gray-500">Gross Amount</span>
                                     <span className="font-medium text-gray-900">
                                         {formatRupiah(payout.gross_amount_cents)}
                                     </span>
                                 </div>
                                 <div className="flex justify-between items-center text-[13px]">
                                     <span className="text-gray-500">Platform Fee</span>
                                     <span className="font-medium text-red-500">
                                         -{formatRupiah(payout.platform_fee_cents)}
                                     </span>
                                 </div>
                                 
                                 <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                                     <span className="text-[13px] font-bold text-gray-900">Net Amount</span>
                                     <span className="text-[15px] font-extrabold text-emerald-600">
                                         {formatRupiah(payout.net_amount_cents)}
                                     </span>
                                 </div>
                             </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[11px] text-gray-400">
                                Referensi ID: #{payout.id} • {new Date().getFullYear()} Treevest
                            </p>
                        </div>
                     </div>
                </div>
                <BottomNav />
             </div>
             <style>{`::-webkit-scrollbar { display: none; } * { -webkit-tap-highlight-color: transparent; }`}</style>
        </AppShellLayout>
    );
}
