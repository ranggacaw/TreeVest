<?php

namespace Database\Seeders;

use App\Enums\KycDocumentType;
use App\Enums\KycStatus;
use App\Models\KycDocument;
use App\Models\KycVerification;
use App\Models\User;
use Illuminate\Database\Seeder;

class KycSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if KYC records already exist
        if (KycVerification::count() > 0) {
            $this->command->info('KycSeeder: data already exists, skipping.');

            return;
        }

        $users = User::whereIn('role', ['investor', 'farm_owner'])->get();

        foreach ($users as $user) {
            $status = $this->getRandomKycStatus();
            $submittedAt = now()->subDays(rand(1, 180));
            $verifiedAt = $status === KycStatus::VERIFIED ? $submittedAt->addDays(rand(1, 14)) : null;
            $rejectedAt = $status === KycStatus::REJECTED ? $submittedAt->addDays(rand(1, 7)) : null;

            $kyc = KycVerification::create([
                'user_id' => $user->id,
                'jurisdiction_code' => 'ID',
                'status' => $status,
                'submitted_at' => $submittedAt,
                'verified_at' => $verifiedAt,
                'rejected_at' => $rejectedAt,
                'rejection_reason' => $status === KycStatus::REJECTED ? $this->getRejectionReason() : null,
                'verified_by_admin_id' => $verifiedAt ? User::where('role', 'admin')->first()->id : null,
                'expires_at' => $verifiedAt ? $verifiedAt->addYears(2) : null,
                'provider' => 'manual',
                'provider_reference_id' => 'KYC-'.strtoupper(fake()->unique()->bothify('?????-#####')),
                'created_at' => $submittedAt,
            ]);

            $numDocs = rand(2, 4);
            for ($i = 0; $i < $numDocs; $i++) {
                KycDocument::create([
                    'kyc_verification_id' => $kyc->id,
                    'document_type' => $this->getRandomDocumentType(),
                    'file_path' => "kyc/{$user->id}/".fake()->uuid().'.pdf',
                    'original_filename' => fake()->word().'.pdf',
                    'mime_type' => 'application/pdf',
                    'file_size' => rand(500000, 5000000),
                    'uploaded_at' => $submittedAt->addHours(rand(0, 24)),
                ]);
            }
        }

        $this->command->info('KYC data seeded successfully!');
    }

    private function getRandomKycStatus(): KycStatus
    {
        $statuses = [
            ['status' => KycStatus::PENDING, 'weight' => 5],
            ['status' => KycStatus::SUBMITTED, 'weight' => 5],
            ['status' => KycStatus::VERIFIED, 'weight' => 85],
            ['status' => KycStatus::REJECTED, 'weight' => 5],
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

        return KycStatus::VERIFIED;
    }

    private function getRandomDocumentType(): KycDocumentType
    {
        $types = [
            KycDocumentType::PASSPORT,
            KycDocumentType::NATIONAL_ID,
            KycDocumentType::DRIVERS_LICENSE,
            KycDocumentType::PROOF_OF_ADDRESS,
        ];

        return $types[array_rand($types)];
    }

    private function getRejectionReason(): string
    {
        $reasons = [
            'Document quality too low',
            'Document expired',
            'Information does not match',
            'Invalid document type',
            'Photo unclear',
        ];

        return $reasons[array_rand($reasons)];
    }
}
