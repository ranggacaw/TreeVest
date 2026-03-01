import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PhoneInput from '@/Components/Auth/PhoneInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function PhoneRegister() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        phone_country_code: 'MY',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('phone.register'), {
            onFinish: () => reset('name', 'phone'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register with Phone" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
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
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already have an account?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Send Verification Code
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
