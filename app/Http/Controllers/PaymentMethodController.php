<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentMethodRequest;
use App\Models\PaymentMethod;
use App\Services\StripeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function __construct(
        private StripeService $stripeService,
    ) {}

    public function index()
    {
        $paymentMethods = auth()->user()->paymentMethods()->orderBy('is_default', 'desc')->latest()->get();

        return Inertia::render('PaymentMethods/Index', [
            'paymentMethods' => $paymentMethods->map(fn ($pm) => [
                'id' => $pm->id,
                'type' => $pm->type,
                'last4' => $pm->last4,
                'brand' => $pm->brand,
                'exp_month' => $pm->exp_month,
                'exp_year' => $pm->exp_year,
                'is_default' => $pm->is_default,
                'created_at' => $pm->created_at,
            ]),
        ]);
    }

    public function store(StorePaymentMethodRequest $request): RedirectResponse
    {
        $paymentMethod = $this->stripeService->createPaymentMethod(
            $request->stripe_payment_method_id,
            auth()->id(),
        );

        return redirect()->back()->with('success', __('investments.payment_method_added'));
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        Gate::forUser(auth()->user())->authorize('delete', $paymentMethod);

        $this->stripeService->detachPaymentMethod($paymentMethod->stripe_payment_method_id);
        $paymentMethod->delete();

        return redirect()->back()->with('success', __('investments.payment_method_deleted'));
    }

    public function setDefault(PaymentMethod $paymentMethod)
    {
        Gate::forUser(auth()->user())->authorize('update', $paymentMethod);

        $paymentMethod->update(['is_default' => true]);

        return redirect()->back()->with('success', __('investments.payment_method_default_updated'));
    }
}
