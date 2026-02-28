import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import OtpInput from '@/Components/Auth/OtpInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function TwoFactorChallenge() {
    const [otp, setOtp] = useState('');
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    const { post, processing, errors } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('auth.2fa.verify'));
    };

    const handleUseRecoveryCode: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('auth.2fa.recovery'));
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Authentication" />

            <div className="mb-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="mt-1 text-sm text-gray-600">
                    {useRecoveryCode
                        ? 'Enter one of your recovery codes to regain access to your account.'
                        : 'Enter the 6-digit code from your authenticator app to complete login.'}
                </p>
            </div>

            {!useRecoveryCode ? (
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="otp" value="Authentication Code" />

                        <OtpInput
                            id="otp"
                            value={otp}
                            onChange={setOtp}
                            length={6}
                            error={errors.code}
                            className="mt-4"
                            autoFocus
                        />

                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="mt-6">
                        <PrimaryButton className="w-full" disabled={processing || otp.length !== 6}>
                            Verify
                        </PrimaryButton>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setUseRecoveryCode(true);
                                setOtp('');
                            }}
                            className="text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Use a recovery code
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleUseRecoveryCode}>
                    <div>
                        <InputLabel htmlFor="recovery-code" value="Recovery Code" />

                        <OtpInput
                            id="recovery-code"
                            value={otp}
                            onChange={setOtp}
                            length={8}
                            error={errors.code}
                            className="mt-4"
                            autoFocus
                        />

                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="mt-6">
                        <PrimaryButton className="w-full" disabled={processing || otp.length !== 8}>
                            Verify Recovery Code
                        </PrimaryButton>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setUseRecoveryCode(false);
                                setOtp('');
                            }}
                            className="text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Use authenticator code instead
                        </button>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
