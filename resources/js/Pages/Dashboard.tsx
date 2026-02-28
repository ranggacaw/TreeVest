import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { KycStatus, PageProps, User } from '@/types';

interface Props extends PageProps {
    auth: {
        user: User & { kyc_status: KycStatus };
    };
}

export default function Dashboard({ auth }: Props) {
    const needsKyc = auth.user.kyc_status !== 'verified';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            {needsKyc && (
                <div className="py-6">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-sm font-medium text-amber-800">
                                        Complete Your Verification
                                    </h3>
                                    <div className="mt-2 text-sm text-amber-700">
                                        <p>
                                            To invest in fruit trees, you need to complete our KYC (Know Your Customer) verification process.
                                            This is required for regulatory compliance and to protect all investors.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <a
                                            href="/profile/kyc"
                                            className="inline-flex items-center px-4 py-2 bg-amber-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                        >
                                            Verify Now
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in!
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
