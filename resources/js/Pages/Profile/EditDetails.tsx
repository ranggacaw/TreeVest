import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import AvatarUpload from '@/Components/Profile/AvatarUpload';
import PhoneInput from '@/Components/Auth/PhoneInput';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppShellLayout from '@/Layouts/AppShellLayout';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { ChevronLeft } from 'lucide-react';

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

    const { data, setData, patch, processing, errors } = useForm({
        phone: user.phone || '',
        phone_country_code: user.phone_country_code || 'MY',
    });

    const handleAvatarUpload = (file: File) => {
        patch(route('profile.avatar'));
    };

    const handleAvatarDelete = () => {
        router.delete(route('profile.avatar'));
    };

    const handlePhoneUpdate = () => {
        patch(route('profile.phone.update'));
    };

    return (
        <AppShellLayout>
            <Head title={t('edit_profile', { defaultValue: 'Edit Profil' })} />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
                    <Link href={route('profile.edit')} className="p-2 -ml-2 text-gray-500">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">{t('edit_profile', { defaultValue: 'Edit Profil' })}</h1>
                </div>

                <div className="flex-1 overflow-y-auto pb-24 px-4 py-6 space-y-6">
                    <div className="bg-white p-4 shadow-sm rounded-2xl border border-gray-100">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow-sm rounded-2xl border border-gray-100">
                        <AvatarUpload
                            currentAvatar={user.avatar_url}
                            onUpload={handleAvatarUpload}
                            onDelete={handleAvatarDelete}
                        />
                    </div>

                    <div className="bg-white p-4 shadow-sm rounded-2xl border border-gray-100">
                        <header>
                            <h2 className="text-lg font-medium text-gray-900">{t('phone_number')}</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {t('phone_desc')}
                            </p>
                        </header>

                        <div className="mt-6 space-y-6">
                            <PhoneInput
                                id="phone"
                                label={t('phone_number')}
                                value={data.phone}
                                onChange={(value) => {
                                    setData('phone', value || '');
                                }}
                                error={errors.phone}
                            />

                            {user.phone && (
                                <div className="flex items-center gap-2">
                                    {user.phone_verified_at ? (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                            {t('verified')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                            {t('not_verified')}
                                        </span>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handlePhoneUpdate}
                                disabled={processing}
                                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-25 shadow-sm"
                            >
                                {user?.phone ? t('update_phone') : t('add_phone')}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow-sm rounded-2xl border border-gray-100">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow-sm rounded-2xl border border-gray-100">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>

                <BottomNav activeTab="profile" />
            </div>
        </AppShellLayout>
    );
}
