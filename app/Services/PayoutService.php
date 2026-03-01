<?php

namespace App\Services;

use App\Enums\PayoutStatus;
use App\Models\Payout;
use App\Models\User;

class PayoutService
{
    public function transitionStatus(Payout $payout, PayoutStatus $to, array $metadata = []): Payout
    {
        if (! $payout->status->canTransitionTo($to)) {
            throw new \InvalidArgumentException(
                "Cannot transition payout from {$payout->status->value} to {$to->value}"
            );
        }

        $payout->status = $to;

        if ($to === PayoutStatus::Processing) {
            $payout->processing_started_at = now();
        } elseif ($to === PayoutStatus::Completed) {
            $payout->completed_at = now();
        } elseif ($to === PayoutStatus::Failed) {
            $payout->failed_at = now();
            $payout->failed_reason = $metadata['failed_reason'] ?? null;
        }

        if (isset($metadata['payout_method'])) {
            $payout->payout_method = $metadata['payout_method'];
        }

        if (isset($metadata['transaction_id'])) {
            $payout->transaction_id = $metadata['transaction_id'];
        }

        if (isset($metadata['notes'])) {
            $payout->notes = $metadata['notes'];
        }

        $payout->save();

        return $payout->fresh();
    }

    public function retryFailed(Payout $payout, User $admin): Payout
    {
        if ($payout->status !== PayoutStatus::Failed) {
            throw new \InvalidArgumentException('Can only retry failed payouts');
        }

        return $this->transitionStatus($payout, PayoutStatus::Pending);
    }
}
