<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Stripe\PaymentIntent;
use Stripe\PaymentMethod;
use Stripe\Stripe as StripeClient;

class StripeService
{
    public function __construct()
    {
        StripeClient::setApiKey(Config::get('services.stripe.secret'));
    }

    public function createPaymentIntent(int $amount, string $currency, array $metadata = []): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => $amount,
            'currency' => $currency,
            'metadata' => $metadata,
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);
    }

    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return PaymentIntent::retrieve($paymentIntentId);
    }

    public function createPaymentMethod(string $stripePaymentMethodId, int $userId): \App\Models\PaymentMethod
    {
        $stripePaymentMethod = $this->retrievePaymentMethod($stripePaymentMethodId);

        return \App\Models\PaymentMethod::create([
            'user_id' => $userId,
            'stripe_payment_method_id' => $stripePaymentMethodId,
            'type' => $stripePaymentMethod->type,
            'last4' => $stripePaymentMethod->card->last4 ?? null,
            'brand' => $stripePaymentMethod->card->brand ?? null,
            'exp_month' => $stripePaymentMethod->card->exp_month ?? null,
            'exp_year' => $stripePaymentMethod->card->exp_year ?? null,
        ]);
    }

    public function attachPaymentMethod(string $paymentMethodId, string $customerId): void
    {
        PaymentMethod::retrieve($paymentMethodId)->attach(['customer' => $customerId]);
    }

    public function detachPaymentMethod(string $paymentMethodId): void
    {
        PaymentMethod::retrieve($paymentMethodId)->detach();
    }

    public function retrievePaymentMethod(string $paymentMethodId): PaymentMethod
    {
        return PaymentMethod::retrieve($paymentMethodId);
    }
}
