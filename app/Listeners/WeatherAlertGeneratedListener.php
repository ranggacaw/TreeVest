<?php

namespace App\Listeners;

use App\Events\WeatherAlertGenerated;
use App\Services\NotificationService;
use App\Enums\NotificationType;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class WeatherAlertGeneratedListener implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function handle(WeatherAlertGenerated $event): void
    {
        $healthAlert = $event->healthAlert;
        
        // If alert is for a specific crop
        if ($healthAlert->fruit_crop_id) {
            $fruitCrop = $healthAlert->fruitCrop;
            $farm = $fruitCrop->farm;

            // Get all investors who have investments in this crop
            $investors = $fruitCrop->trees()
                ->join('investments', 'trees.id', '=', 'investments.tree_id')
                ->join('users', 'investments.investor_id', '=', 'users.id')
                ->where('investments.status', 'active')
                ->select('users.*')
                ->distinct()
                ->get();

            foreach ($investors as $investor) {
                $this->notificationService->send(
                    user: $investor,
                    type: NotificationType::Weather,
                    data: [
                        'title' => $healthAlert->title,
                        'message' => $healthAlert->message,
                        'health_alert_id' => $healthAlert->id,
                        'fruit_crop_id' => $fruitCrop->id,
                        'farm_id' => $farm->id,
                        'severity' => $healthAlert->severity->value,
                    ]
                );
            }
        }
        // If alert is farm-wide
        elseif ($healthAlert->farm_id) {
            $farm = $healthAlert->farm;

            // Get all investors who have investments in any crops on this farm
            $investors = \App\Models\User::whereHas('investments', function ($query) use ($farm) {
                $query->where('status', 'active')
                    ->whereHas('tree.fruitCrop', function ($q) use ($farm) {
                        $q->where('farm_id', $farm->id);
                    });
            })->get();

            foreach ($investors as $investor) {
                $this->notificationService->send(
                    user: $investor,
                    type: NotificationType::Weather,
                    data: [
                        'title' => $healthAlert->title,
                        'message' => $healthAlert->message,
                        'health_alert_id' => $healthAlert->id,
                        'farm_id' => $farm->id,
                        'severity' => $healthAlert->severity->value,
                    ]
                );
            }
        }
    }
}
