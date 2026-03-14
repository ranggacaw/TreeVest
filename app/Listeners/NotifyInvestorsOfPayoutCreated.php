<?php

namespace App\Listeners;

use App\Events\PayoutsCreated;
use App\Services\NotificationService;

class NotifyInvestorsOfPayoutCreated
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function handle(PayoutsCreated $event): void
    {
        foreach ($event->payouts as $payout) {
            $this->notificationService->sendNotification(
                $payout->investor,
                'payout',
                [
                    'title' => 'Payout Created',
                    'message' => "A payout of {$payout->net_amount_formatted} has been created from harvest on {$payout->harvest->scheduled_date->format('F j, Y')}.",
                    'payout_id' => $payout->id,
                    'harvest_id' => $payout->harvest_id,
                    'amount_idr' => $payout->net_amount_idr,
                ]
            );
        }
    }
}
