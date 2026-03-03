<?php

namespace Database\Seeders;

use App\Enums\FarmStatus;
use App\Models\Farm;
use App\Models\FarmCertification;
use App\Models\FarmImage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FarmSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if farms already exist
        if (Farm::count() > 0) {
            $this->command->info('FarmSeeder: data already exists, skipping.');
            return;
        }

        $admin = User::where('email', 'admin@treevest.com')->first();
        $adminId = $admin ? $admin->id : null;

        $farmOwner = User::firstOrCreate(
            ['email' => 'ahmad@farm.example.com'],
            [
                'name' => 'Ahmad Farm Owner',
                'password' => \Illuminate\Support\Facades\Hash::make('farm123'),
                'role' => 'farm_owner',
                'email_verified_at' => now(),
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'kyc_expires_at' => now()->addYears(2),
            ]
        );

        $farm1 = Farm::create([
            'owner_id' => $farmOwner->id,
            'name' => 'Musang King Durian Orchard',
            'description' => 'Premium Musang King durian plantation located in the highlands of Bogor. Our trees are over 15 years old and produce the finest quality durians with rich, creamy texture and distinctive aroma.',
            'address' => 'Jalan Desa Baru',
            'city' => 'Bogor',
            'state' => 'Jawa Barat',
            'country' => 'Indonesia',
            'postal_code' => '16120',
            'latitude' => -6.6000,
            'longitude' => 106.8000,
            'size_hectares' => 25.5,
            'capacity_trees' => 1200,
            'soil_type' => 'Volcanic loam',
            'climate' => 'Highland tropical',
            'historical_performance' => 'Excellent - Average yield of 500 fruits per tree annually',
            'status' => FarmStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => $adminId,
        ]);

        FarmCertification::create([
            'farm_id' => $farm1->id,
            'name' => 'Good Agricultural Practices (GAP)',
            'issuer' => 'Kementerian Pertanian Republik Indonesia',
            'certificate_number' => 'GAP-2024-001',
            'issued_date' => '2024-01-15',
            'expiry_date' => '2026-01-15',
        ]);

        FarmImage::create([
            'farm_id' => $farm1->id,
            'file_path' => 'farms/demo/durian-orchard-1.jpg',
            'original_filename' => 'durian-orchard-1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1024000,
            'is_featured' => true,
            'sort_order' => 0,
        ]);

        $farm2 = Farm::create([
            'owner_id' => $farmOwner->id,
            'name' => 'Tropical Mango Paradise',
            'description' => 'Our mango farm specializes in premium Arumanis and Gedong Gincu varieties. Located in the fertile plains of Cirebon, we produce sweet, fiberless mangoes exported across Asia.',
            'address' => 'Lot 123, Jalan Sawah Besar',
            'city' => 'Cirebon',
            'state' => 'Jawa Barat',
            'country' => 'Indonesia',
            'postal_code' => '45111',
            'latitude' => -6.7063,
            'longitude' => 108.5572,
            'size_hectares' => 18.0,
            'capacity_trees' => 800,
            'soil_type' => 'Alluvial soil',
            'climate' => 'Tropical',
            'historical_performance' => 'Good - Consistent yield of 300 fruits per tree annually',
            'status' => FarmStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => $adminId,
        ]);

        FarmCertification::create([
            'farm_id' => $farm2->id,
            'name' => 'Organic Certification',
            'issuer' => 'Indonesian Organic Alliance (AOI)',
            'certificate_number' => 'ORG-2023-456',
            'issued_date' => '2023-06-01',
            'expiry_date' => '2025-06-01',
        ]);

        FarmImage::create([
            'farm_id' => $farm2->id,
            'file_path' => 'farms/demo/mango-farm-1.jpg',
            'original_filename' => 'mango-farm-1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 985600,
            'is_featured' => true,
            'sort_order' => 0,
        ]);

        $farmOwner2 = User::firstOrCreate(
            ['email' => 'sarah@farm.example.com'],
            [
                'name' => 'Sarah Fruit Farmer',
                'password' => \Illuminate\Support\Facades\Hash::make('farm123'),
                'role' => 'farm_owner',
                'email_verified_at' => now(),
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'kyc_expires_at' => now()->addYears(2),
            ]
        );

        $farm3 = Farm::create([
            'owner_id' => $farmOwner2->id,
            'name' => 'Royal Grape Vineyard',
            'description' => 'Modern greenhouse vineyard producing premium table grapes including Thompson Seedless and Shine Muscat. Our climate-controlled environment ensures year-round production.',
            'address' => 'Jalan Kebun Raya 5',
            'city' => 'Semarang',
            'state' => 'Jawa Tengah',
            'country' => 'Indonesia',
            'postal_code' => '50131',
            'latitude' => -7.0051,
            'longitude' => 110.4381,
            'size_hectares' => 8.5,
            'capacity_trees' => 500,
            'soil_type' => 'Sandy loam',
            'climate' => 'Controlled greenhouse',
            'historical_performance' => 'Very Good - 2 harvest cycles per year, 15kg per vine',
            'status' => FarmStatus::PENDING_APPROVAL,
        ]);

        FarmImage::create([
            'farm_id' => $farm3->id,
            'file_path' => 'farms/demo/grape-vineyard-1.jpg',
            'original_filename' => 'grape-vineyard-1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 876500,
            'is_featured' => true,
            'sort_order' => 0,
        ]);

        $farm4 = Farm::create([
            'owner_id' => $farmOwner2->id,
            'name' => 'Citrus Grove Estate',
            'description' => 'Established citrus orchard growing Valencia oranges, Kalamansi lemons, and pomelos. Located in the Bali highlands for optimal growing conditions.',
            'address' => 'Jalan Utama 10',
            'city' => 'Kintamani',
            'state' => 'Bali',
            'country' => 'Indonesia',
            'postal_code' => '80652',
            'latitude' => -8.2392,
            'longitude' => 115.3663,
            'size_hectares' => 12.0,
            'capacity_trees' => 600,
            'soil_type' => 'Highland soil',
            'climate' => 'Highland tropical',
            'historical_performance' => 'Good - 2 harvests per year',
            'status' => FarmStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => $adminId,
        ]);

        FarmCertification::create([
            'farm_id' => $farm4->id,
            'name' => 'HACCP Certification',
            'issuer' => 'SIRIM QAS International',
            'certificate_number' => 'HACCP-2024-789',
            'issued_date' => '2024-03-01',
            'expiry_date' => '2027-03-01',
        ]);

        FarmImage::create([
            'farm_id' => $farm4->id,
            'file_path' => 'farms/demo/citrus-grove-1.jpg',
            'original_filename' => 'citrus-grove-1.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 754300,
            'is_featured' => true,
            'sort_order' => 0,
        ]);
    }
}
