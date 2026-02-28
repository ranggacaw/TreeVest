import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import TwoFactorSetup from '@/Components/Auth/TwoFactorSetup';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import RecoveryCodeDisplay from '@/Components/Auth/RecoveryCodeDisplay';

interface TwoFactorProps {
    enabled?: boolean;
    type?: 'totp' | 'sms' | null;
    qrCode?: string;
    recoveryCodes?: string[];
}

export default function TwoFactorAuthentication({
    enabled = false,
    type = null,
    qrCode,
    recoveryCodes,
}: TwoFactorProps) {
    const [showConfirmDisable, setShowConfirmDisable] = useState(false);
    const [showEnable, setShowEnable] = useState(false);

    const { post, processing, delete: destroy } = useForm({});

    const handleEnable = (selectedType: 'totp' | 'sms') => {
        post(route('profile.2fa.enable'));
    };

    const handleVerifyEnable = (code: string) => {
        post(route('profile.2fa.verify'));
    };

    const handleDisable = () => {
        destroy(route('profile.2fa.disable'), {
            onSuccess: () => {
                setShowConfirmDisable(false);
            },
        });
    };

    const handleRegenerateCodes = () => {
        post(route('profile.2fa.recovery-codes'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Two-Factor Authentication
                </h2>
            }
        >
            <Head title="Two-Factor Authentication" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        {!enabled ? (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Two-factor authentication is not enabled
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Two-factor authentication adds an extra layer of security to your
                                    account by requiring a verification code in addition to your password.
                                </p>
                                <TwoFactorSetup
                                    qrCode={qrCode}
                                    recoveryCodes={recoveryCodes}
                                    onEnable={handleEnable}
                                    onVerify={handleVerifyEnable}
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Two-factor authentication is enabled
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Your account is protected with{' '}
                                        {type === 'totp' ? 'an authenticator app' : 'SMS verification'}.
                                        You'll need to enter a verification code when signing in from a new
                                        device.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <SecondaryButton onClick={handleRegenerateCodes} disabled={processing}>
                                        Regenerate Recovery Codes
                                    </SecondaryButton>
                                    <DangerButton
                                        onClick={() => setShowConfirmDisable(true)}
                                        disabled={processing}
                                    >
                                        Disable Two-Factor Authentication
                                    </DangerButton>
                                </div>

                                <RecoveryCodeDisplay
                                    recoveryCodes={recoveryCodes || []}
                                    onClose={() => {}}
                                    onConfirm={() => {}}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showConfirmDisable} onClose={() => setShowConfirmDisable(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Disable Two-Factor Authentication
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to disable two-factor authentication? This will make your
                        account less secure.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <DangerButton onClick={handleDisable} disabled={processing}>
                            Disable
                        </DangerButton>
                        <SecondaryButton
                            onClick={() => setShowConfirmDisable(false)}
                            disabled={processing}
                        >
                            Cancel
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
