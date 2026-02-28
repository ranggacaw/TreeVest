import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import PhoneInput from '@/Components/Auth/PhoneInput';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function PhoneLogin() {
    const [usePhone, setUsePhone] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        phone: '',
        phone_country_code: 'MY',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (usePhone) {
            post(route('auth.phone.login'), {
                onFinish: () => reset('phone'),
            });
        } else {
            post(route('login'), {
                onFinish: () => reset('password'),
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-4 flex justify-center gap-4">
                <button
                    type="button"
                    onClick={() => setUsePhone(false)}
                    className={`px-4 py-2 text-sm font-medium transition ${
                        !usePhone
                            ? 'border-b-2 border-indigo-500 text-indigo-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Email
                </button>
                <button
                    type="button"
                    onClick={() => setUsePhone(true)}
                    className={`px-4 py-2 text-sm font-medium transition ${
                        usePhone
                            ? 'border-b-2 border-indigo-500 text-indigo-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Phone
                </button>
            </div>

            <form onSubmit={submit}>
                {!usePhone ? (
                    <>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>
                    </>
                ) : (
                    <div>
                        <PhoneInput
                            id="phone"
                            label="Phone Number"
                            value={data.phone}
                            onChange={(value) => {
                                setData('phone', value || '');
                            }}
                            error={errors.phone}
                            required
                        />
                        <p className="mt-2 text-sm text-gray-600">
                            We'll send you a verification code via SMS.
                        </p>
                    </div>
                )}

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {usePhone ? (
                        <Link
                            href={route('register')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Don't have an account?
                        </Link>
                    ) : (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        {usePhone ? 'Send Code' : 'Log in'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
