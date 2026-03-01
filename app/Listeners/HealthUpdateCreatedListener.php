<?php

namespace App\Listeners;

use App\Events\HealthUpdateCreated;
use App\Services\NotificationService;
use App\Enums\NotificationType;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HealthUpdateCreatedListener implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function handle(HealthUpdateCreated $event): void
    {
        $healthUpdate = $event->healthUpdate;
        $fruitCrop = $healthUpdate->fruitCrop;
        $farm = $fruitCrop->farm;

        // Get all investors who have investments in this crop
        $investors = $fruitCrop->trees()
            ->join('investments', 'trees.id', '=', 'investments.tree_id')
            ->join('users', 'investments.investor_id', '=', 'users.id')
            ->where('investments.status', 'active')
            ->select('users.*')
            ->distinct()
            ->get();

        // Send notifications to all affected investors
        foreach ($investors as $investor) {
            $this->notificationService->send(
                user: $investor,
                type: NotificationType::Health,
                data: [
                    'title' => "Health Update: {$farm->name}",
                    'message' => "{$healthUpdate->title} - {$fruitCrop->fruit_type->name} ({$fruitCrop->variant})",
                    'health_update_id' => $healthUpdate->id,
                    'fruit_crop_id' => $fruitCrop->id,
                    'farm_id' => $farm->id,
                    'severity' => $healthUpdate->severity->value,
                    'update_type' => $healthUpdate->update_type->value,
                ]
            );
        }
    }
}
