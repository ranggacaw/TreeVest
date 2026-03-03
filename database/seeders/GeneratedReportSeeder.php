<?php

namespace Database\Seeders;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Models\GeneratedReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class GeneratedReportSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if reports already exist
        if (GeneratedReport::count() > 0) {
            $this->command->info('GeneratedReportSeeder: data already exists, skipping.');
            return;
        }

        $investors = User::where('role', 'investor')->get();

        foreach ($investors as $investor) {
            for ($i = 0; $i < 8; $i++) {
                $reportType = $this->getRandomReportType();
                $status = $this->getRandomReportStatus();

                GeneratedReport::create([
                    'user_id' => $investor->id,
                    'report_type' => $reportType,
                    'parameters' => $this->getReportParameters($reportType),
                    'status' => $status,
                    'file_path' => $status === GeneratedReportStatus::Completed ? $this->getFilePath($reportType, $investor) : null,
                    'failure_reason' => $status === GeneratedReportStatus::Failed ? $this->getFailureReason() : null,
                    'expires_at' => $status === GeneratedReportStatus::Completed ? now()->addDays(30) : null,
                    'created_at' => now()->subDays(rand(1, 180)),
                ]);
            }
        }

        $this->command->info('Generated reports seeded successfully!');
    }

    private function getRandomReportType(): ReportType
    {
        $types = [
            ['type' => ReportType::ProfitLoss, 'weight' => 60],
            ['type' => ReportType::TaxSummary, 'weight' => 40],
        ];

        $total = array_sum(array_column($types, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($types as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['type'];
            }
        }

        return ReportType::ProfitLoss;
    }

    private function getRandomReportStatus(): GeneratedReportStatus
    {
        $statuses = [
            ['status' => GeneratedReportStatus::Pending, 'weight' => 5],
            ['status' => GeneratedReportStatus::Generating, 'weight' => 5],
            ['status' => GeneratedReportStatus::Completed, 'weight' => 85],
            ['status' => GeneratedReportStatus::Failed, 'weight' => 5],
        ];

        $total = array_sum(array_column($statuses, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($statuses as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['status'];
            }
        }

        return GeneratedReportStatus::Completed;
    }

    private function getReportParameters(ReportType $type): array
    {
        return match ($type) {
            ReportType::ProfitLoss => [
                'start_date' => now()->subYear()->toDateString(),
                'end_date' => now()->toDateString(),
                'include_historical' => true,
                'currency' => 'IDR',
            ],
            ReportType::TaxSummary => [
                'tax_year' => strval(now()->year - 1),
                'country' => 'Indonesia',
                'currency' => 'IDR',
                'include_detailed' => true,
            ],
        };
    }

    private function getFilePath(ReportType $type, User $investor): string
    {
        $filename = match ($type) {
            ReportType::ProfitLoss => "pnl_{$investor->id}_" . now()->format('Y-m-d') . '.pdf',
            ReportType::TaxSummary => "tax_summary_{$investor->id}_" . now()->format('Y') . '.pdf',
        };

        return "reports/{$investor->id}/{$filename}";
    }

    private function getFailureReason(): string
    {
        $reasons = [
            'PDF generation service unavailable',
            'Report generation timeout',
            'Invalid report parameters',
            'Database connection error',
            'Insufficient data for report',
        ];

        return $reasons[array_rand($reasons)];
    }
}
