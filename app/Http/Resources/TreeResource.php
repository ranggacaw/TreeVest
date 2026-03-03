<?php

namespace App\Http\Resources;

use App\Models\Tree;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TreeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Tree $this */
        return [
            'id' => $this->id,
            'identifier' => $this->tree_identifier,
            'price_cents' => $this->price_cents,
            'price_formatted' => $this->price_formatted,
            'expected_roi' => $this->expected_roi_percent,
            'expected_roi_formatted' => $this->expected_roi_formatted,
            'risk_rating' => $this->risk_rating->value,
            'age_years' => $this->age_years,
            'productive_lifespan_years' => $this->productive_lifespan_years,
            'status' => $this->status->value,
            'min_investment_cents' => $this->min_investment_cents,
            'max_investment_cents' => $this->max_investment_cents,
            'min_investment_formatted' => 'Rp ' . number_format($this->min_investment_cents / 100, 2),
            'max_investment_formatted' => 'Rp ' . number_format($this->max_investment_cents / 100, 2),
            'fruit_crop' => new FruitCropResource($this->whenLoaded('fruitCrop')),
            'fruit_type' => $this->whenLoaded('fruitType'),
        ];
    }

    /**
     * Basic tree data for investment lists
     */
    public static function basic($tree): array
    {
        if (!$tree) {
            return [];
        }

        return [
            'id' => $tree->id,
            'identifier' => $tree->tree_identifier,
            'price_formatted' => $tree->price_formatted,
            'expected_roi' => $tree->expected_roi_percent,
        ];
    }

    /**
     * Tree data for marketplace listings
     */
    public function marketplace(): array
    {
        return [
            'id' => $this->id,
            'identifier' => $this->tree_identifier,
            'price_cents' => $this->price_cents,
            'price_formatted' => $this->price_formatted,
            'expected_roi' => $this->expected_roi_percent,
            'expected_roi_formatted' => $this->expected_roi_formatted,
            'risk_rating' => $this->risk_rating->value,
            'min_investment_cents' => $this->min_investment_cents,
            'max_investment_cents' => $this->max_investment_cents,
            'fruit_crop' => [
                'variant' => $this->fruitCrop?->variant,
                'fruit_type' => $this->fruitCrop?->fruitType?->name,
            ],
            'farm' => [
                'name' => $this->fruitCrop?->farm?->name,
                'location' => $this->fruitCrop?->farm?->location,
            ],
        ];
    }

    /**
     * Tree data for purchase configuration
     */
    public function forPurchase(): array
    {
        return [
            'id' => $this->id,
            'identifier' => $this->tree_identifier,
            'price_cents' => $this->price_cents,
            'price_formatted' => $this->price_formatted,
            'expected_roi' => $this->expected_roi_percent,
            'expected_roi_formatted' => $this->expected_roi_formatted,
            'risk_rating' => $this->risk_rating->value,
            'min_investment_cents' => $this->min_investment_cents,
            'max_investment_cents' => $this->max_investment_cents,
            'min_investment_formatted' => 'Rp ' . number_format($this->min_investment_cents / 100, 2),
            'max_investment_formatted' => 'Rp ' . number_format($this->max_investment_cents / 100, 2),
            'fruit_crop' => [
                'variant' => $this->fruitCrop->variant,
                'fruit_type' => $this->fruitCrop->fruitType->name,
            ],
            'farm' => [
                'name' => $this->fruitCrop->farm->name,
                'location' => $this->fruitCrop->farm->location,
            ],
        ];
    }
}