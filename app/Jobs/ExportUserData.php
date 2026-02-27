<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\GdprExportService;
use App\Notifications\UserDataExportReady;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class ExportUserData implements ShouldQueue
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
    public function handle(GdprExportService $exportService): void
    {
        $data = $exportService->exportUserData($this->userId);
        
        $filename = 'exports/user-' . $this->userId . '-' . now()->timestamp . '.json';
        
        Storage::put($filename, json_encode($data, JSON_PRETTY_PRINT));
        
        $user = User::find($this->userId);
        
        // Notify user (notification class to be created)
        // $user->notify(new UserDataExportReady($filename));
    }
}
