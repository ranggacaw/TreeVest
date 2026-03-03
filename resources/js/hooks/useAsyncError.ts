import { useCallback, useState } from 'react';

interface AsyncError {
    message: string;
    code?: string;
    details?: Record<string, any>;
}

interface UseAsyncErrorReturn {
    error: AsyncError | null;
    setError: (error: AsyncError | null) => void;
    clearError: () => void;
    handleAsyncError: (error: any) => void;
}

/**
 * Hook for handling async errors in React components
 * Provides consistent error handling for API calls, payments, etc.
 */
export const useAsyncError = (): UseAsyncErrorReturn => {
    const [error, setError] = useState<AsyncError | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const handleAsyncError = useCallback((error: any) => {
        let processedError: AsyncError;

        if (error?.response?.data) {
            // Handle Laravel validation errors
            const responseData = error.response.data;
            
            if (responseData.errors) {
                // Laravel validation errors
                const firstErrorField = Object.keys(responseData.errors)[0];
                const firstError = responseData.errors[firstErrorField][0];
                
                processedError = {
                    message: firstError || 'Validation error occurred',
                    code: 'validation_error',
                    details: responseData.errors,
                };
            } else if (responseData.message) {
                // Laravel exception messages
                processedError = {
                    message: responseData.message,
                    code: responseData.code || 'server_error',
                    details: responseData,
                };
            } else {
                processedError = {
                    message: 'An unexpected server error occurred',
                    code: 'server_error',
                };
            }
        } else if (error?.message) {
            // Network or JavaScript errors
            processedError = {
                message: error.message,
                code: error.code || 'network_error',
            };
        } else if (typeof error === 'string') {
            // String errors
            processedError = {
                message: error,
                code: 'unknown_error',
            };
        } else {
            // Fallback for unknown error types
            processedError = {
                message: 'An unexpected error occurred',
                code: 'unknown_error',
                details: error,
            };
        }

        // Log error for debugging
        console.error('Async error handled:', {
            original: error,
            processed: processedError,
            timestamp: new Date().toISOString(),
        });

        setError(processedError);
    }, []);

    return {
        error,
        setError,
        clearError,
        handleAsyncError,
    };
};

/**
 * Hook specifically for handling payment-related errors
 * Provides user-friendly messages for common payment failures
 */
export const usePaymentError = (): UseAsyncErrorReturn & {
    getPaymentErrorMessage: (error: any) => string;
} => {
    const asyncError = useAsyncError();

    const getPaymentErrorMessage = useCallback((error: any): string => {
        // Map common payment error codes to user-friendly messages
        const errorCode = error?.code || error?.response?.data?.code;
        
        const paymentErrorMessages: Record<string, string> = {
            'card_declined': 'Your payment method was declined. Please try a different card.',
            'insufficient_funds': 'Insufficient funds available. Please check your account balance.',
            'invalid_cvc': 'Invalid security code. Please check your payment details.',
            'expired_card': 'Your payment method has expired. Please use a different card.',
            'processing_error': 'A processing error occurred. Please try again in a moment.',
            'payment_intent_authentication_failure': 'Payment authentication failed. Please verify your payment method.',
            'payment_method_unactivated': 'Your payment method needs to be activated. Please contact your bank.',
            'payment_configuration_error': 'Payment processing is temporarily unavailable. Please try again later.',
            'kyc_not_verified': 'Please complete identity verification before making investments.',
            'investment_limit_exceeded': 'Investment amount exceeds the maximum limit for this tree.',
            'tree_not_investable': 'This tree is not currently available for investment.',
        };

        return paymentErrorMessages[errorCode] || 
               error?.response?.data?.message || 
               error?.message || 
               'Payment processing failed. Please try again or contact support.';
    }, []);

    const handlePaymentError = useCallback((error: any) => {
        const friendlyMessage = getPaymentErrorMessage(error);
        
        asyncError.setError({
            message: friendlyMessage,
            code: error?.code || error?.response?.data?.code || 'payment_error',
            details: error,
        });
    }, [asyncError, getPaymentErrorMessage]);

    return {
        ...asyncError,
        handleAsyncError: handlePaymentError,
        getPaymentErrorMessage,
    };
};

export default useAsyncError;