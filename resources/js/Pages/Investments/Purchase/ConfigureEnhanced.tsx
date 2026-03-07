import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps, Tree, PaymentMethod } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FinancialErrorBoundary from '@/Components/FinancialErrorBoundary';
import { usePaymentError } from '@/hooks/useAsyncError';
import { useTranslation } from 'react-i18next';

interface Props extends PageProps {
    tree: Tree;
    user: {
        kyc_verified: boolean;
    };
    payment_methods: PaymentMethod[];
}

export default function Configure({ auth, tree, user, payment_methods }: Props) {
    const [selectedAmount, setSelectedAmount] = useState(tree.min_investment_cents);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(
        payment_methods.length > 0 ? payment_methods[0].id : null
    );

    const { error, clearError, handleAsyncError } = usePaymentError();
    const [isProcessing, setIsProcessing] = useState(false);
    const { t } = useTranslation('investments');

    const { data, setData, post, processing, errors: formErrors } = useForm({
        tree_id: tree.id,
        amount_cents: selectedAmount,
        payment_method_id: selectedPaymentMethod,
    });

    const handleAmountChange = (amount: number) => {
        setSelectedAmount(amount);
        setData('amount_cents', amount);
        clearError(); // Clear any previous amount-related errors
    };

    const handlePaymentMethodChange = (methodId: number) => {
        setSelectedPaymentMethod(methodId);
        setData('payment_method_id', methodId);
        clearError(); // Clear any previous payment method errors
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.kyc_verified) {
            handleAsyncError({
                code: 'kyc_not_verified',
                message: t('kyc_not_verified'),
            });
            return;
        }

        if (selectedAmount < tree.min_investment_cents || selectedAmount > tree.max_investment_cents) {
            handleAsyncError({
                code: 'investment_limit_exceeded',
                message: t('investment_limit_exceeded', { min: tree.min_investment_formatted, max: tree.max_investment_formatted }),
            });
            return;
        }

        if (!selectedPaymentMethod) {
            handleAsyncError({
                code: 'payment_method_required',
                message: t('payment_method_required'),
            });
            return;
        }

        setIsProcessing(true);
        clearError();

        try {
            post(route('investments.store'), {
                onSuccess: () => {
                    // Success will be handled by redirect
                    setIsProcessing(false);
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    // Handle validation errors or other server errors
                    handleAsyncError({
                        response: { data: { errors, message: t('validation_failed') } }
                    });
                },
            });
        } catch (err) {
            setIsProcessing(false);
            handleAsyncError(err);
        }
    };

    const formatCurrency = (cents: number): string => {
        return 'Rp ' + (cents / 100).toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const projectedReturn = (selectedAmount * (tree.expected_roi || 0)) / 100;

    return (
        <FinancialErrorBoundary>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {t('configure_investment')}
                    </h2>
                }
            >
                <Head title={t('invest_in_tree', { identifier: tree.identifier })} />

                <div className="py-12">
                    <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                {/* Tree Information */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {tree.fruit_crop.fruit_type} - {tree.fruit_crop.variant}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {t('tree_id')}: {tree.identifier} • {tree.farm.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {t('expected_roi', { roi: '' }).replace('%', '').trim()}: {tree.expected_roi}% • {t('risk_rating')}: {tree.risk_rating}
                                    </p>
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-5 w-5 text-red-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">
                                                    {t('payment_error')}
                                                </h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <p>{error.message}</p>
                                                </div>
                                                <div className="mt-3">
                                                    <button
                                                        type="button"
                                                        className="text-sm text-red-600 hover:text-red-500 font-medium"
                                                        onClick={clearError}
                                                    >
                                                        {t('dismiss')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Investment Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('investment_amount')}
                                        </label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md">
                                                <span className="text-sm text-gray-600">{t('range_label')}</span>
                                                <span className="text-sm font-medium">
                                                    {tree.min_investment_formatted} - {tree.max_investment_formatted}
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                min={tree.min_investment_cents}
                                                max={tree.max_investment_cents}
                                                value={selectedAmount}
                                                onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                                placeholder={t('amount_in_cents_placeholder')}
                                            />
                                            <div className="text-sm text-gray-600">
                                                {t('amount_label_simple')} {formatCurrency(selectedAmount)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Projected Returns */}
                                    <div className="bg-green-50 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-green-800 mb-2">
                                            {t('projected_returns')}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-green-600">{t('expected_return')}</span>
                                                <div className="font-semibold text-green-800">
                                                    {formatCurrency(projectedReturn)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-green-600">{t('roi_label')}</span>
                                                <div className="font-semibold text-green-800">
                                                    {tree.expected_roi}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('payment_method_label')}
                                        </label>
                                        {payment_methods.length > 0 ? (
                                            <div className="space-y-2">
                                                {payment_methods.map((method) => (
                                                    <div
                                                        key={method.id}
                                                        className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedPaymentMethod === method.id
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        onClick={() => handlePaymentMethodChange(method.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-sm font-medium capitalize">
                                                                    {method.brand} {method.type}
                                                                </span>
                                                                <span className="text-sm text-gray-500 ml-2">
                                                                    •••• {method.last4}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {method.exp_month}/{method.exp_year}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                <p>{t('no_payment_methods')}</p>
                                                <a
                                                    href="/payment-methods"
                                                    className="text-green-600 hover:text-green-700 font-medium"
                                                >
                                                    {t('add_payment_method')}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={processing || isProcessing || !selectedPaymentMethod}
                                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing || isProcessing ? (
                                                <div className="flex items-center">
                                                    <svg
                                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    {t('processing_button')}
                                                </div>
                                            ) : (
                                                t('confirm_investment')
                                            )}
                                        </button>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="text-xs text-gray-500 pt-4 border-t">
                                        <p>
                                            {t('disclaimer_text')}{' '}
                                            <a href="/terms" className="text-green-600 hover:text-green-700">
                                                {t('terms_of_service')}
                                            </a>{' '}
                                            {t('and')}{' '}
                                            <a href="/risk-disclosure" className="text-green-600 hover:text-green-700">
                                                {t('risk_disclosure_link')}
                                            </a>
                                            .
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </FinancialErrorBoundary>
    );
}