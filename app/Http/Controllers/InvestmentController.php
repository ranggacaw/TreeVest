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
        // Optimized query with specific select for form data
        $tree = Tree::with([
            'fruitCrop:id,variant,farm_id,fruit_type_id',
            'fruitCrop.farm:id,name,city,state',
            'fruitCrop.fruitType:id,name'
        ])
        ->select(['id', 'tree_identifier', 'price_cents', 'expected_roi_percent', 'risk_rating', 'min_investment_cents', 'max_investment_cents', 'fruit_crop_id', 'status'])
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

        // Use TreeResource for consistent data transformation
        $treeResource = new TreeResource($tree);
        $treeData = $treeResource->forPurchase();

        return Inertia::render('Investments/Purchase/Configure', [
            'tree' => $treeData,
            'user' => [
                'kyc_verified' => $user->isKycValid(),
            ],
            'payment_methods' => $user->paymentMethods->map(fn($pm) => [
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
        // Optimized query with specific select for confirmation page
        $investment = Investment::with([
            'tree:id,tree_identifier,fruit_crop_id',
            'tree.fruitCrop:id,variant,farm_id,fruit_type_id',
            'tree.fruitCrop.farm:id,name',
            'tree.fruitCrop.fruitType:id,name',
            'transaction:id,status,stripe_payment_intent_id,metadata'
        ])
        ->select(['id', 'user_id', 'amount_cents', 'currency', 'status', 'purchase_date', 'tree_id', 'transaction_id'])
        ->findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        // Use InvestmentResource for consistent data transformation
        $investmentResource = new InvestmentResource($investment);

        return Inertia::render('Investments/Purchase/Confirmation', [
            'investment' => $investmentResource->forConfirmation(),
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

    public function topUpForm(Request $request, int $investment)
    {
        // Optimized query for top-up form data
        $investment = Investment::with([
            'tree:id,tree_identifier,max_investment_cents,fruit_crop_id',
            'tree.fruitCrop:id,variant'
        ])
        ->select(['id', 'user_id', 'amount_cents', 'currency', 'tree_id'])
        ->findOrFail($investment);

        if ($investment->user_id !== Auth::id()) {
            abort(403);
        }

        $user = $request->user();

        // Use InvestmentResource for consistent transformation
        $investmentResource = new InvestmentResource($investment);

        return Inertia::render('Investments/TopUp', [
            'investment' => $investmentResource->forTopUp(),
            'payment_methods' => $user->paymentMethods->map(fn($pm) => [
                'id' => $pm->id,
                'type' => $pm->type,
                'last4' => $pm->last4,
            ]),
        ]);
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
        } catch (\App\Exceptions\PaymentConfigurationException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
