import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link } from '@inertiajs/react';
import { IconArrowLeft, IconShield, IconCheck, IconX, IconInfoCircle, IconFlash } from '@/Components/Icons/AppIcons';
import BottomNav from '@/Components/Portfolio/BottomNav';

interface KycProps {
    verification: {
        id: number;
        status: string;
        submitted_at?: string;
        verified_at?: string;
        rejection_reason?: string;
        documents: any[];
    } | null;
}

export default function Index({ verification }: KycProps) {
    const status = verification?.status || 'not_started';

    const getStatusContent = () => {
        switch (status) {
            case 'verified':
                return {
                    icon: <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-xl shadow-emerald-100"><IconCheck className="w-8 h-8" /></div>,
                    title: 'Identitas Terverifikasi',
                    desc: 'Akun Anda telah terverifikasi. Anda sekarang dapat melakukan transaksi investasi penuh.',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50'
                };
            case 'pending':
                return {
                    icon: <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4 shadow-xl shadow-amber-100 animate-pulse">!</div>,
                    title: 'Sedang Ditinjau',
                    desc: 'Dokumen Anda sedang dalam proses verifikasi oleh tim kami. Mohon tunggu maksimal 1x24 jam.',
                    color: 'text-amber-500',
                    bg: 'bg-amber-50'
                };
            case 'rejected':
                return {
                    icon: <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xl shadow-red-100"><IconX className="w-8 h-8" /></div>,
                    title: 'Verifikasi Ditolak',
                    desc: verification?.rejection_reason || 'Dokumen Anda tidak sesuai ketentuan. Silakan unggah ulang.',
                    color: 'text-red-600',
                    bg: 'bg-red-50'
                };
            default:
                return {
                    icon: <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-100"><IconShield className="w-8 h-8" /></div>,
                    title: 'Verifikasi Identitas',
                    desc: 'Selesaikan KYC untuk membuka akses investasi di TreeVest.',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                };
        }
    };

    const content = getStatusContent();

    return (
        <AppShellLayout>
            <Head title="Verifikasi KYC" />

            <div className="relative w-full max-w-md bg-white flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-gray-100">
                    <Link href={route('profile.edit')} className="p-2 -ml-2 text-gray-900">
                        <IconArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">KYC Verifikasi</h1>
                </div>

                <div className="flex-1 overflow-y-auto pb-28">
                    {/* Status Illustration */}
                    <div className="px-5 py-12 flex flex-col items-center text-center border-b border-gray-50">
                        {content.icon}
                        <h2 className={`text-xl font-black mb-2 ${content.color}`}>{content.title}</h2>
                        <p className="text-sm text-gray-400 font-medium px-6 leading-relaxed">
                            {content.desc}
                        </p>
                    </div>

                    {/* Steps / Requirements */}
                    <div className="px-5 py-8">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                             <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">1</span>
                             Dokumen yang Diperlukan
                        </h3>

                        <div className="space-y-4 mb-10">
                            {[
                                { label: 'KTP Asli', desc: 'Foto KTP harus jelas dan terbaca.', sub: 'Wajib' },
                                { label: 'Selfie dengan KTP', desc: 'Wajah dan KTP terlihat jelas dalam satu frame.', sub: 'Wajib' },
                                { label: 'NPWP', desc: 'Untuk pelaporan pajak investasi.', sub: 'Opsional' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-3xl border border-gray-50 bg-gray-50/30">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <IconCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="text-sm font-black text-gray-900">{item.label}</h4>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {item.sub}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100 flex gap-4">
                            <IconInfoCircle className="w-6 h-6 text-blue-500 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 mb-1">Kenapa KYC?</h4>
                                <p className="text-[11px] text-blue-600 leading-normal font-medium">
                                    TreeVest diatur oleh otoritas terkait untuk memastikan keamanan dana investor dan mencegah pencucian uang.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 flex pb-8 z-30 shadow-2xl">
                    {status === 'not_started' || status === 'rejected' ? (
                        <Link
                            href={route('kyc.upload')}
                            className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                        >
                            Mulai Verifikasi
                        </Link>
                    ) : (
                        <Link
                            href={route('portfolio.dashboard')}
                            className="w-full py-4 bg-gray-900 text-white font-black text-sm rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                        >
                            Kembali ke Portofolio
                        </Link>
                    )}
                </div>
                
                <BottomNav activeTab="profile" />
            </div>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
