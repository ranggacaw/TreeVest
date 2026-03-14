<?php

namespace App\Http\Resources;

use App\Models\Investment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Investment $this */
        return [
            'id' => $this->id,
            'amount_idr' => $this->amount_idr,
            'formatted_amount' => $this->formatted_amount,
            'status' => $this->status->value,
            'status_label' => $this->status->getLabel(),
            'purchase_date' => $this->purchase_date->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'currency' => $this->currency,
            'tree' => new TreeResource($this->whenLoaded('tree')),
            'transaction' => new TransactionResource($this->whenLoaded('transaction')),
            'payouts' => PayoutResource::collection($this->whenLoaded('payouts')),
            'current_value_idr' => $this->amount_idr,
            'projected_return_idr' => (int) ($this->amount_idr * ($this->tree?->expected_roi_percent ?? 0) / 100),
        ];
    }

    /**
     * Basic investment data for lists
     */
    public static function basic($investment): array
    {
        return [
            'id' => $investment->id,
            'amount_idr' => $investment->amount_idr,
            'formatted_amount' => $investment->formatted_amount,
            'status' => $investment->status->value,
            'purchase_date' => $investment->purchase_date->toIso8601String(),
            'tree' => TreeResource::basic($investment->tree),
        ];
    }

    /**
     * Detailed investment data for show pages
     */
    public function detailed(): array
    {
        return array_merge($this->toArray(request()), [
            'harvests' => [
                'completed' => $this->getCompletedHarvests(),
                'upcoming' => $this->getUpcomingHarvests(),
            ],
            'payouts' => PayoutResource::collection($this->payouts),
        ]);
    }

    private function getCompletedHarvests(): array
    {
        if (! $this->relationLoaded('tree.harvests')) {
            return [];
        }

        return $this->tree->harvests
            ->filter(fn ($h) => $h->actual_yield_kg !== null && $h->scheduled_date <= now()->toDateString())
            ->map(fn ($h) => [
                'id' => $h->id,
                'harvest_date' => $h->scheduled_date->toDateString(),
                'estimated_yield_kg' => $h->estimated_yield_kg,
                'actual_yield_kg' => $h->actual_yield_kg,
                'quality_grade' => $h->quality_grade?->value,
                'notes' => $h->notes,
            ])
            ->values()
            ->toArray();
    }

    private function getUpcomingHarvests(): array
    {
        if (! $this->relationLoaded('tree.harvests')) {
            return [];
        }

        return $this->tree->harvests
            ->filter(fn ($h) => $h->scheduled_date > now()->toDateString())
            ->sortBy('scheduled_date')
            ->map(fn ($h) => [
                'id' => $h->id,
                'harvest_date' => $h->scheduled_date->toDateString(),
                'estimated_yield_kg' => $h->estimated_yield_kg,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Investment data for confirmation page
     */
    public function forConfirmation(): array
    {
        return [
            'id' => $this->id,
            'amount_idr' => $this->amount_idr,
            'formatted_amount' => $this->formatted_amount,
            'status' => $this->status->value,
            'status_label' => $this->status->getLabel(),
            'purchase_date' => $this->purchase_date->toIso8601String(),
            'tree' => [
                'id' => $this->tree->id,
                'identifier' => $this->tree->tree_identifier,
                'fruit_crop' => [
                    'variant' => $this->tree->fruitCrop->variant,
                    'fruit_type' => $this->tree->fruitCrop->fruitType->name,
                ],
                'farm' => [
                    'name' => $this->tree->fruitCrop->farm->name,
                ],
            ],
            'transaction' => $this->transaction ? [
                'id' => $this->transaction->id,
                'client_secret' => $this->transaction->metadata['client_secret'] ?? null,
            ] : null,
        ];
    }

    /**
     * Investment data for top-up form
     */
    public function forTopUp(): array
    {
        return [
            'id' => $this->id,
            'amount_idr' => $this->amount_idr,
            'formatted_amount' => $this->formatted_amount,
            'tree' => [
                'identifier' => $this->tree->tree_identifier,
                'max_investment_idr' => $this->tree->max_investment_idr,
            ],
        ];
    }
}
