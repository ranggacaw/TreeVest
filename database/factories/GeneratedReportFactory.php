<?php

namespace Database\Factories;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GeneratedReportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'report_type' => $this->faker->randomElement([ReportType::ProfitLoss, ReportType::TaxSummary]),
            'parameters' => null,
            'status' => GeneratedReportStatus::Pending,
            'file_path' => null,
            'failure_reason' => null,
            'expires_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => GeneratedReportStatus::Completed,
            'file_path' => 'reports/'.$this->faker->uuid().'.pdf',
            'expires_at' => now()->addDays(7),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => GeneratedReportStatus::Failed,
            'failure_reason' => $this->faker->sentence(),
        ]);
    }

    public function profitLoss(): static
    {
        return $this->state(fn (array $attributes) => [
            'report_type' => ReportType::ProfitLoss,
        ]);
    }

    public function taxSummary(): static
    {
        return $this->state(fn (array $attributes) => [
            'report_type' => ReportType::TaxSummary,
            'parameters' => ['year' => now()->year],
        ]);
    }
}
