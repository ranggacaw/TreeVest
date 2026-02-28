import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import AvatarUpload from '@/Components/Profile/AvatarUpload';
import PhoneInput from '@/Components/Auth/PhoneInput';
import { useForm } from '@inertiajs/react';

export default function Edit({
    mustVerifyEmail,
    status,
    auth,
}: PageProps<{ mustVerifyEmail: boolean; status?: string; auth: { user: any } }>) {
    const user = auth.user as any;

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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <AvatarUpload
                            currentAvatar={user.avatar_url}
                            onUpload={handleAvatarUpload}
                            onDelete={handleAvatarDelete}
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <header>
                            <h2 className="text-lg font-medium text-gray-900">Phone Number</h2>

                            <p className="mt-1 text-sm text-gray-600">
                                Add a phone number to enable phone-based login and two-factor
                                authentication.
                            </p>
                        </header>

                        <div className="mt-6 space-y-6">
                            <PhoneInput
                                id="phone"
                                label="Phone Number"
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
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                            Not Verified
                                        </span>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handlePhoneUpdate}
                                disabled={processing}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25"
                            >
                                {user.phone ? 'Update Phone Number' : 'Add Phone Number'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <header>
                            <h2 className="text-lg font-medium text-gray-900">
                                Account Security
                            </h2>

                            <p className="mt-1 text-sm text-gray-600">
                                Manage your account security settings including two-factor
                                authentication and active sessions.
                            </p>
                        </header>

                        <div className="mt-6 space-y-4">
                            <Link
                                href={route('profile.2fa')}
                                className="block rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-indigo-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Two-Factor Authentication
                            </Link>

                            <Link
                                href={route('profile.sessions')}
                                className="block rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-indigo-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Manage Browser Sessions
                            </Link>

                            <Link
                                href={route('profile.account-settings')}
                                className="block rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-red-700 transition hover:border-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Account Settings (Deactivate/Delete)
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
