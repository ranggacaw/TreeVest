import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface StripeProviderProps {
    children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
    const options: StripeElementsOptions = {
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#6366f1',
            },
        },
        fonts: [
            {
                family: 'ui-sans-serif',
                src: 'local',
                weight: '400',
            },
        ],
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
