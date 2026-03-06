import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import OtpInput from '@/Components/Auth/OtpInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function TwoFactorChallenge() {
    const { t } = useTranslation();
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
            <Head title={t('auth.two_factor_auth')} />

            <div className="mb-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">{t('auth.two_factor_auth')}</h3>
                <p className="mt-1 text-sm text-gray-600">
                    {useRecoveryCode
                        ? t('auth.recovery_code_instruction')
                        : t('auth.authenticator_code_instruction')}
                </p>
            </div>

            {!useRecoveryCode ? (
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="otp" value={t('auth.authentication_code')} />

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
                            {t('auth.verify')}
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
                            {t('auth.use_recovery_code')}
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleUseRecoveryCode}>
                    <div>
                        <InputLabel htmlFor="recovery-code" value={t('auth.recovery_code')} />

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
                            {t('auth.verify_recovery_code')}
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
                            {t('auth.use_authenticator_code')}
                        </button>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
