<?php

namespace App\Console\Commands;

use App\Models\GeneratedReport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PurgeExpiredReports extends Command
{
    protected $signature = 'app:purge-expired-reports';

    protected $description = 'Purge expired generated reports and their files';

    public function handle(): int
    {
        $expiredReports = GeneratedReport::where('expires_at', '<', now())
            ->where('status', 'completed')
            ->get();

        $count = 0;

        foreach ($expiredReports as $report) {
            if ($report->file_path && Storage::exists($report->file_path)) {
                Storage::delete($report->file_path);
            }

            $report->delete();
            $count++;
        }

        $this->info("Purged {$count} expired reports.");

        return Command::SUCCESS;
    }
}
