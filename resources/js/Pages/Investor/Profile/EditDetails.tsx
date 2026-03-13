import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { ChevronLeft, Camera, Shield, Lock, Trash2, Phone, Mail, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';
import AvatarUpload from '@/Components/Profile/AvatarUpload';


export default function EditDetails({
    mustVerifyEmail,
    status,
    auth,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { t } = useTranslation('profile');
    const user = auth.user;

    if (!user) {
        return null;
    }

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        phone_country_code: user.phone_country_code || 'ID',
    });

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const handleAvatarUpload = (file: File) => {
        patch(route('profile.avatar.store'));
    };

    const handleAvatarDelete = () => {
        router.delete(route('profile.avatar.destroy'));
    };

    const handlePhoneUpdate = () => {
        patch(route('profile.phone.update'));
    };

    return (
        <AppShellLayout>
            <Head title="Data Pribadi" />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <Link href={route('profile.edit')} className="p-2 -ml-2 text-gray-900">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900">Data Pribadi</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-28">
                    {/* Avatar Section */}
                    <div className="bg-white px-5 py-8 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-emerald-600 uppercase">{user.name.charAt(0)}</span>
                                )}
                            </div>
                            <button
                                onClick={() => document.getElementById('avatar-upload-input')?.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                id="avatar-upload-input"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAvatarUpload(file);
                                }}
                            />
                        </div>
                        <p className="mt-4 text-xs text-gray-500 font-medium">Ketuk untuk ganti foto profil</p>
                    </div>

                    <div className="h-2 bg-gray-50" />

                    {/* Basic Info Form */}
                    <div className="bg-white px-5 py-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                <User className="w-4 h-4" />
                            </div>
                            <h2 className="text-[15px] font-bold text-gray-900">Informasi Dasar</h2>
                        </div>

                        <form onSubmit={submitProfile} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Lengkap" className="text-gray-500 text-xs font-bold mb-1.5 ml-1" />
                                <TextInput
                                    id="name"
                                    className="w-full bg-gray-50 border-gray-100"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError className="mt-1" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Alamat Email" className="text-gray-500 text-xs font-bold mb-1.5 ml-1" />
                                <div className="relative">
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="w-full bg-gray-50 border-gray-100 pr-10"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {user.email_verified_at ? (
                                            <Shield className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        )}
                                    </div>
                                </div>
                                <InputError className="mt-1" message={errors.email} />
                                {mustVerifyEmail && user.email_verified_at === null && (
                                    <p className="mt-2 text-[11px] text-amber-600 font-medium">
                                        Email belum diverifikasi. <Link href={route('verification.send')} method="post" as="button" className="underline font-bold">Kirim ulang</Link>
                                    </p>
                                )}
                            </div>

                            <div className="pt-2">
                                <PrimaryButton disabled={processing} className="w-full justify-center shadow-lg shadow-emerald-200">
                                    Simpan Perubahan
                                </PrimaryButton>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-center text-xs text-emerald-600 font-bold mt-3">Berhasil disimpan!</p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    <div className="h-2 bg-gray-50" />

                    {/* Phone Section */}
                    <div className="bg-white px-5 py-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                <Phone className="w-4 h-4" />
                            </div>
                            <h2 className="text-[15px] font-bold text-gray-900">Nomor Handphone</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="phone" value="Nomor HP" className="text-gray-500 text-xs font-bold mb-1.5 ml-1" />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    className="w-full bg-gray-50 border-gray-100"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <InputError className="mt-1" message={errors.phone} />
                            </div>

                            <PrimaryButton
                                onClick={handlePhoneUpdate}
                                disabled={processing}
                                className="w-full justify-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-200"
                            >
                                {user.phone ? 'Update Nomor HP' : 'Tambah Nomor HP'}
                            </PrimaryButton>
                        </div>
                    </div>

                    <div className="h-2 bg-gray-50" />

                    {/* Security Links */}
                    <div className="bg-white px-5 py-4">
                        <h2 className="text-[15px] font-bold text-gray-900 mb-4">Keamanan</h2>
                        <div className="space-y-1">
                            <Link href={route('profile.edit')} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Ubah Kata Sandi</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </Link>
                            <Link href={route('profile.2fa')} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Otentikasi 2 Faktor (2FA)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.two_factor_enabled_at ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {user.two_factor_enabled_at ? 'AKTIF' : 'NONAKTIF'}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="h-2 bg-gray-50" />

                    {/* Danger Zone */}
                    <div className="bg-white px-5 py-6 mb-10">
                        <button className="w-full flex items-center justify-center gap-2 p-4 text-red-500 bg-red-50 rounded-2xl font-bold text-sm active:bg-red-100 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Hapus Akun Saya
                        </button>
                        <p className="mt-3 text-[11px] text-gray-400 text-center leading-relaxed">
                            Penghapusan akun bersifat permanen dan tidak dapat dibatalkan. Pastikan semua investasi Anda telah selesai.
                        </p>
                    </div>

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

function ChevronRight(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    )
}
