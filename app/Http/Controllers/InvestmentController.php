<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvestmentRequest;
use App\Http\Requests\UpdateInvestmentAmountRequest;
use App\Models\Investment;
use App\Models\Tree;
use App\Services\InvestmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InvestmentController extends Controller
{
    public function __construct(
        protected InvestmentService $investmentService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $investments = $this->investmentService->getUserInvestments($user);
        $totalValue = $this->investmentService->getTotalInvestmentValue($user);

        return Inertia::render('Investments/Index', [
            'investments' => $investments->map(fn ($inv) => [
                'id' => $inv->id,
                'amount_cents' => $inv->amount_cents,
                'formatted_amount' => $inv->formatted_amount,
                'status' => $inv->status->value,
                'purchase_date' => $inv->purchase_date->toIso8601String(),
                'tree' => [
                    'id' => $inv->tree->id,
                    'identifier' => $inv->tree->tree_identifier,
                    'price_formatted' => $inv->tree->price_formatted,
                    'expected_roi' => $inv->tree->expected_roi_percent,
                ],
            ]),
            'total_value_cents' => $totalValue,
            'total_value_formatted' => 'RM '.number_format($totalValue / 100, 2),
        ]);
    }

    public function show(int $investment)
    {
        $investment = Investment::with(['tree.fruitCrop.farm', 'tree.fruitCrop.fruitType', 'tree.harvests', 'transaction'])
            ->findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        $completedHarvests = $investment->tree->harvests
            ->whereNotNull('actual_yield_kg')
            ->where('harvest_date', '<=', now()->toDateString());

        $upcomingHarvests = $investment->tree->harvests
            ->where('harvest_date', '>', now()->toDateString())
            ->sortBy('harvest_date');

        return Inertia::render('Investments/Show', [
            'investment' => [
                'id' => $investment->id,
                'amount_cents' => $investment->amount_cents,
                'formatted_amount' => $investment->formatted_amount,
                'status' => $investment->status->value,
                'status_label' => $investment->status->getLabel(),
                'purchase_date' => $investment->purchase_date->toIso8601String(),
                'created_at' => $investment->created_at->toIso8601String(),
                'current_value_cents' => $investment->amount_cents,
                'projected_return_cents' => (int) ($investment->amount_cents * ($investment->tree->expected_roi_percent ?? 0) / 100),
                'tree' => [
                    'id' => $investment->tree->id,
                    'identifier' => $investment->tree->tree_identifier,
                    'price_cents' => $investment->tree->price_cents,
                    'price_formatted' => $investment->tree->price_formatted,
                    'expected_roi' => $investment->tree->expected_roi_percent,
                    'risk_rating' => $investment->tree->risk_rating->value,
                    'age_years' => $investment->tree->age_years,
                    'productive_lifespan_years' => $investment->tree->productive_lifespan_years,
                    'status' => $investment->tree->status->value,
                    'fruit_crop' => [
                        'variant' => $investment->tree->fruitCrop->variant,
                        'fruit_type' => $investment->tree->fruitCrop->fruitType->name,
                        'harvest_cycle' => $investment->tree->fruitCrop->harvest_cycle->value,
                    ],
                    'farm' => [
                        'name' => $investment->tree->fruitCrop->farm->name,
                        'location' => $investment->tree->fruitCrop->farm->city.', '.$investment->tree->fruitCrop->farm->state,
                    ],
                ],
                'harvests' => [
                    'completed' => $completedHarvests->map(fn ($h) => [
                        'id' => $h->id,
                        'harvest_date' => $h->harvest_date->toDateString(),
                        'estimated_yield_kg' => $h->estimated_yield_kg,
                        'actual_yield_kg' => $h->actual_yield_kg,
                        'quality_grade' => $h->quality_grade,
                        'notes' => $h->notes,
                    ])->toArray(),
                    'upcoming' => $upcomingHarvests->map(fn ($h) => [
                        'id' => $h->id,
                        'harvest_date' => $h->harvest_date->toDateString(),
                        'estimated_yield_kg' => $h->estimated_yield_kg,
                    ])->toArray(),
                ],
                'transaction' => $investment->transaction ? [
                    'id' => $investment->transaction->id,
                    'status' => $investment->transaction->status->value,
                    'stripe_payment_intent_id' => $investment->transaction->stripe_payment_intent_id,
                ] : null,
            ],
        ]);
    }

    public function create(Request $request, int $treeId)
    {
        $tree = Tree::with(['fruitCrop.farm', 'fruitCrop.fruitType'])->findOrFail($treeId);

        if (! $tree->isInvestable()) {
            return redirect()->route('marketplace.trees')
                ->with('error', 'This tree is not currently available for investment.');
        }

        $user = $request->user();

        if (! $user->isKycValid()) {
            return redirect()->route('kyc.verify')
                ->with('warning', 'You must complete KYC verification before investing.');
        }

        return Inertia::render('Investments/Purchase/Configure', [
            'tree' => [
                'id' => $tree->id,
                'identifier' => $tree->tree_identifier,
                'price_cents' => $tree->price_cents,
                'price_formatted' => $tree->price_formatted,
                'expected_roi' => $tree->expected_roi_percent,
                'expected_roi_formatted' => $tree->expected_roi_formatted,
                'risk_rating' => $tree->risk_rating->value,
                'min_investment_cents' => $tree->min_investment_cents,
                'max_investment_cents' => $tree->max_investment_cents,
                'min_investment_formatted' => 'RM '.number_format($tree->min_investment_cents / 100, 2),
                'max_investment_formatted' => 'RM '.number_format($tree->max_investment_cents / 100, 2),
                'fruit_crop' => [
                    'variant' => $tree->fruitCrop->variant,
                    'fruit_type' => $tree->fruitCrop->fruitType->name,
                ],
                'farm' => [
                    'name' => $tree->fruitCrop->farm->name,
                    'location' => $tree->fruitCrop->farm->location,
                ],
            ],
            'user' => [
                'kyc_verified' => $user->isKycValid(),
            ],
            'payment_methods' => $user->paymentMethods->map(fn ($pm) => [
                'id' => $pm->id,
                'type' => $pm->type,
                'last4' => $pm->last4,
                'brand' => $pm->brand,
                'exp_month' => $pm->exp_month,
                'exp_year' => $pm->exp_year,
            ]),
        ]);
    }

    public function store(StoreInvestmentRequest $request)
    {
        $tree = Tree::findOrFail($request->input('tree_id'));
        $user = $request->user();

        try {
            $investment = $this->investmentService->initiateInvestment(
                $user,
                $tree,
                $request->input('amount_cents'),
                $request->input('payment_method_id')
            );

            return redirect()->route('investments.confirmation', $investment->id)
                ->with('success', 'Investment initiated successfully. Please complete payment.');
        } catch (\App\Exceptions\KycNotVerifiedException $e) {
            return redirect()->route('kyc.verify')
                ->with('warning', 'You must complete KYC verification before investing.');
        } catch (\App\Exceptions\TreeNotInvestableException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            return back()->with('error', $e->getMessage())->withInput();
        } catch (\App\Exceptions\InvalidInvestmentAmountException $e) {
            return back()->with('error', $e->getMessage())->withInput();
        }
    }

    public function confirmation(int $investment)
    {
        $investment = Investment::with(['tree.fruitCrop.farm', 'transaction'])
            ->findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('Investments/Purchase/Confirmation', [
            'investment' => [
                'id' => $investment->id,
                'amount_cents' => $investment->amount_cents,
                'formatted_amount' => $investment->formatted_amount,
                'status' => $investment->status->value,
                'status_label' => $investment->status->getLabel(),
                'purchase_date' => $investment->purchase_date->toIso8601String(),
                'tree' => [
                    'id' => $investment->tree->id,
                    'identifier' => $investment->tree->tree_identifier,
                    'fruit_crop' => [
                        'variant' => $investment->tree->fruitCrop->variant,
                        'fruit_type' => $investment->tree->fruitCrop->fruitType->name,
                    ],
                    'farm' => [
                        'name' => $investment->tree->fruitCrop->farm->name,
                    ],
                ],
                'transaction' => $investment->transaction ? [
                    'id' => $investment->transaction->id,
                    'client_secret' => $investment->transaction->stripe_payment_intent_id
                        ? \App\Models\Transaction::where('stripe_payment_intent_id', $investment->transaction->stripe_payment_intent_id)->first()?->metadata['client_secret'] ?? null
                        : null,
                ] : null,
            ],
        ]);
    }

    public function cancel(Request $request, int $investment)
    {
        $investment = Investment::findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $this->investmentService->cancelInvestment(
                $investment->id,
                $request->input('reason', 'User cancelled')
            );

            return redirect()->route('investments.index')
                ->with('success', 'Investment cancelled successfully.');
        } catch (\App\Exceptions\InvestmentNotCancellableException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function topUp(UpdateInvestmentAmountRequest $request, int $investment)
    {
        $investment = Investment::findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $this->investmentService->topUpInvestment(
                $investment->id,
                $request->input('top_up_cents'),
                $request->input('payment_method_id')
            );

            return back()->with('success', 'Investment topped up successfully.');
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
