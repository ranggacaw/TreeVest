<?php

namespace Database\Seeders;

use App\Enums\LegalDocumentType;
use App\Models\LegalDocument;
use Illuminate\Database\Seeder;

class LegalDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LegalDocument::create([
            'type' => LegalDocumentType::TERMS_OF_SERVICE->value,
            'version' => '1.0',
            'title' => 'Terms of Service',
            'content' => 'Sample Terms of Service content...',
            'effective_date' => now(),
            'is_active' => true,
        ]);

        LegalDocument::create([
            'type' => LegalDocumentType::PRIVACY_POLICY->value,
            'version' => '1.0',
            'title' => 'Privacy Policy',
            'content' => 'Sample Privacy Policy content...',
            'effective_date' => now(),
            'is_active' => true,
        ]);

        LegalDocument::create([
            'type' => LegalDocumentType::RISK_DISCLOSURE->value,
            'version' => '1.0',
            'title' => 'Risk Disclosure',
            'content' => 'Sample Risk Disclosure content...',
            'effective_date' => now(),
            'is_active' => true,
        ]);
    }
}
