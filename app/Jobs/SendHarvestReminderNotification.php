<?php

namespace App\Jobs;

use App\Models\Harvest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendHarvestReminderNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Harvest $harvest,
        public User $investor,
        public string $reminderType
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $daysUntil = $this->reminderType === '7day' ? 7 : 1;

        $notificationService->sendNotification(
            $this->investor,
            'harvest',
            [
                'title' => "Harvest in {$daysUntil} Days",
                'message' => "Your investment in {$this->harvest->tree->tree_identifier} has a harvest scheduled on {$this->harvest->scheduled_date->format('F j, Y')}.",
                'harvest_id' => $this->harvest->id,
                'tree_id' => $this->harvest->tree_id,
                'scheduled_date' => $this->harvest->scheduled_date->toDateString(),
                'reminder_type' => $this->reminderType,
            ]
        );
    }
}
