<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Transaction $this */
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'amount_idr' => $this->amount,
            'currency' => $this->currency,
            'type' => $this->type->value,
            'stripe_payment_intent_id' => $this->stripe_payment_intent_id,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'failed_at' => $this->failed_at?->toIso8601String(),
            'failure_reason' => $this->failure_reason,
            'client_secret' => $this->metadata['client_secret'] ?? null,
        ];
    }

    /**
     * Basic transaction data
     */
    public static function basic($transaction): array
    {
        if (! $transaction) {
            return [];
        }

        return [
            'id' => $transaction->id,
            'status' => $transaction->status->value,
            'stripe_payment_intent_id' => $transaction->stripe_payment_intent_id,
        ];
    }
}
