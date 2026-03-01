import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, InvestmentDetail } from '@/types';
import { useEffect, useState } from 'react';

interface Props extends PageProps {
    investment: InvestmentDetail;
}

export default function Confirmation({ auth, investment }: Props) {
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

    useEffect(() => {
        if (investment.status === 'active') {
            setPaymentStatus('completed');
        } else if (investment.status === 'pending_payment') {
            const interval = setInterval(() => {
                setPaymentStatus('processing');
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [investment.status]);

    const statusMessages = {
        pending: {
            title: 'Awaiting Payment',
            description: 'Please complete your payment to confirm your investment.',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        processing: {
            title: 'Processing Payment',
            description: 'We are processing your payment. This may take a moment.',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        completed: {
            title: 'Investment Confirmed!',
            description: 'Your investment has been successfully processed.',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        failed: {
            title: 'Payment Failed',
            description: 'There was an issue processing your payment. Please try again.',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    };

    const status = statusMessages[paymentStatus];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Investment Confirmation
                </h2>
            }
        >
            <Head title="Investment Confirmation" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className={`overflow-hidden bg-white shadow-sm sm:rounded-lg ${status.bgColor}`}>
                        <div className="p-8 text-center">
                            <div className="mb-4">
                                {paymentStatus === 'completed' ? (
                                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : paymentStatus === 'processing' ? (
                                    <svg className="mx-auto h-16 w-16 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            
                            <h3 className={`text-2xl font-bold mb-2 ${status.color}`}>
                                {status.title}
                            </h3>
                            <p className="text-gray-600 mb-8">
                                {status.description}
                            </p>

                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-4">Investment Details</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Investment ID</dt>
                                        <dd className="font-medium text-gray-900">#{investment.id}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Amount</dt>
                                        <dd className="font-medium text-gray-900">{investment.formatted_amount}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Tree</dt>
                                        <dd className="font-medium text-gray-900">#{investment.tree.identifier}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Fruit Type</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.fruit_crop.fruit_type}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Farm</dt>
                                        <dd className="font-medium text-gray-900">{investment.tree.farm.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Date</dt>
                                        <dd className="font-medium text-gray-900">
                                            {new Date(investment.purchase_date).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="flex gap-4 justify-center">
                                {paymentStatus === 'completed' ? (
                                    <>
                                        <Link
                                            href="/investments"
                                            className="px-6 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700"
                                        >
                                            View My Investments
                                        </Link>
                                        <Link
                                            href="/farms"
                                            className="px-6 py-2 border border-gray-300 rounded-md font-semibold text-sm text-gray-700 uppercase tracking-widest hover:bg-gray-50"
                                        >
                                            Continue Investing
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/payment-methods"
                                            className="px-6 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700"
                                        >
                                            Add Payment Method
                                        </Link>
                                        <Link
                                            href="/investments"
                                            className="px-6 py-2 border border-gray-300 rounded-md font-semibold text-sm text-gray-700 uppercase tracking-widest hover:bg-gray-50"
                                        >
                                            View All Investments
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
