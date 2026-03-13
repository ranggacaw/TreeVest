import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { IconArrowLeft, IconDollar } from '@/Components/Icons/AppIcons';
import { formatRupiah } from '@/utils/currency';

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

export default function TopUp({ auth, investment, payment_methods, unread_notifications_count }: Props) {
    const minTopUp = 100; // 1 Rp (just using logic from original file, though unlikely 1Rp)
    const maxTopUp = Math.max(0, investment.tree.max_investment_cents - investment.amount_cents);

    const { data, setData, post, processing, errors } = useForm({
        top_up_cents: '' as string | number,
        payment_method_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ensure top_up_cents is sent as number if possible, or string. 
        // Inertia will send what's in data.
        post(route('investments.top-up', investment.id));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) {
            setData('top_up_cents', '');
            return;
        }
        // Input is in Rupiah units (not cents), so multiply by 100 for cents
        // But storing as string in state to allow user typing
        setData('top_up_cents', val); 
    };

    // Helper to get cents value for submission
    // Note: The original file was doing: 
    // value={data.top_up_cents / 100}
    // onChange={(e) => setData('top_up_cents', Math.round(parseFloat(e.target.value) * 100))}
    // This implies data.top_up_cents in the form state holds the CENTS value.
    
    // Let's stick to the original logic: data.top_up_cents stores CENTS.
    // The input displays UNITS (Rp).

    return (
        <AppShellLayout>
            <Head title="Top Up Investment" />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unread_notifications_count} />

                    {/* Back Navigation */}
                    <div className="bg-white px-6 pt-4 pb-2">
                        <Link href={route('investments.show', investment.id)} className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                            <IconArrowLeft className="w-4 h-4 mr-1" />
                            Back to Investment
                        </Link>
                    </div>

                    <div className="bg-white px-6 pb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <IconDollar className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Top Up Investment</h2>
                                <p className="text-sm text-gray-500">#{investment.tree.identifier}</p>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-emerald-800">Current Investment</span>
                                <span className="font-bold text-emerald-800">{investment.formatted_amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600">Max Available Top Up</span>
                                <span className="font-bold text-emerald-600">{formatRupiah(maxTopUp)}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="amount" value="Top Up Amount (Rp)" className="mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">Rp</span>
                                    </div>
                                    <TextInput
                                        id="amount"
                                        type="number"
                                        step="1" // Assuming whole Rupiah usually
                                        min={minTopUp / 100}
                                        max={maxTopUp / 100}
                                        className="pl-10 block w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                        value={data.top_up_cents ? Number(data.top_up_cents) / 100 : ''}
                                        onChange={(e) => setData('top_up_cents', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : '')}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <InputError message={errors.top_up_cents} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="payment_method" value="Payment Method" className="mb-2" />
                                <select
                                    id="payment_method"
                                    className="block w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm py-3"
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
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        Please add a payment method in your settings first.
                                    </p>
                                )}
                                <InputError message={errors.payment_method_id} className="mt-2" />
                            </div>

                            <div className="pt-4">
                                <PrimaryButton 
                                    className="w-full justify-center py-3 rounded-xl text-base"
                                    disabled={processing || payment_methods.length === 0 || maxTopUp <= 0}
                                >
                                    {processing ? 'Processing...' : 'Confirm Top Up'}
                                </PrimaryButton>
                                <Link
                                    href={route('investments.show', investment.id)}
                                    className="mt-4 block text-center text-sm font-medium text-gray-500 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <BottomNav activeTab="portfolio" />
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </AppShellLayout>
    );
}
