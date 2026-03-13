import AppShellLayout from '@/Layouts/AppShellLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowLeft, IconInfoCircle, IconCheck, IconX } from '@/Components/Icons/AppIcons';
import BottomNav from '@/Components/Portfolio/BottomNav';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';

interface AccountSettingsProps {
    hasPendingInvestments?: boolean;
    hasPendingPayouts?: boolean;
}

export default function AccountSettings({
    hasPendingInvestments = false,
    hasPendingPayouts = false,
}: AccountSettingsProps) {
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [showDeletionRequest, setShowDeletionRequest] = useState(false);
    const [password, setPassword] = useState('');

    const deactivateForm = useForm({
        password: '',
    });

    const deletionForm = useForm({
        password: '',
        reason: '',
    });

    const handleDeactivate = (e: React.FormEvent) => {
        e.preventDefault();
        deactivateForm.post(route('account.deactivate'), {
            onSuccess: () => setShowDeactivateConfirm(false),
            preserveScroll: true,
        });
    };

    const handleDeletionRequest = (e: React.FormEvent) => {
        e.preventDefault();
        deletionForm.post(route('account.delete-request'), {
            onSuccess: () => {
                setShowDeletionRequest(false);
                deletionForm.reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <AppShellLayout>
            <Head title="Pengaturan Akun" />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-gray-100">
                    <Link href={route('profile.edit')} className="p-2 -ml-2 text-gray-900">
                        <IconArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Pengaturan Akun</h1>
                </div>

                <div className="flex-1 overflow-y-auto pb-28">
                    {/* Security Section */}
                    <div className="px-5 py-6">
                         <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Keamanan & Privasi</h2>
                         
                         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                             <div className="p-5 border-b border-gray-50">
                                 <h3 className="text-sm font-bold text-gray-900 mb-1">Nonaktifkan Akun</h3>
                                 <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                     Akses Anda akan dicabut sementara. Anda dapat mengaktifkan kembali akun dengan menghubungi Support dalam 30 hari.
                                 </p>
                                 <button 
                                     onClick={() => setShowDeactivateConfirm(true)}
                                     className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full active:bg-red-100 transition-colors"
                                 >
                                     Nonaktifkan Sekarang
                                 </button>
                             </div>

                             <div className="p-5">
                                 <h3 className="text-sm font-bold text-gray-900 mb-1">Hapus Akun Permanen</h3>
                                 <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                     Data investasi dan akun Anda akan dihapus secara permanen. Proses ini tidak dapat dibatalkan.
                                 </p>
                                 <button 
                                     onClick={() => setShowDeletionRequest(true)}
                                     className="text-xs font-bold text-red-600 border border-red-100 px-4 py-2 rounded-full active:bg-red-50 transition-colors"
                                 >
                                     Ajukan Penghapusan
                                 </button>
                             </div>
                         </div>
                    </div>

                    {/* Preferences */}
                    <div className="px-5 py-2">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Notifikasi</h2>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2">
                             <Link 
                                href={route('settings.notifications')}
                                className="flex items-center justify-between p-4 active:bg-gray-50 rounded-2xl transition-colors"
                             >
                                <span className="text-sm font-bold text-gray-700">Push Notifications</span>
                                <div className="text-emerald-600">
                                    <IconCheck className="w-5 h-5" />
                                </div>
                             </Link>
                        </div>
                    </div>

                    <div className="px-5 mt-10 text-center">
                        <p className="text-[10px] text-gray-400 font-medium">TreeVest v1.2.4 (Alpha)</p>
                    </div>
                </div>

                <BottomNav activeTab="profile" />
            </div>

            {/* Deactivation Modal */}
            <Modal show={showDeactivateConfirm} onClose={() => setShowDeactivateConfirm(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">Konfirmasi Nonaktifkan</h2>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        Masukkan kata sandi Anda untuk melanjutkan proses penonaktifan akun.
                    </p>

                    <form onSubmit={handleDeactivate} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="password" value="Kata Sandi" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={deactivateForm.data.password}
                                onChange={(e) => deactivateForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={deactivateForm.errors.password} className="mt-2" />
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-4 !bg-red-600 border-none shadow-lg shadow-red-100" 
                                disabled={deactivateForm.processing}
                            >
                                Ya, Nonaktifkan Akun
                            </PrimaryButton>
                            <SecondaryButton 
                                className="w-full justify-center py-4 border-none"
                                onClick={() => setShowDeactivateConfirm(false)}
                                type="button"
                            >
                                Batalkan
                            </SecondaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Deletion Modal */}
            <Modal show={showDeletionRequest} onClose={() => setShowDeletionRequest(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">Hapus Akun Permanen</h2>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        Tindakan ini permanen. Mohon berikan alasan mengapa Anda ingin menghapus akun.
                    </p>

                    <form onSubmit={handleDeletionRequest} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="del_reason" value="Alasan (Opsional)" />
                            <textarea
                                id="del_reason"
                                className="mt-1 block w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-2xl shadow-sm text-sm"
                                rows={3}
                                value={deletionForm.data.reason}
                                onChange={(e) => deletionForm.setData('reason', e.target.value)}
                                placeholder="Ceritakan kendala Anda..."
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="del_password" value="Konfirmasi Kata Sandi" />
                            <TextInput
                                id="del_password"
                                type="password"
                                className="mt-1 block w-full"
                                value={deletionForm.data.password}
                                onChange={(e) => deletionForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <InputError message={deletionForm.errors.password} className="mt-2" />
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-4 !bg-red-700 border-none shadow-lg shadow-red-100"
                                disabled={deletionForm.processing}
                            >
                                Kirim Pengajuan Hapus
                            </PrimaryButton>
                            <SecondaryButton 
                                className="w-full justify-center py-4 border-none"
                                onClick={() => setShowDeletionRequest(false)}
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
