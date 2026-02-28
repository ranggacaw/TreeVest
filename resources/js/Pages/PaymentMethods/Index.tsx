import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

interface PaymentMethod {
    id: number;
    type: string;
    last4: string;
    brand: string;
    exp_month: string;
    exp_year: string;
    is_default: boolean;
    created_at: string;
}

interface PageProps {
    paymentMethods: PaymentMethod[];
}

interface AddPaymentMethodModalProps {
    show: boolean;
    onClose: () => void;
}

function AddPaymentMethodModal({ show, onClose }: AddPaymentMethodModalProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setProcessing(false);
            return;
        }

        const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (stripeError) {
            setError(stripeError.message ?? 'An error occurred');
            setProcessing(false);
        } else if (paymentMethod) {
            router.post('/payment-methods', {
                stripe_payment_method_id: paymentMethod.id,
            }, {
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                    cardElement.clear();
                },
                onError: (errors) => {
                    setError(errors.message ?? 'Failed to add payment method');
                    setProcessing(false);
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Add Payment Method</h2>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
                            Card Details
                        </label>
                        <div className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
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

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !stripe}
                            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Adding...' : 'Add Payment Method'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default function Index({ paymentMethods }: PageProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            router.delete(`/payment-methods/${id}`, {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleSetDefault = (id: number) => {
        router.patch(`/payment-methods/${id}/set-default`, {}, {
            onSuccess: () => {
                router.reload();
            },
        });
    };

    return (
        <>
            <Head title="Payment Methods" />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Payment Methods
                            </h2>
                        </div>
                        <div className="mt-4 flex md:ml-4 md:mt-0">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Add Payment Method
                            </button>
                        </div>
                    </div>

                    {paymentMethods.length === 0 ? (
                        <div className="mt-10 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by adding a payment method.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Add Payment Method
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {paymentMethods.map((pm) => (
                                <div key={pm.id} className="relative overflow-hidden rounded-lg bg-white shadow">
                                    {pm.is_default && (
                                        <div className="absolute right-0 top-0 rounded-bl-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                                            Default
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                <svg
                                                    className="h-6 w-6 text-gray-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {pm.brand}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    •••• •••• {pm.last4}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 text-sm text-gray-500">
                                            Expires {pm.exp_month}/{pm.exp_year}
                                        </div>

                                        <div className="mt-6 flex space-x-3">
                                            {!pm.is_default && (
                                                <button
                                                    onClick={() => handleSetDefault(pm.id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Set as Default
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(pm.id)}
                                                className="text-sm font-medium text-red-600 hover:text-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AddPaymentMethodModal show={showAddModal} onClose={() => setShowAddModal(false)} />
        </>
    );
}
