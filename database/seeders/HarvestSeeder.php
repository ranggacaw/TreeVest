<?php

namespace Database\Seeders;

use App\Enums\HarvestStatus;
use App\Enums\QualityGrade;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\Harvest;
use App\Models\MarketPrice;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Database\Seeder;

class HarvestSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if harvest records already exist
        if (Harvest::count() > 0) {
            $this->command->info('HarvestSeeder: data already exists, skipping.');
            return;
        }

        $admin = User::where('email', 'admin@treevest.com')->first();
        $fruitCrops = FruitCrop::all();

        foreach ($fruitCrops as $crop) {
            $trees = Tree::where('fruit_crop_id', $crop->id)
                ->where('status', 'productive')
                ->get();

            foreach ($trees as $tree) {
                $status = $this->getRandomHarvestStatus();
                $scheduledDate = $this->getScheduledDate($status);

                $marketPrice = MarketPrice::where('fruit_type_id', $crop->fruit_type_id)
                    ->where('effective_date', '<=', $scheduledDate)
                    ->orderBy('effective_date', 'desc')
                    ->first();

                $estimatedYield = $this->getEstimatedYield($crop->variant);
                $actualYield = $status === HarvestStatus::Completed ? $estimatedYield * (rand(85, 115) / 100) : null;
                $qualityGrade = $status === HarvestStatus::Completed ? $this->getQualityGrade() : null;

                Harvest::create([
                    'tree_id' => $tree->id,
                    'fruit_crop_id' => $crop->id,
                    'scheduled_date' => $scheduledDate,
                    'status' => $status,
                    'estimated_yield_kg' => $estimatedYield,
                    'actual_yield_kg' => $actualYield,
                    'quality_grade' => $qualityGrade,
                    'market_price_id' => $marketPrice ? $marketPrice->id : null,
                    'platform_fee_rate' => rand(5, 10) / 100,
                    'notes' => $this->getHarvestNote($status, $crop->variant),
                    'confirmed_by' => $status !== HarvestStatus::Scheduled ? $admin->id : null,
                    'confirmed_at' => $status !== HarvestStatus::Scheduled ? now()->subDays(rand(1, 10)) : null,
                    'completed_at' => $status === HarvestStatus::Completed ? now()->subDays(rand(1, 5)) : null,
                    'failed_at' => $status === HarvestStatus::Failed ? now()->subDays(rand(1, 5)) : null,
                    'created_at' => $scheduledDate->subDays(rand(15, 30)),
                ]);
            }
        }

        $this->command->info('Harvests seeded successfully!');
    }

    private function getRandomHarvestStatus(): HarvestStatus
    {
        $statuses = [
            ['status' => HarvestStatus::Scheduled, 'weight' => 25],
            ['status' => HarvestStatus::InProgress, 'weight' => 15],
            ['status' => HarvestStatus::Completed, 'weight' => 55],
            ['status' => HarvestStatus::Failed, 'weight' => 5],
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

        return HarvestStatus::Completed;
    }

    private function getScheduledDate(HarvestStatus $status): \Carbon\Carbon
    {
        return match ($status) {
            HarvestStatus::Scheduled => now()->addDays(rand(10, 60)),
            HarvestStatus::InProgress => now()->subDays(rand(1, 7)),
            HarvestStatus::Completed => now()->subDays(rand(8, 180)),
            HarvestStatus::Failed => now()->subDays(rand(8, 180)),
        };
    }

    private function getEstimatedYield(string $variant): float
    {
        return match (true) {
            str_contains(strtolower($variant), 'durian') => rand(150, 250),
            str_contains(strtolower($variant), 'mango') => rand(70, 120),
            str_contains(strtolower($variant), 'grape') => rand(12, 20),
            str_contains(strtolower($variant), 'citrus') => rand(35, 65),
            default => rand(50, 100),
        };
    }

    private function getQualityGrade(): QualityGrade
    {
        $grades = [
            ['grade' => QualityGrade::A, 'weight' => 65],
            ['grade' => QualityGrade::B, 'weight' => 30],
            ['grade' => QualityGrade::C, 'weight' => 5],
        ];

        $total = array_sum(array_column($grades, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($grades as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['grade'];
            }
        }

        return QualityGrade::A;
    }

    private function getHarvestNote(HarvestStatus $status, string $variant): ?string
    {
        return match ($status) {
            HarvestStatus::Scheduled => "Harvest scheduled for {$variant}. Monitoring continues.",
            HarvestStatus::InProgress => "Harvest in progress for {$variant}. Weather conditions favorable.",
            HarvestStatus::Completed => "Harvest completed successfully for {$variant}. Quality meets expectations.",
            HarvestStatus::Failed => "Harvest failed for {$variant}. Adverse weather conditions. Will reschedule.",
        };
    }
}
