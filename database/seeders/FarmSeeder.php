<?php

namespace Database\Seeders;

use App\Enums\FarmStatus;
use App\Models\Farm;
use App\Models\FarmCertification;
use App\Models\FarmImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class FarmSeeder extends Seeder
{
    public function run(): void
    {
        $farmOwner = User::factory()->create([
            'name' => 'Ahmad Farm Owner',
            'email' => 'ahmad@farm.example.com',
            'role' => 'farm_owner',
        ]);

        $farm1 = Farm::create([
            'owner_id' => $farmOwner->id,
            'name' => 'Musang King Durian Orchard',
            'description' => 'Premium Musang King durian plantation located in the highlands of Pahang. Our trees are over 15 years old and produce the finest quality durians with rich, creamy texture and distinctive aroma.',
            'address' => 'Jalan Kg. Baru',
            'city' => 'Cameron Highlands',
            'state' => 'Pahang',
            'country' => 'Malaysia',
            'postal_code' => '39000',
            'latitude' => 4.4928,
            'longitude' => 101.3844,
            'size_hectares' => 25.5,
            'capacity_trees' => 1200,
            'soil_type' => 'Volcanic loam',
            'climate' => 'Highland tropical',
            'historical_performance' => 'Excellent - Average yield of 500 fruits per tree annually',
            'status' => FarmStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => 1,
        ]);

        FarmCertification::create([
            'farm_id' => $farm1->id,
            'name' => 'Good Agricultural Practices (GAP)',
            'issuer' => 'Department of Agriculture Malaysia',
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
            'description' => 'Our mango farm specializes in premium Alphonso and Nam Doc Mai varieties. Located in the fertile plains of Kedah, we produce sweet, fiberless mangoes exported across Asia.',
            'address' => 'Lot 123, Jalan Sawah',
            'city' => 'Kuala Muda',
            'state' => 'Kedah',
            'country' => 'Malaysia',
            'postal_code' => '08000',
            'latitude' => 5.5174,
            'longitude' => 100.4365,
            'size_hectares' => 18.0,
            'capacity_trees' => 800,
            'soil_type' => 'Alluvial soil',
            'climate' => 'Tropical',
            'historical_performance' => 'Good - Consistent yield of 300 fruits per tree annually',
            'status' => FarmStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => 1,
        ]);

        FarmCertification::create([
            'farm_id' => $farm2->id,
            'name' => 'Organic Certification',
            'issuer' => 'Organic Alliance Malaysia',
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

        $farmOwner2 = User::factory()->create([
            'name' => 'Sarah Fruit Farmer',
            'email' => 'sarah@farm.example.com',
            'role' => 'farm_owner',
        ]);

        $farm3 = Farm::create([
            'owner_id' => $farmOwner2->id,
            'name' => 'Royal Grape Vineyard',
            'description' => 'Modern greenhouse vineyard producing premium table grapes including Thompson Seedless and Shine Muscat. Our climate-controlled environment ensures year-round production.',
            'address' => 'Jalan Kebun 5',
            'city' => 'Seri Kembangan',
            'state' => 'Selangor',
            'country' => 'Malaysia',
            'postal_code' => '43300',
            'latitude' => 3.0322,
            'longitude' => 101.7006,
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
            'description' => 'Established citrus orchard growing Valencia oranges, Meyer lemons, and pomelos. Located in the Cameron Highlands for optimal growing conditions.',
            'address' => 'Jalan Utama 10',
            'city' => 'Brinchang',
            'state' => 'Pahang',
            'country' => 'Malaysia',
            'postal_code' => '39100',
            'latitude' => 4.4650,
            'longitude' => 101.3710,
            'size_hectares' => 12.0,
            'capacity_trees' => 600,
            'soil_type' => 'Highland soil',
            'climate' => 'Highland tropical',
            'historical_performance' => 'Good - 2 harvests per year',
            'status' => FarmStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => 1,
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
