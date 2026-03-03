import React from 'react';
import ErrorBoundary from './ErrorBoundary';

declare global {
    interface Window {
        Sentry?: any;
    }
}

interface Props {
    children: React.ReactNode;
    context?: string;
    onPaymentError?: (error: Error) => void;
}

const FinancialErrorBoundary: React.FC<Props> = ({ children, context = 'financial', onPaymentError }) => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        // Log financial errors with additional context
        const errorData = {
            message: error.message,
            stack: error.stack,
            component: 'financial-component',
            error_boundary: 'FinancialErrorBoundary',
            component_stack: errorInfo.componentStack,
            context: context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            user_agent: navigator.userAgent,
        };

        console.error('Financial operation error:', errorData);

        // Report to our Laravel API endpoint
        if (typeof window !== 'undefined') {
            fetch('/api/error/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(errorData),
            }).catch(reportError => {
                console.error('Failed to report error to server:', reportError);

                // Fallback to client-side reporting if available
                if (window.Sentry) {
                    window.Sentry.captureException(error, {
                        tags: {
                            errorBoundary: 'financial',
                            context: context,
                        },
                        contexts: {
                            react: {
                                componentStack: errorInfo.componentStack,
                            },
                        },
                    });
                }
            });
        }

        // Call custom payment error handler
        if (onPaymentError) {
            onPaymentError(error);
        }
    };

    const fallbackUI = (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-red-600">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Payment Error
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We encountered an error processing your payment. Your account has not been charged.
                    </p>

                    <div className="mt-6 space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Try Again
                        </button>

                        <a
                            href="/investments"
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Back to Portfolio
                        </a>

                        <a
                            href="/support"
                            className="text-sm text-green-600 hover:text-green-700"
                        >
                            Contact Support
                        </a>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-blue-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Your Information is Safe
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        No payment has been processed. Your payment information
                                        remains secure and private.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ErrorBoundary fallback={fallbackUI} onError={handleError}>
            {children}
        </ErrorBoundary>
    );
};

export default FinancialErrorBoundary;