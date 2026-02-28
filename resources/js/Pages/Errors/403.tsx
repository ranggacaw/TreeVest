import { Head, Link } from '@inertiajs/react';

export default function Forbidden() {
    return (
        <>
            <Head title="Forbidden" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full px-6 text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-8">
                        You don't have permission to access this page. If you believe this is an error, please contact support.
                    </p>
                    
                    <div className="space-y-4">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full"
                        >
                            Return to Dashboard
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
