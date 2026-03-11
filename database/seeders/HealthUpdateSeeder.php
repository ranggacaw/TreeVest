<?php

namespace Database\Seeders;

use App\Enums\HealthSeverity;
use App\Enums\HealthUpdateType;
use App\Models\FruitCrop;
use App\Models\TreeHealthUpdate;
use App\Models\User;
use Illuminate\Database\Seeder;

class HealthUpdateSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if health updates already exist
        if (TreeHealthUpdate::count() > 0) {
            $this->command->info('HealthUpdateSeeder: data already exists, skipping.');

            return;
        }

        $farmOwners = User::where('role', 'farm_owner')->get();
        $crops = FruitCrop::all();

        foreach ($crops as $crop) {
            for ($i = 0; $i < 15; $i++) {
                $updateType = $this->getRandomUpdateType();
                $severity = $this->getSeverityForType($updateType);

                TreeHealthUpdate::create([
                    'fruit_crop_id' => $crop->id,
                    'author_id' => $farmOwners->random()->id,
                    'severity' => $severity,
                    'update_type' => $updateType,
                    'title' => $this->getTitleForType($updateType, $crop->variant),
                    'description' => $this->getDescriptionForType($updateType, $crop->variant),
                    'photos' => $this->generateSamplePhotos($updateType),
                    'visibility' => rand(0, 100) > 20 ? 'investors_only' : 'public',
                    'created_at' => now()->subDays(rand(1, 90)),
                ]);
            }
        }

        $this->command->info('Health updates seeded successfully!');
    }

    private function getRandomUpdateType(): HealthUpdateType
    {
        $types = [
            ['type' => HealthUpdateType::ROUTINE, 'weight' => 60],
            ['type' => HealthUpdateType::PEST, 'weight' => 10],
            ['type' => HealthUpdateType::DISEASE, 'weight' => 5],
            ['type' => HealthUpdateType::DAMAGE, 'weight' => 5],
            ['type' => HealthUpdateType::WEATHER_IMPACT, 'weight' => 10],
            ['type' => HealthUpdateType::OTHER, 'weight' => 10],
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

        return HealthUpdateType::ROUTINE;
    }

    private function getSeverityForType(HealthUpdateType $type): HealthSeverity
    {
        return match ($type) {
            HealthUpdateType::ROUTINE => HealthSeverity::LOW,
            HealthUpdateType::PEST, HealthUpdateType::DISEASE => collect([HealthSeverity::MEDIUM, HealthSeverity::HIGH, HealthSeverity::CRITICAL])->random(),
            HealthUpdateType::DAMAGE, HealthUpdateType::WEATHER_IMPACT => collect([HealthSeverity::LOW, HealthSeverity::MEDIUM])->random(),
            HealthUpdateType::OTHER => HealthSeverity::LOW,
        };
    }

    private function getTitleForType(HealthUpdateType $type, string $cropVariant): string
    {
        return match ($type) {
            HealthUpdateType::ROUTINE => "Routine Health Check - {$cropVariant}",
            HealthUpdateType::PEST => "Pest Activity Detected - {$cropVariant}",
            HealthUpdateType::DISEASE => "Disease Alert - {$cropVariant}",
            HealthUpdateType::DAMAGE => "Physical Damage Report - {$cropVariant}",
            HealthUpdateType::WEATHER_IMPACT => "Weather Impact Assessment - {$cropVariant}",
            HealthUpdateType::OTHER => "Special Update - {$cropVariant}",
        };
    }

    private function getDescriptionForType(HealthUpdateType $type, string $cropVariant): string
    {
        return match ($type) {
            HealthUpdateType::ROUTINE => 'Regular health inspection completed. All trees showing normal growth patterns. Fruits developing well. No signs of stress or disease detected.',
            HealthUpdateType::PEST => 'Minor pest activity observed in sector B. Appropriate measures have been taken. Monitoring continues closely. Expected impact minimal.',
            HealthUpdateType::DISEASE => 'Early signs of leaf spot disease detected in a small area. Treatment initiated. Most trees remain healthy.',
            HealthUpdateType::DAMAGE => 'Some minor wind damage to branches after recent storm. Pruning and maintenance scheduled. No impact on fruit production.',
            HealthUpdateType::WEATHER_IMPACT => 'Recent heavy rains caused some soil saturation. Drainage improved. Trees recovering well. No long-term effects expected.',
            HealthUpdateType::OTHER => 'Special maintenance activity performed. Fertilizer application and soil treatment completed.',
        };
    }

    private function generateSamplePhotos(HealthUpdateType $type): array
    {
        if (rand(0, 100) > 70) {
            return [];
        }

        $basePaths = [
            'health-updates/routine-1.jpg',
            'health-updates/routine-2.jpg',
            'health-updates/pest-alert-1.jpg',
            'health-updates/disease-1.jpg',
            'health-updates/damage-1.jpg',
            'health-updates/weather-1.jpg',
        ];

        return collect($basePaths)->random(rand(0, 3))->toArray();
    }
}
