<?php

namespace App\Jobs;

use App\Services\GdprDeletionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DeleteUserData implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $userId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GdprDeletionService $deletionService): void
    {
        $deletionService->deleteUserData($this->userId);
    }
}
