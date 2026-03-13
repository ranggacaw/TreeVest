import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowLeft, IconShield, IconDevicePhoneMobile, IconQrCode, IconKey, IconCheck } from '@/Components/Icons/AppIcons';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

interface TwoFactorProps {
    two_factor_enabled: boolean;
    two_factor_type: 'totp' | 'sms' | null;
    recovery_codes: any[];
}

export default function TwoFactorAuthentication({
    two_factor_enabled = false,
    two_factor_type = null,
    recovery_codes = [],
}: TwoFactorProps) {
    const [showDisableModal, setShowDisableModal] = useState(false);
    const { post, delete: destroy, processing, errors, setData, data } = useForm({
        password: '',
        code: '',
        type: 'totp' as 'totp' | 'sms'
    });

    const handleDisable = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.2fa.disable'), {
            onSuccess: () => setShowDisableModal(false),
            preserveScroll: true,
        });
    };

    return (
        <AppShellLayout>
            <Head title="Keamanan Akun" />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-gray-100">
                    <Link href={route('profile.edit')} className="p-2 -ml-2 text-gray-900">
                        <IconArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Keamanan Akun</h1>
                </div>

                <div className="flex-1 overflow-y-auto pb-28">
                    {/* Status Banner */}
                    <div className="bg-white px-5 py-8 text-center border-b border-gray-100">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${two_factor_enabled ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100 shadow-xl' : 'bg-gray-100 text-gray-400'}`}>
                            <IconShield className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                            Autentikasi 2 Faktor
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${two_factor_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                            <p className="text-sm font-bold text-gray-500">
                                Status: {two_factor_enabled ? 'Aktif' : 'Tidak Aktif'}
                            </p>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="px-5 py-6">
                        <h3 className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4 ml-1">Metode Autentikasi</h3>
                        
                        <div className="space-y-4">
                            {/* App Authenticator */}
                            <div className={`bg-white p-5 rounded-3xl border ${two_factor_type === 'totp' ? 'border-emerald-200' : 'border-gray-100'} shadow-sm`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                        <IconQrCode className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-bold text-gray-900">Aplikasi Autentikator</h4>
                                            {two_factor_type === 'totp' && <div className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Aktif</div>}
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                                            Gunakan Google Authenticator atau Authy untuk mendapatkan kode keamanan.
                                        </p>
                                        {!two_factor_enabled && (
                                            <button className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">
                                                Siapkan Aplikasi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SMS OTP */}
                            <div className={`bg-white p-5 rounded-3xl border ${two_factor_type === 'sms' ? 'border-emerald-200' : 'border-gray-100'} shadow-sm`}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <IconDevicePhoneMobile className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-bold text-gray-900">SMS OTP</h4>
                                            {two_factor_type === 'sms' && <div className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Aktif</div>}
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
                                            Kirim kode verifikasi ke nomor handphone Anda yang terdaftar.
                                        </p>
                                        {!two_factor_enabled && (
                                            <button className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
                                                Hubungkan No. HP
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recovery Codes */}
                    {two_factor_enabled && (
                        <div className="px-5 py-2">
                             <div className="bg-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                <IconKey className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-800 rotate-12" />
                                <div className="relative z-10">
                                    <h4 className="text-white text-sm font-bold mb-2">Kode Pemulihan</h4>
                                    <p className="text-[11px] text-gray-400 mb-4 leading-normal">
                                        Simpan kode ini di tempat yang aman. Anda membutuhkannya jika kehilangan akses ke perangkat autentikasi.
                                    </p>
                                    <button className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-full border border-white/20">
                                        Lihat Kode Cadangan
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Footer Warning */}
                    <div className="px-10 py-10 text-center">
                        <p className="text-[11px] text-gray-400">
                            Masalah dengan 2FA? Hubungi <Link href={route('investor.support')} className="text-emerald-600 font-bold decoration-dotted underline">Pusat Bantuan</Link>
                        </p>
                    </div>
                </div>

                {/* Main Action */}
                {two_factor_enabled && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 flex pb-8 z-30">
                        <button 
                            onClick={() => setShowDisableModal(true)}
                            className="w-full py-4 text-sm font-extrabold text-red-600 bg-red-50 rounded-2xl active:bg-red-100 transition-colors"
                        >
                            Matikan Autentikasi 2 Faktor
                        </button>
                    </div>
                )}
                
                <BottomNav activeTab="profile" />
            </div>

            {/* Disable Modal */}
            <Modal show={showDisableModal} onClose={() => setShowDisableModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">Matikan Keamanan 2FA?</h2>
                    <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                        Akun Anda akan kurang aman tanpa perlindungan tambahan. Tetap lanjutkan?
                    </p>

                    <form onSubmit={handleDisable} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="pass_2fa" value="Konfirmasi Kata Sandi" />
                            <TextInput
                                id="pass_2fa"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-4 !bg-red-600 border-none shadow-lg shadow-red-100" 
                                disabled={processing}
                            >
                                Ya, Matikan Saja
                            </PrimaryButton>
                            <SecondaryButton 
                                className="w-full justify-center py-4 border-none"
                                onClick={() => setShowDisableModal(false)}
                                type="button"
                            >
                                Batalkan
                            </SecondaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                * { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </AppShellLayout>
    );
}
