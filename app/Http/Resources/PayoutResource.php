<?php

namespace App\Http\Resources;

use App\Models\Payout;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Payout $this */
        return [
            'id' => $this->id,
            'gross_amount_cents' => $this->gross_amount_cents,
            'gross_amount_formatted' => $this->gross_amount_formatted,
            'platform_fee_cents' => $this->platform_fee_cents,
            'platform_fee_formatted' => $this->platform_fee_formatted,
            'net_amount_cents' => $this->net_amount_cents,
            'net_amount_formatted' => $this->net_amount_formatted,
            'status' => $this->status->value,
            'status_label' => $this->status->getLabel(),
            'currency' => $this->currency,
            'payout_method' => $this->payout_method?->value,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'failed_at' => $this->failed_at?->toIso8601String(),
            'failed_reason' => $this->failed_reason,
            'harvest' => $this->when($this->relationLoaded('harvest'), function () {
                return [
                    'id' => $this->harvest->id,
                    'harvest_date' => $this->harvest->scheduled_date->toDateString(),
                ];
            }),
        ];
    }
}