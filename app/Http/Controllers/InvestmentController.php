<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvestmentRequest;
use App\Http\Requests\UpdateInvestmentAmountRequest;
use App\Http\Resources\InvestmentResource;
use App\Http\Resources\TreeResource;
use App\Models\Investment;
use App\Models\Tree;
use App\Services\InvestmentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InvestmentController extends Controller
{
    use AuthorizesRequests;
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
        // Find the investment and authorize access using policy
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

        // Use policy for authorization instead of manual check
        $this->authorize('viewDetails', $investment);

        // Get authorized harvest data using Eloquent relationships instead of raw queries
        $tree = $investment->tree;
        
        // Use Eloquent relationships with proper scopes for authorization
        $completedHarvests = $tree->harvests()
            ->completed()
            ->select(['id', 'scheduled_date', 'estimated_yield_kg', 'actual_yield_kg', 'quality_grade', 'notes'])
            ->get()
            ->map(function ($harvest) {
                return [
                    'id' => $harvest->id,
                    'harvest_date' => $harvest->scheduled_date,
                    'estimated_yield_kg' => $harvest->estimated_yield_kg,
                    'actual_yield_kg' => $harvest->actual_yield_kg,
                    'quality_grade' => $harvest->quality_grade,
                    'notes' => $harvest->notes,
                ];
            })
            ->toArray();

        $upcomingHarvests = $tree->harvests()
            ->upcoming()
            ->select(['id', 'scheduled_date', 'estimated_yield_kg'])
            ->orderBy('scheduled_date')
            ->get()
            ->map(function ($harvest) {
                return [
                    'id' => $harvest->id,
                    'harvest_date' => $harvest->scheduled_date,
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
            $investment = DB::transaction(function () use ($user, $tree, $request) {
                // Additional server-side validation for financial amounts
                $amountCents = (int) $request->input('amount_cents');
                if ($amountCents < $tree->min_investment_cents || $amountCents > $tree->max_investment_cents) {
                    throw new \App\Exceptions\InvalidInvestmentAmountException(
                        $amountCents, 
                        $tree->min_investment_cents
                    );
                }

                return $this->investmentService->initiateInvestment(
                    $user,
                    $tree,
                    $amountCents,
                    $request->input('payment_method_id')
                );
            });

            // Log successful investment initiation for audit trail
            Log::info('Investment initiated successfully', [
                'user_id' => $user->id,
                'investment_id' => $investment->id,
                'tree_id' => $tree->id,
                'amount_cents' => $request->input('amount_cents'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return redirect()->route('investments.confirmation', $investment->id)
                ->with('success', 'Investment initiated successfully. Please complete payment.');
        } catch (\App\Exceptions\KycNotVerifiedException $e) {
            Log::warning('Investment attempt with unverified KYC', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'ip_address' => $request->ip()
            ]);
            return redirect()->route('kyc.verify')
                ->with('warning', 'You must complete KYC verification before investing.');
        } catch (\App\Exceptions\TreeNotInvestableException $e) {
            Log::warning('Investment attempt on non-investable tree', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip()
            ]);
            return back()->with('error', $e->getMessage());
        } catch (\App\Exceptions\PaymentConfigurationException $e) {
            Log::error('Payment configuration error during investment', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip()
            ]);
            return back()->with('error', $e->getMessage())->withInput();
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            Log::warning('Investment limit exceeded', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'amount_cents' => $request->input('amount_cents'),
                'error' => $e->getMessage(),
                'ip_address' => $request->ip()
            ]);
            return back()->with('error', $e->getMessage())->withInput();
        } catch (\App\Exceptions\InvalidInvestmentAmountException $e) {
            Log::warning('Invalid investment amount', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'amount_cents' => $request->input('amount_cents'),
                'error' => $e->getMessage(),
                'ip_address' => $request->ip()
            ]);
            return back()->with('error', $e->getMessage())->withInput();
        } catch (\Throwable $e) {
            Log::error('Unexpected error during investment creation', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip_address' => $request->ip()
            ]);
            return back()->with('error', 'An unexpected error occurred. Please try again or contact support.');
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

        // Use policy for authorization
        $this->authorize('view', $investment);

        // Use InvestmentResource for consistent data transformation
        $investmentResource = new InvestmentResource($investment);

        return Inertia::render('Investments/Purchase/Confirmation', [
            'investment' => $investmentResource->forConfirmation(),
        ]);
    }

    public function cancel(Request $request, int $investment)
    {
        $investment = Investment::findOrFail($investment);

        // Use policy for authorization
        $this->authorize('delete', $investment);

        try {
            $this->investmentService->cancelInvestment(
                $investment->id,
                $request->input('reason', 'User cancelled')
            );

            // Log cancellation for audit trail
            Log::info('Investment cancelled', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'reason' => $request->input('reason', 'User cancelled'),
                'ip_address' => $request->ip()
            ]);

            return redirect()->route('investments.index')
                ->with('success', 'Investment cancelled successfully.');
        } catch (\App\Exceptions\InvestmentNotCancellableException $e) {
            Log::warning('Investment cancellation attempt failed', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip()
            ]);
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

        // Use policy for authorization
        $this->authorize('topUp', $investment);

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

        // Use policy for authorization
        $this->authorize('topUp', $investment);

        try {
            $result = DB::transaction(function () use ($investment, $request) {
                return $this->investmentService->topUpInvestment(
                    $investment->id,
                    $request->input('top_up_cents'),
                    $request->input('payment_method_id')
                );
            });

            // Log successful top-up for audit trail
            Log::info('Investment topped up successfully', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'top_up_cents' => $request->input('top_up_cents'),
                'ip_address' => $request->ip()
            ]);

            return back()->with('success', 'Investment topped up successfully.');
        } catch (\App\Exceptions\PaymentConfigurationException $e) {
            Log::error('Payment configuration error during top-up', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip()
            ]);
            return back()->with('error', $e->getMessage());
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            Log::warning('Investment limit exceeded during top-up', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'top_up_cents' => $request->input('top_up_cents'),
                'error' => $e->getMessage(),
                'ip_address' => $request->ip()
            ]);
            return back()->with('error', $e->getMessage());
        }
    }
}
