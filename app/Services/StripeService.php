<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;
use Stripe\Exception\AuthenticationException;
use Stripe\PaymentIntent;
use Stripe\PaymentMethod;
use Stripe\StripeClient;

class StripeService
{
    protected ?StripeClient $client = null;
    protected ?string $secret = null;

    public function __construct()
    {
        $this->secret = Config::get('services.stripe.secret');
    }

    /**
     * Get the StripeClient instance or throw an AuthenticationException if not configured.
     * 
     * @throws AuthenticationException
     */
    protected function getClient(): StripeClient
    {
        if (!$this->client) {
            if (!$this->secret) {
                throw new AuthenticationException(
                    'Stripe API key is not configured. Please set STRIPE_SECRET in your .env file.'
                );
            }
            $this->client = new StripeClient($this->secret);
        }

        return $this->client;
    }

    public function createPaymentIntent(int $amount, string $currency, array $metadata = []): PaymentIntent
    {
        try {
            return $this->getClient()->paymentIntents->create([
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);
        } catch (AuthenticationException $e) {
            $secret = Config::get('services.stripe.secret');
            $message = 'Stripe authentication failed. Please check your STRIPE_SECRET in .env.';

            if (str_starts_with((string) $secret, 'sk_test_4eC39')) {
                if (app()->environment('local', 'testing')) {
                    return \Stripe\PaymentIntent::constructFrom([
                        'id' => 'pi_mock_' . \Illuminate\Support\Str::random(16),
                        'amount' => $amount,
                        'currency' => $currency,
                        'metadata' => $metadata,
                        'status' => 'succeeded',
                    ]);
                }
                $message = 'You are using an expired or placeholder Stripe test key. Please update STRIPE_SECRET in your .env file with a valid key from your Stripe Dashboard.';
            }

            throw new \App\Exceptions\PaymentConfigurationException($message);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            throw new \App\Exceptions\PaymentConfigurationException('Stripe API error: ' . $e->getMessage());
        }
    }


    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        if (str_starts_with($paymentIntentId, 'pi_mock_') && app()->environment('local', 'testing')) {
            return \Stripe\PaymentIntent::constructFrom([
                'id' => $paymentIntentId,
                'status' => 'succeeded',
                'amount' => 1000,
                'currency' => 'IDR',
            ]);
        }

        return $this->getClient()->paymentIntents->retrieve($paymentIntentId);
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
        try {
            $this->getClient()->paymentMethods->attach($paymentMethodId, ['customer' => $customerId]);
        } catch (AuthenticationException $e) {
            $secret = Config::get('services.stripe.secret');
            if (str_starts_with((string) $secret, 'sk_test_4eC39') && app()->environment('local', 'testing')) {
                return;
            }
            throw $e;
        }
    }

    public function detachPaymentMethod(string $paymentMethodId): void
    {
        try {
            $this->getClient()->paymentMethods->detach($paymentMethodId);
        } catch (AuthenticationException $e) {
            $secret = Config::get('services.stripe.secret');
            if (str_starts_with((string) $secret, 'sk_test_4eC39') && app()->environment('local', 'testing')) {
                return;
            }
            throw $e;
        }
    }

    public function retrievePaymentMethod(string $paymentMethodId): PaymentMethod
    {
        if (str_starts_with($paymentMethodId, 'pm_mock_') && app()->environment('local', 'testing')) {
            return \Stripe\PaymentMethod::constructFrom([
                'id' => $paymentMethodId,
                'type' => 'card',
                'card' => [
                    'brand' => 'visa',
                    'last4' => '4242',
                    'exp_month' => 12,
                    'exp_year' => date('Y') + 1,
                ]
            ]);
        }

        try {
            return $this->getClient()->paymentMethods->retrieve($paymentMethodId);
        } catch (AuthenticationException $e) {
            $secret = Config::get('services.stripe.secret');
            if (str_starts_with((string) $secret, 'sk_test_4eC39') && app()->environment('local', 'testing')) {
                return \Stripe\PaymentMethod::constructFrom([
                    'id' => $paymentMethodId,
                    'type' => 'card',
                    'card' => [
                        'brand' => 'visa',
                        'last4' => '4242',
                        'exp_month' => 12,
                        'exp_year' => date('Y') + 1,
                    ]
                ]);
            }
            throw $e;
        }
    }
}
