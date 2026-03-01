<?php

namespace App\Jobs;

use App\Models\AuditLog;
use App\Services\InvestmentService;
use App\Services\PaymentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessStripeWebhook implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [30, 60, 120];

    public function __construct(
        public string $eventId,
        public string $eventType,
        public array $eventData,
    ) {}

    public function handle(PaymentService $paymentService): void
    {
        $alreadyProcessed = AuditLog::where('event_data->stripe_event_id', $this->eventId)->exists();

        if ($alreadyProcessed) {
            Log::info("Webhook event {$this->eventId} already processed, skipping");

            return;
        }

        try {
            $investmentService = app(InvestmentService::class);
            $paymentService->setInvestmentService($investmentService);

            $paymentService->handleWebhookEvent($this->eventId, $this->eventType, $this->eventData);

            Log::info("Webhook event {$this->eventId} ({$this->eventType}) processed successfully");
        } catch (\Exception $e) {
            Log::error("Failed to process webhook event {$this->eventId}: {$e->getMessage()}", [
                'exception' => $e,
                'event_type' => $this->eventType,
            ]);

            throw $e;
        }
    }
}
