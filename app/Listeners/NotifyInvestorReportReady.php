<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\ReportReady;
use App\Services\NotificationService;

class NotifyInvestorReportReady
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function handle(ReportReady $event): void
    {
        $report = $event->report;
        $user = $report->user;

        $title = $report->report_type->label().' Report Ready';
        $message = sprintf(
            'Your %s report is ready for download. It will be available for 7 days.',
            $report->report_type->label()
        );

        $this->notificationService->send(
            $user,
            NotificationType::Report,
            [
                'title' => $title,
                'message' => $message,
                'report_id' => $report->id,
                'report_type' => $report->report_type->value,
            ]
        );
    }
}
