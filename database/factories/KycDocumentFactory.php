<?php

namespace Database\Factories;

use App\Enums\KycDocumentType;
use Illuminate\Database\Eloquent\Factories\Factory;

class KycDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kyc_verification_id' => \App\Models\KycVerification::factory(),
            'document_type' => fake()->randomElement(KycDocumentType::cases()),
            'file_path' => 'documents/'.fake()->uuid().'.pdf',
            'original_filename' => fake()->word().'.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(1024, 5242880),
            'uploaded_at' => now(),
        ];
    }

    public function passport(): static
    {
        return $this->state(fn (array $attributes) => [
            'document_type' => KycDocumentType::PASSPORT,
        ]);
    }

    public function nationalId(): static
    {
        return $this->state(fn (array $attributes) => [
            'document_type' => KycDocumentType::NATIONAL_ID,
        ]);
    }

    public function driversLicense(): static
    {
        return $this->state(fn (array $attributes) => [
            'document_type' => KycDocumentType::DRIVERS_LICENSE,
        ]);
    }

    public function proofOfAddress(): static
    {
        return $this->state(fn (array $attributes) => [
            'document_type' => KycDocumentType::PROOF_OF_ADDRESS,
        ]);
    }
}
