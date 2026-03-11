<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Services\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function __construct(
        private WishlistService $wishlistService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $items = $this->wishlistService->getForUser($user);

        $formatted = $items->map(function ($item) {
            $wishlistable = $item->wishlistable;
            $type = class_basename($item->wishlistable_type);

            $data = [
                'id' => $item->id,
                'type' => strtolower($type),
                'added_at' => $item->created_at->toIso8601String(),
                'entity' => null,
            ];

            if ($wishlistable) {
                if ($type === 'Tree') {
                    $data['entity'] = [
                        'id' => $wishlistable->id,
                        'identifier' => $wishlistable->tree_identifier,
                        'price_cents' => $wishlistable->price_cents,
                        'expected_roi_percent' => $wishlistable->expected_roi_percent,
                        'risk_rating' => $wishlistable->risk_rating?->value ?? $wishlistable->risk_rating,
                        'status' => $wishlistable->status?->value ?? $wishlistable->status,
                        'fruit_crop' => [
                            'variant' => $wishlistable->fruitCrop?->variant,
                            'fruit_type' => $wishlistable->fruitCrop?->fruitType?->name,
                            'harvest_cycle' => $wishlistable->fruitCrop?->harvest_cycle,
                        ],
                        'farm' => [
                            'id' => $wishlistable->fruitCrop?->farm?->id,
                            'name' => $wishlistable->fruitCrop?->farm?->name,
                        ],
                    ];
                } elseif ($type === 'Farm') {
                    $data['entity'] = [
                        'id' => $wishlistable->id,
                        'name' => $wishlistable->name,
                        'city' => $wishlistable->city,
                        'country' => $wishlistable->country,
                        'status' => $wishlistable->status?->value ?? $wishlistable->status,
                    ];
                } elseif ($type === 'FruitCrop') {
                    $data['entity'] = [
                        'id' => $wishlistable->id,
                        'variant' => $wishlistable->variant,
                        'fruit_type' => $wishlistable->fruitType?->name,
                        'harvest_cycle' => $wishlistable->harvest_cycle,
                        'farm' => [
                            'name' => $wishlistable->farm?->name,
                        ],
                    ];
                }
            }

            return $data;
        })->values();

        return Inertia::render('Investor/Wishlist', [
            'items' => $formatted,
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:tree,farm,fruitcrop'],
            'id' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $result = $this->wishlistService->toggle($user, $validated['type'], (int) $validated['id']);

        return response()->json($result);
    }
}
