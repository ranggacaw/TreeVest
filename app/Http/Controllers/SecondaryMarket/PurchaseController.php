<?php

namespace App\Http\Controllers\SecondaryMarket;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseMarketListingRequest;
use App\Models\MarketListing;
use App\Services\SecondaryMarketService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function __construct(
        private SecondaryMarketService $service,
        private StripeService $stripeService
    ) {}

    public function store(MarketListing $listing, PurchaseMarketListingRequest $request)
    {
        try {
            $transaction = $this->service->initiatePurchase($listing, $request->user());

            $paymentIntent = $this->stripeService->createPaymentIntent(
                $listing->ask_price_cents,
                strtolower($listing->currency),
                [
                    'type' => 'secondary_purchase',
                    'listing_id' => $listing->id,
                    'investment_id' => $listing->investment_id,
                    'transaction_id' => $transaction->id,
                ]
            );

            $transaction->update([
                'stripe_payment_intent_id' => $paymentIntent->id,
            ]);

            return Inertia::render('SecondaryMarket/Purchase', [
                'listing' => $listing->load(['investment.tree.fruitCrop.farm', 'investment.tree.fruitType']),
                'paymentIntent' => [
                    'id' => $paymentIntent->id,
                    'amount' => $paymentIntent->amount,
                    'currency' => $paymentIntent->currency,
                    'client_secret' => $paymentIntent->client_secret,
                ],
                'transactionId' => $transaction->id,
            ]);
        } catch (\Exception $e) {
            return Redirect::back()->with('error', $e->getMessage());
        }
    }

    public function confirm(MarketListing $listing, Request $request)
    {
        $request->validate([
            'payment_intent_id' => ['required', 'string'],
            'transaction_id' => ['required', 'exists:transactions,id'],
        ]);

        try {
            $transaction = \App\Models\Transaction::findOrFail($request->transaction_id);

            if ($transaction->user_id !== $request->user()->id) {
                return Redirect::back()->with('error', 'Invalid transaction.');
            }

            $transfer = $this->service->confirmPurchase($listing, $transaction);

            return Redirect::route('investments.show', $listing->investment_id)
                ->with('success', 'Your purchase has been completed successfully!');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', $e->getMessage());
        }
    }
}
