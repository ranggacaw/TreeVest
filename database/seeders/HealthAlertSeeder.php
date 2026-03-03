<?php

namespace Database\Seeders;

use App\Enums\HealthAlertType;
use App\Enums\HealthSeverity;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\HealthAlert;
use App\Models\User;
use Illuminate\Database\Seeder;

class HealthAlertSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if health alerts already exist
        if (HealthAlert::count() > 0) {
            $this->command->info('HealthAlertSeeder: data already exists, skipping.');
            return;
        }

        $admin = User::where('email', 'admin@treevest.com')->first();
        $farmOwners = User::where('role', 'farm_owner')->get();
        $farms = Farm::all();

        foreach ($farms as $farm) {
            $crops = FruitCrop::where('farm_id', $farm->id)->get();

            foreach ($crops as $crop) {
                for ($i = 0; $i < 8; $i++) {
                    $alertType = $this->getRandomAlertType();
                    $severity = $this->getRandomSeverity();
                    $isResolved = rand(0, 100) > 40;

                    HealthAlert::create([
                        'farm_id' => $farm->id,
                        'fruit_crop_id' => $crop->id,
                        'created_by' => $alertType === HealthAlertType::MANUAL ? $admin->id : $farmOwners->random()->id,
                        'alert_type' => $alertType,
                        'severity' => $severity,
                        'title' => $this->getAlertTitle($alertType, $severity, $crop->variant),
                        'message' => $this->getAlertMessage($alertType, $severity, $crop->variant),
                        'resolved_at' => $isResolved ? now()->subDays(rand(1, 30)) : null,
                        'created_at' => now()->subDays(rand(1, 90)),
                    ]);
                }
            }
        }

        $this->command->info('Health alerts seeded successfully!');
    }

    private function getRandomAlertType(): HealthAlertType
    {
        $types = [
            ['type' => HealthAlertType::WEATHER, 'weight' => 40],
            ['type' => HealthAlertType::PEST, 'weight' => 25],
            ['type' => HealthAlertType::DISEASE, 'weight' => 15],
            ['type' => HealthAlertType::MANUAL, 'weight' => 20],
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

        return HealthAlertType::WEATHER;
    }

    private function getRandomSeverity(): HealthSeverity
    {
        $severities = [
            ['severity' => HealthSeverity::LOW, 'weight' => 40],
            ['severity' => HealthSeverity::MEDIUM, 'weight' => 30],
            ['severity' => HealthSeverity::HIGH, 'weight' => 20],
            ['severity' => HealthSeverity::CRITICAL, 'weight' => 10],
        ];

        $total = array_sum(array_column($severities, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($severities as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['severity'];
            }
        }

        return HealthSeverity::LOW;
    }

    private function getAlertTitle(HealthAlertType $type, HealthSeverity $severity, string $cropVariant): string
    {
        $severityPrefix = match ($severity) {
            HealthSeverity::LOW => 'Minor',
            HealthSeverity::MEDIUM => 'Moderate',
            HealthSeverity::HIGH => 'Significant',
            HealthSeverity::CRITICAL => 'Critical',
        };

        return match ($type) {
            HealthAlertType::WEATHER => "{$severityPrefix} Weather Alert - {$cropVariant}",
            HealthAlertType::PEST => "{$severityPrefix} Pest Alert - {$cropVariant}",
            HealthAlertType::DISEASE => "{$severityPrefix} Disease Alert - {$cropVariant}",
            HealthAlertType::MANUAL => "Farm Update - {$cropVariant}",
        };
    }

    private function getAlertMessage(HealthAlertType $type, HealthSeverity $severity, string $cropVariant): string
    {
        $severityDesc = match ($severity) {
            HealthSeverity::LOW => 'minimal impact expected',
            HealthSeverity::MEDIUM => 'moderate impact expected',
            HealthSeverity::HIGH => 'significant impact expected',
            HealthSeverity::CRITICAL => 'severe impact expected',
        };

        return match ($type) {
            HealthAlertType::WEATHER => "Weather conditions may affect {$cropVariant}. {$severityDesc}. Monitoring continues and protective measures are in place.",
            HealthAlertType::PEST => "Pest activity detected in {$cropVariant} crops. {$severityDesc}. Treatment protocols initiated. Close monitoring underway.",
            HealthAlertType::DISEASE => "Disease symptoms observed in {$cropVariant}. {$severityDesc}. Containment measures activated. Specialist assessment requested.",
            HealthAlertType::MANUAL => "Important update regarding {$cropVariant}. Please review current conditions. Additional information available on dashboard.",
        };
    }
}
