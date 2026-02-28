import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

interface PaymentFormProps {
    amount: number;
    currency?: string;
    type: 'investment_purchase' | 'payout' | 'refund' | 'top_up' | 'withdrawal';
    paymentMethodId?: number;
    relatedId?: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function PaymentForm({
    amount,
    currency = 'MYR',
    type,
    paymentMethodId,
    relatedId,
    onSuccess,
    onError,
}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            setError('Payment system not ready. Please refresh the page.');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/payment-intents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount * 100,
                    currency,
                    type,
                    payment_method_id: paymentMethodId,
                    related_id: relatedId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create payment intent');
            }

            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                throw new Error('Card element not found');
            }

            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                data.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (confirmError) {
                throw new Error(confirmError.message || 'Payment failed');
            }

            if (paymentIntent?.status === 'succeeded') {
                setCompleted(true);
                onSuccess?.();
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    if (completed) {
        return (
            <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            Payment Successful!
                        </h3>
                        <p className="mt-1 text-sm text-green-700">
                            Your payment of {currency} {(amount / 100).toFixed(2)} has been processed successfully.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <div>
                <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
                    Card Details
                </label>
                <div className="mt-1 block w-full rounded-md border border-gray-300 p-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <CardElement
                        id="card-element"
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-gray-50 p-4">
                <div className="flex items-center">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <span className="ml-2 text-sm text-gray-600">Secure payment</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                    Total: {currency} {(amount / 100).toFixed(2)}
                </div>
            </div>

            <button
                type="submit"
                disabled={processing || !stripe || !elements}
                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <span className="flex items-center justify-center">
                        <svg
                            className="mr-2 h-4 w-4 animate-spin"
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
                        Processing...
                    </span>
                ) : (
                    `Pay ${currency} ${(amount / 100).toFixed(2)}`
                )}
            </button>
        </form>
    );
}
