<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentIntentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
    ) {}

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'currency' => 'required|string|size:3',
            'type' => 'required|string|in:investment_purchase,payout,refund,top_up,withdrawal',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'related_id' => 'nullable|integer',
        ]);

        $transaction = $this->paymentService->initiatePayment(
            $request->user()->id,
            $request->amount,
            $request->currency,
            TransactionType::from($request->type),
            $request->payment_method_id,
            $request->related_id,
        );

        $paymentIntent = $this->paymentService->stripeService->retrievePaymentIntent(
            $transaction->stripe_payment_intent_id,
        );

        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
            'transaction_id' => $transaction->id,
        ]);
    }
}
