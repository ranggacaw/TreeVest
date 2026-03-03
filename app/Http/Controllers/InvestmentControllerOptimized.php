<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvestmentRequest;
use App\Http\Requests\UpdateInvestmentAmountRequest;
use App\Http\Resources\InvestmentResource;
use App\Http\Resources\TreeResource;
use App\Models\Investment;
use App\Models\Tree;
use App\Services\InvestmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvestmentController extends Controller
{
    public function __construct(
        protected InvestmentService $investmentService,
    ) {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        // Optimized query with eager loading
        $investments = Investment::forUser($user->id)
            ->with(['tree:id,tree_identifier,price_cents,expected_roi_percent', 'transaction:id,status'])
            ->select(['id', 'amount_cents', 'currency', 'status', 'purchase_date', 'tree_id', 'transaction_id'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        $totalValue = $this->investmentService->getTotalInvestmentValue($user);

        return Inertia::render('Investments/Index', [
            'investments' => $investments->map(fn($inv) => InvestmentResource::basic($inv)),
            'total_value_cents' => $totalValue,
            'total_value_formatted' => 'Rp ' . number_format($totalValue / 100, 2),
        ]);
    }

    public function show(int $investment)
    {
        // Optimized query with specific eager loading for detail view
        $investment = Investment::with([
            'tree:id,tree_identifier,price_cents,expected_roi_percent,risk_rating,age_years,productive_lifespan_years,status,fruit_crop_id',
            'tree.fruitCrop:id,variant,harvest_cycle,farm_id,fruit_type_id',
            'tree.fruitCrop.farm:id,name,city,state',
            'tree.fruitCrop.fruitType:id,name',
            'transaction:id,status,stripe_payment_intent_id',
            'payouts:id,investment_id,gross_amount_cents,platform_fee_cents,net_amount_cents,status,currency,completed_at,failed_at,failed_reason,harvest_id',
            'payouts.harvest:id,scheduled_date'
        ])
        ->findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        // Optimize harvest queries using database instead of collection filtering
        $completedHarvests = DB::table('harvests')
            ->where('tree_id', $investment->tree_id)
            ->whereNotNull('actual_yield_kg')
            ->where('scheduled_date', '<=', now()->toDateString())
            ->select(['id', 'scheduled_date as harvest_date', 'estimated_yield_kg', 'actual_yield_kg', 'quality_grade', 'notes'])
            ->get()
            ->map(function ($harvest) {
                return [
                    'id' => $harvest->id,
                    'harvest_date' => $harvest->harvest_date,
                    'estimated_yield_kg' => $harvest->estimated_yield_kg,
                    'actual_yield_kg' => $harvest->actual_yield_kg,
                    'quality_grade' => $harvest->quality_grade,
                    'notes' => $harvest->notes,
                ];
            })
            ->toArray();

        $upcomingHarvests = DB::table('harvests')
            ->where('tree_id', $investment->tree_id)
            ->where('scheduled_date', '>', now()->toDateString())
            ->select(['id', 'scheduled_date as harvest_date', 'estimated_yield_kg'])
            ->orderBy('scheduled_date')
            ->get()
            ->map(function ($harvest) {
                return [
                    'id' => $harvest->id,
                    'harvest_date' => $harvest->harvest_date,
                    'estimated_yield_kg' => $harvest->estimated_yield_kg,
                ];
            })
            ->toArray();

        // Use Resource with optimized data structure
        $investmentResource = new InvestmentResource($investment);
        $investmentData = $investmentResource->toArray(request());
        
        // Add harvest data
        $investmentData['harvests'] = [
            'completed' => $completedHarvests,
            'upcoming' => $upcomingHarvests,
        ];

        return Inertia::render('Investments/Show', [
            'investment' => $investmentData,
        ]);
    }

    public function create(Request $request, int $treeId)
    {
        // Optimized query for tree creation view
        $tree = Tree::with([
            'fruitCrop:id,variant,farm_id,fruit_type_id',
            'fruitCrop.farm:id,name,city,state,location',
            'fruitCrop.fruitType:id,name'
        ])
        ->select([
            'id', 'tree_identifier', 'price_cents', 'expected_roi_percent', 'risk_rating',
            'min_investment_cents', 'max_investment_cents', 'status', 'fruit_crop_id'
        ])
        ->findOrFail($treeId);

        if (!$tree->isInvestable()) {
            return redirect()->route('marketplace.trees')
                ->with('error', 'This tree is not currently available for investment.');
        }

        $user = $request->user();

        if (!$user->isKycValid()) {
            return redirect()->route('kyc.verify')
                ->with('warning', 'You must complete KYC verification before investing.');
        }

        // Optimized payment methods query
        $paymentMethods = $user->paymentMethods()
            ->select(['id', 'type', 'last4', 'brand', 'exp_month', 'exp_year'])
            ->get();

        return Inertia::render('Investments/Purchase/Configure', [
            'tree' => (new TreeResource($tree))->marketplace(),
            'user' => [
                'kyc_verified' => $user->isKycValid(),
            ],
            'payment_methods' => $paymentMethods->map(fn($pm) => [
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
        // Use select to only load necessary fields for validation
        $tree = Tree::select(['id', 'status', 'min_investment_cents', 'max_investment_cents', 'fruit_crop_id'])
            ->findOrFail($request->input('tree_id'));
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
        } catch (\App\Exceptions\PaymentConfigurationException $e) {
            return back()->with('error', $e->getMessage())->withInput();
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            return back()->with('error', $e->getMessage())->withInput();
        } catch (\App\Exceptions\InvalidInvestmentAmountException $e) {
            return back()->with('error', $e->getMessage())->withInput();
        }
    }

    public function confirmation(int $investment)
    {
        // Minimal data loading for confirmation page
        $investment = Investment::with([
            'tree:id,tree_identifier,fruit_crop_id',
            'tree.fruitCrop:id,variant,farm_id,fruit_type_id',
            'tree.fruitCrop.farm:id,name',
            'tree.fruitCrop.fruitType:id,name',
            'transaction:id,stripe_payment_intent_id,metadata'
        ])
        ->select(['id', 'amount_cents', 'currency', 'status', 'purchase_date', 'user_id', 'tree_id', 'transaction_id'])
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
                    'client_secret' => $investment->transaction->metadata['client_secret'] ?? null,
                ] : null,
            ],
        ]);
    }

    public function cancel(Request $request, int $investment)
    {
        $investment = Investment::select(['id', 'user_id', 'status', 'transaction_id'])
            ->findOrFail($investment);

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

    public function topUpForm(Request $request, int $investment)
    {
        $investment = Investment::with([
            'tree:id,tree_identifier,max_investment_cents'
        ])
        ->select(['id', 'amount_cents', 'currency', 'user_id', 'tree_id'])
        ->findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        $user = $request->user();
        $paymentMethods = $user->paymentMethods()
            ->select(['id', 'type', 'last4'])
            ->get();

        return Inertia::render('Investments/TopUp', [
            'investment' => [
                'id' => $investment->id,
                'amount_cents' => $investment->amount_cents,
                'formatted_amount' => $investment->formatted_amount,
                'tree' => [
                    'identifier' => $investment->tree->tree_identifier,
                    'max_investment_cents' => $investment->tree->max_investment_cents,
                ],
            ],
            'payment_methods' => $paymentMethods->map(fn($pm) => [
                'id' => $pm->id,
                'type' => $pm->type,
                'last4' => $pm->last4,
            ]),
        ]);
    }

    public function topUp(UpdateInvestmentAmountRequest $request, int $investment)
    {
        $investment = Investment::select(['id', 'user_id'])
            ->findOrFail($investment);

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
        } catch (\App\Exceptions\PaymentConfigurationException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}