import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface PaymentMethod {
    id: number;
    type: string;
    last4: string;
}

interface Props extends PageProps {
    investment: {
        id: number;
        amount_cents: number;
        formatted_amount: string;
        tree: {
            identifier: string;
            max_investment_cents: number;
        };
    };
    payment_methods: PaymentMethod[];
}

export default function TopUp({ auth, investment, payment_methods }: Props) {
    const minTopUp = 100; // 1 Rp
    const maxTopUp = investment.tree.max_investment_cents - investment.amount_cents;

    const { data, setData, post, processing, errors } = useForm({
        top_up_cents: minTopUp,
        payment_method_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/investments/${investment.id}/top-up`);
    };

    const formatCurrency = (cents: number) => {
        return 'Rp ' + (cents / 100).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Top Up Investment
                </h2>
            }
        >
            <Head title="Top Up Investment" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Top Up Investment #{investment.id}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Tree #{investment.tree.identifier} • Current Investment: {investment.formatted_amount}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="amount" value="Top Up Amount (Rp)" />
                                    <TextInput
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min={minTopUp / 100}
                                        max={maxTopUp / 100}
                                        className="mt-1 block w-full"
                                        value={data.top_up_cents / 100}
                                        onChange={(e) => setData('top_up_cents', Math.round(parseFloat(e.target.value) * 100))}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Max available top up: {formatCurrency(maxTopUp)}
                                    </p>
                                    <InputError message={errors.top_up_cents} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="payment_method" value="Payment Method" />
                                    <select
                                        id="payment_method"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.payment_method_id}
                                        onChange={(e) => setData('payment_method_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a payment method</option>
                                        {payment_methods.map((pm) => (
                                            <option key={pm.id} value={pm.id}>
                                                {pm.type.toUpperCase()} •••• {pm.last4}
                                            </option>
                                        ))}
                                    </select>
                                    {payment_methods.length === 0 && (
                                        <p className="mt-1 text-sm text-orange-600">
                                            Please add a payment method in your settings first.
                                        </p>
                                    )}
                                    <InputError message={errors.payment_method_id} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                                    <Link
                                        href={`/investments/${investment.id}`}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton disabled={processing || payment_methods.length === 0 || maxTopUp <= 0}>
                                        Confirm Top Up
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
