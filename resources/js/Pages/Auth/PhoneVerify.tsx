import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import OtpInput from '@/Components/Auth/OtpInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';

interface VerifyPageProps extends InertiaPageProps {
    phone?: string;
    isRegistration?: boolean;
}

export default function PhoneVerify() {
    const { props } = usePage<VerifyPageProps>();
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(600);
    const phoneNumber = props.phone || '';

    const { post, processing, errors } = useForm({
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('auth.phone.verify'));
    };

    const handleResendOtp = () => {
        post(route('auth.phone.resend-otp'));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <GuestLayout>
            <Head title={props.isRegistration ? 'Verify Phone' : 'Verify Login'} />

            <div className="mb-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                    {props.isRegistration ? 'Verify Your Phone Number' : 'Enter Verification Code'}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                    {props.isRegistration
                        ? `We've sent a 6-digit verification code to ${phoneNumber}.`
                        : `Enter the 6-digit code sent to ${phoneNumber}.`}
                </p>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="otp" value="Verification Code" />

                    <OtpInput
                        id="otp"
                        value={otp}
                        onChange={setOtp}
                        length={6}
                        error={errors.code}
                        className="mt-4"
                    />

                    <InputError message={errors.code} className="mt-2" />
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full" disabled={processing || otp.length !== 6}>
                        Verify
                    </PrimaryButton>
                </div>

                <div className="mt-4 text-center">
                    {timeLeft > 0 ? (
                        <p className="text-sm text-gray-600">
                            Resend code in {formatTime(timeLeft)}
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={processing}
                        >
                            Resend Code
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href={route('login')}
                    className="text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Back to Login
                </Link>
            </div>
        </GuestLayout>
    );
}
