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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InvestmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected InvestmentService $investmentService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        // Optimized query with eager loading
        $investments = Investment::forUser($user->id)
            ->with(['tree:id,tree_identifier,price_idr,expected_roi_percent', 'transaction:id,status'])
            ->select(['id', 'amount_idr', 'currency', 'status', 'purchase_date', 'tree_id', 'transaction_id'])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalValue = $this->investmentService->getTotalInvestmentValue($user);

        return Inertia::render('Investments/Index', [
            'investments' => $investments->map(fn ($inv) => InvestmentResource::basic($inv)),
            'total_value_idr' => $totalValue,
            'total_value_formatted' => 'Rp '.number_format($totalValue, 0),
        ]);
    }

    public function show(int $investment)
    {
        // Find the investment and authorize access using policy
        $investment = Investment::with([
            'tree:id,tree_identifier,price_idr,expected_roi_percent,risk_rating,age_years,productive_lifespan_years,status,fruit_crop_id,lot_id,latitude,longitude,qr_code',
            'tree.fruitCrop:id,variant,harvest_cycle,farm_id,fruit_type_id',
            'tree.fruitCrop.farm:id,name,city,state,country',
            'tree.fruitCrop.fruitType:id,name',
            'tree.lot:id,name,status,total_trees,rack_id',
            'tree.lot.rack:id,name,description,warehouse_id',
            'tree.lot.rack.warehouse:id,name,description,farm_id',
            'lot:id,name,status,total_trees,rack_id,fruit_crop_id,current_price_per_tree_idr,base_price_per_tree_idr,monthly_increase_rate,cycle_started_at,cycle_months',
            'lot.fruitCrop:id,variant,harvest_cycle,farm_id,fruit_type_id',
            'lot.fruitCrop.farm:id,name,city,state,country',
            'lot.fruitCrop.fruitType:id,name',
            'lot.rack:id,name,description,warehouse_id',
            'lot.rack.warehouse:id,name,description,farm_id',
            'transaction:id,status,stripe_payment_intent_id',
            'payouts:id,investment_id,gross_amount_idr,platform_fee_idr,net_amount_idr,status,currency,completed_at,failed_at,failed_reason,harvest_id',
            'payouts.harvest:id,scheduled_date',
        ])
            ->findOrFail($investment);

        // Use policy for authorization instead of manual check
        $this->authorize('viewDetails', $investment);

        $tree = $investment->tree;
        $lot = $investment->lot;

        // Handle both tree-based and lot-based investments
        if ($tree && $tree->fruitCrop) {
            $fruitCrop = $tree->fruitCrop;
            $investmentType = 'tree';
        } elseif ($lot && $lot->fruitCrop) {
            $fruitCrop = $lot->fruitCrop;
            $investmentType = 'lot';
        } else {
            abort(404, 'Investment has incomplete or missing data');
        }

        // Get harvest data using Eloquent scopes
        $harvests = null;

        if ($tree) {
            $harvests = $tree->harvests();
        } elseif ($fruitCrop) {
            $harvests = $fruitCrop->harvests();
        }

        if (! $harvests) {
            $completedHarvests = [];
            $upcomingHarvests = [];
        } else {
            $completedHarvests = $harvests
                ->completed()
                ->select(['id', 'scheduled_date', 'estimated_yield_kg', 'actual_yield_kg', 'quality_grade', 'notes'])
                ->get()
                ->map(fn ($h) => [
                    'id' => $h->id,
                    'harvest_date' => $h->scheduled_date->format('d-m-Y. H:i'),
                    'estimated_yield_kg' => $h->estimated_yield_kg,
                    'actual_yield_kg' => $h->actual_yield_kg,
                    'quality_grade' => $h->quality_grade?->value ?? $h->quality_grade,
                    'notes' => $h->notes,
                ])
                ->toArray();

            $upcomingHarvests = $harvests
                ->upcoming()
                ->select(['id', 'scheduled_date', 'estimated_yield_kg'])
                ->orderBy('scheduled_date')
                ->get()
                ->map(fn ($h) => [
                    'id' => $h->id,
                    'harvest_date' => $h->scheduled_date->format('d-m-Y. H:i'),
                    'estimated_yield_kg' => $h->estimated_yield_kg,
                ])
                ->toArray();
        }

        // Build a flat, explicit data array to avoid cascading resource memory issues
        $investmentData = [
            'id' => $investment->id,
            'amount_idr' => $investment->amount_idr,
            'formatted_amount' => $investment->formatted_amount,
            'status' => $investment->status->value,
            'status_label' => $investment->status->getLabel(),
            'purchase_date' => $investment->purchase_date->format('d-m-Y. H:i'),
            'created_at' => $investment->created_at?->format('d-m-Y. H:i'),
            'currency' => $investment->currency,
            'current_value_idr' => $investment->amount_idr,
            'projected_return_idr' => $investmentType === 'tree' ? (int) ($investment->amount_idr * ($tree?->expected_roi_percent ?? 0) / 100) : 0,
            'investment_type' => $investmentType,
        ];

        if ($tree) {
            $investmentData['tree'] = [
                'id' => $tree->id,
                'identifier' => $tree->tree_identifier,
                'price_idr' => $tree->price_idr,
                'price_formatted' => $tree->price_formatted,
                'expected_roi' => $tree->expected_roi_percent,
                'risk_rating' => $tree->risk_rating?->value ?? $tree->risk_rating,
                'age_years' => $tree->age_years,
                'productive_lifespan_years' => $tree->productive_lifespan_years,
                'status' => $tree->status?->value ?? $tree->status,
                'latitude' => $tree->latitude,
                'longitude' => $tree->longitude,
                'qr_code' => $tree->qr_code,
            ];
        } elseif ($lot) {
            $investmentData['lot'] = [
                'id' => $lot->id,
                'name' => $lot->name,
                'total_trees' => $lot->total_trees,
                'current_price_per_tree_idr' => $lot->current_price_per_tree_idr,
                'current_price_formatted' => 'Rp '.number_format($lot->current_price_per_tree_idr, 0),
                'status' => $lot->status?->value ?? $lot->status,
                'cycle_started_at' => $lot->cycle_started_at?->format('d-m-Y. H:i'),
                'cycle_months' => $lot->cycle_months,
            ];
        }

        if ($fruitCrop) {
            $investmentData['fruit_crop'] = [
                'variant' => $fruitCrop->variant,
                'harvest_cycle' => $fruitCrop->harvest_cycle,
                'fruit_type' => [
                    'name' => $fruitCrop->fruitType?->name,
                ],
                'farm' => [
                    'id' => $fruitCrop->farm?->id,
                    'name' => $fruitCrop->farm?->name,
                    'location' => $fruitCrop->farm?->city
                        ? trim(($fruitCrop->farm->city ?? '').', '.($fruitCrop->farm->state ?? ''), ', ')
                        : null,
                    'city' => $fruitCrop->farm?->city,
                    'state' => $fruitCrop->farm?->state,
                    'country' => $fruitCrop->farm?->country,
                ],
            ];
        }

        $investmentData['transaction'] = $investment->transaction ? [
            'id' => $investment->transaction->id,
            'status' => $investment->transaction->status,
            'stripe_payment_intent_id' => $investment->transaction->stripe_payment_intent_id,
        ] : null;

        $investmentData['payouts'] = $investment->payouts->map(fn ($p) => [
            'id' => $p->id,
            'gross_amount_idr' => $p->gross_amount_idr,
            'gross_amount_formatted' => 'Rp '.number_format($p->gross_amount_idr, 0),
            'platform_fee_idr' => $p->platform_fee_idr,
            'platform_fee_formatted' => 'Rp '.number_format($p->platform_fee_idr, 0),
            'net_amount_idr' => $p->net_amount_idr,
            'net_amount_formatted' => 'Rp '.number_format($p->net_amount_idr, 0),
            'status' => $p->status?->value ?? $p->status,
            'status_label' => method_exists($p->status, 'getLabel') ? $p->status->getLabel() : (method_exists($p->status, 'label') ? $p->status->label() : ucfirst($p->status?->value ?? $p->status)),
            'currency' => $p->currency,
            'harvest' => $p->harvest ? [
                'id' => $p->harvest->id,
                'harvest_date' => $p->harvest->scheduled_date->format('d-m-Y. H:i'),
            ] : null,
            'completed_at' => $p->completed_at?->format('d-m-Y. H:i'),
            'failed_at' => $p->failed_at?->format('d-m-Y. H:i'),
            'failed_reason' => $p->failed_reason,
        ])->values()->toArray();

        $investmentData['harvests'] = [
            'completed' => $completedHarvests,
            'upcoming' => $upcomingHarvests,
        ];

        // Add location hierarchy data if lot relationship exists
        if ($lot) {
            $rack = $lot->rack;
            $warehouse = $rack?->warehouse;

            $investmentData['location_hierarchy'] = [
                'farm' => [
                    'id' => $fruitCrop?->farm?->id,
                    'name' => $fruitCrop?->farm?->name,
                    'city' => $fruitCrop?->farm?->city,
                    'state' => $fruitCrop?->farm?->state,
                    'country' => $fruitCrop?->farm?->country,
                ],
                'warehouse' => $warehouse ? [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'description' => $warehouse->description,
                ] : null,
                'rack' => $rack ? [
                    'id' => $rack->id,
                    'name' => $rack->name,
                    'description' => $rack->description,
                ] : null,
                'lot' => [
                    'id' => $lot->id,
                    'name' => $lot->name,
                    'status' => $lot->status?->value ?? $lot->status,
                    'total_trees' => $lot->total_trees,
                ],
            ];

            if ($tree) {
                $investmentData['location_hierarchy']['tree'] = [
                    'id' => $tree->id,
                    'identifier' => $tree->tree_identifier,
                    'latitude' => $tree->latitude,
                    'longitude' => $tree->longitude,
                    'qr_code' => $tree->qr_code,
                ];
            }

            $investmentData['location_hierarchy']['fruit_crop'] = [
                'id' => $fruitCrop?->id,
                'variant' => $fruitCrop?->variant,
                'fruit_type' => [
                    'id' => $fruitCrop?->fruitType?->id,
                    'name' => $fruitCrop?->fruitType?->name,
                ],
            ];
        }

        // Add growth timeline data (visible to investors)
        $growthTimeline = null;

        if ($tree) {
            $growthTimeline = $tree->visibleGrowthTimeline();
        } elseif ($lot) {
            $growthTimeline = $lot->visibleGrowthTimeline();
        }

        if ($growthTimeline) {
            $growthTimeline = $growthTimeline->with('recordedBy:id,name')->get();

            if ($growthTimeline->isNotEmpty()) {
                $investmentData['growth_timeline'] = $growthTimeline->map(fn ($entry) => [
                    'id' => $entry->id,
                    'milestone_type' => $entry->milestone_type->value,
                    'milestone_type_label' => $entry->milestone_type->label(),
                    'milestone_type_icon' => $entry->milestone_type->icon(),
                    'milestone_type_color' => $entry->milestone_type->color(),
                    'health_status' => $entry->health_status->value,
                    'health_status_label' => $entry->health_status->label(),
                    'health_status_icon' => $entry->health_status->icon(),
                    'health_status_color' => $entry->health_status->color(),
                    'title' => $entry->title,
                    'description' => $entry->description,
                    'photos' => $entry->getPhotoUrls(),
                    'height_cm' => $entry->tree_height_cm,
                    'trunk_diameter_cm' => $entry->trunk_diameter_cm,
                    'fruit_count' => $entry->estimated_fruit_count,
                    'recorded_at' => $entry->recorded_date,
                    'author' => $entry->recordedBy ? ['name' => $entry->recordedBy->name] : null,
                ])->toArray();
            }
        }

        return Inertia::render('Investments/Show', [
            'investment' => $investmentData,
        ]);
    }

    public function create(Request $request, int $treeId)
    {
        // Optimized query with specific select for form data
        $tree = Tree::with([
            'fruitCrop:id,variant,farm_id,fruit_type_id,harvest_cycle',
            'fruitCrop.farm:id,name,city,state',
            'fruitCrop.fruitType:id,name',
        ])
            ->select(['id', 'tree_identifier', 'price_idr', 'expected_roi_percent', 'risk_rating', 'min_investment_idr', 'max_investment_idr', 'fruit_crop_id', 'status', 'age_years', 'productive_lifespan_years'])
            ->findOrFail($treeId);

        if (! $tree->isInvestable()) {
            return redirect()->route('marketplace.trees')
                ->with('error', __('investments.tree_not_available'));
        }

        $user = $request->user();

        if (! $user->isKycValid()) {
            return redirect()->route('kyc.verify')
                ->with('warning', __('investments.kyc_required'));
        }

        // Use TreeResource for consistent data transformation
        $treeResource = new TreeResource($tree);
        $treeData = $treeResource->forPurchase();

        return Inertia::render('Investments/Purchase/Configure', [
            'tree' => $treeData,
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
            $investment = DB::transaction(function () use ($user, $tree, $request) {
                // Additional server-side validation for financial amounts
                $amountIdr = (int) $request->input('amount_idr');
                if ($amountIdr < $tree->min_investment_idr || $amountIdr > $tree->max_investment_idr) {
                    throw new \App\Exceptions\InvalidInvestmentAmountException(
                        $amountIdr,
                        $tree->min_investment_idr
                    );
                }

                return $this->investmentService->initiateInvestment(
                    $user,
                    $tree,
                    $amountIdr,
                    $request->input('payment_method_id')
                );
            });

            // Log successful investment initiation for audit trail
            Log::info('Investment initiated successfully', [
                'user_id' => $user->id,
                'investment_id' => $investment->id,
                'tree_id' => $tree->id,
                'amount_idr' => $request->input('amount_idr'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return redirect()->route('investments.confirmation', $investment->id)
                ->with('success', __('investments.purchase_success'));
        } catch (\App\Exceptions\KycNotVerifiedException $e) {
            Log::warning('Investment attempt with unverified KYC', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'ip_address' => $request->ip(),
            ]);

            return redirect()->route('kyc.verify')
                ->with('warning', __('investments.kyc_required'));
        } catch (\App\Exceptions\TreeNotInvestableException $e) {
            Log::warning('Investment attempt on non-investable tree', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', $e->getMessage());
        } catch (\App\Exceptions\PaymentConfigurationException $e) {
            Log::error('Payment configuration error during investment', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', $e->getMessage())->withInput();
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            Log::warning('Investment limit exceeded', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'amount_idr' => $request->input('amount_idr'),
                'error' => $e->getMessage(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', $e->getMessage())->withInput();
        } catch (\App\Exceptions\InvalidInvestmentAmountException $e) {
            Log::warning('Invalid investment amount', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'amount_idr' => $request->input('amount_idr'),
                'error' => $e->getMessage(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', $e->getMessage())->withInput();
        } catch (\Throwable $e) {
            Log::error('Unexpected error during investment creation', [
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', __('investments.purchase_failed'));
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
            'transaction:id,status,stripe_payment_intent_id,metadata',
        ])
            ->select(['id', 'user_id', 'amount_idr', 'currency', 'status', 'purchase_date', 'tree_id', 'transaction_id'])
            ->findOrFail($investment);

        // Use policy for authorization
        $this->authorize('view', $investment);

        // Use InvestmentResource for consistent data transformation
        $investmentResource = new InvestmentResource($investment);

        return Inertia::render('Investments/Purchase/Confirmation', [
            'investment' => $investmentResource->forConfirmation(),
            'is_local' => app()->environment('local'),
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
                'ip_address' => $request->ip(),
            ]);

            return redirect()->route('investments.index')
                ->with('success', 'Investment cancelled successfully.');
        } catch (\App\Exceptions\InvestmentNotCancellableException $e) {
            Log::warning('Investment cancellation attempt failed', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    public function topUpForm(Request $request, int $investment)
    {
        // Optimized query for top-up form data
        $investment = Investment::with([
            'tree:id,tree_identifier,max_investment_idr,fruit_crop_id',
            'tree.fruitCrop:id,variant',
        ])
            ->select(['id', 'user_id', 'amount_idr', 'currency', 'tree_id'])
            ->findOrFail($investment);

        // Use policy for authorization
        $this->authorize('topUp', $investment);

        $user = $request->user();

        // Use InvestmentResource for consistent transformation
        $investmentResource = new InvestmentResource($investment);

        return Inertia::render('Investments/TopUp', [
            'investment' => $investmentResource->forTopUp(),
            'payment_methods' => $user->paymentMethods->map(fn ($pm) => [
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
                    $request->input('top_up_idr'),
                    $request->input('payment_method_id')
                );
            });

            // Log successful top-up for audit trail
            Log::info('Investment topped up successfully', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'top_up_idr' => $request->input('top_up_idr'),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('success', 'Investment topped up successfully.');
        } catch (\App\Exceptions\PaymentConfigurationException $e) {
            Log::error('Payment configuration error during top-up', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'error' => $e->getMessage(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', $e->getMessage());
        } catch (\App\Exceptions\InvestmentLimitExceededException $e) {
            Log::warning('Investment limit exceeded during top-up', [
                'user_id' => $request->user()->id,
                'investment_id' => $investment->id,
                'top_up_idr' => $request->input('top_up_idr'),
                'error' => $e->getMessage(),
                'ip_address' => $request->ip(),
            ]);

            return back()->with('error', $e->getMessage());
        }
    }

    public function mockConfirm(int $investment)
    {
        if (! app()->environment('local')) {
            abort(403);
        }

        $investmentModel = Investment::with('transaction')->findOrFail($investment);
        $this->authorize('view', $investmentModel);

        if ($investmentModel->transaction) {
            $investmentModel->transaction->update(['status' => \App\Enums\TransactionStatus::Completed]);
        }

        $this->investmentService->confirmInvestment($investmentModel->id);

        return redirect()->route('investments.show', $investment)
            ->with('success', 'Development bypass: Investment confirmed.');
    }
}
