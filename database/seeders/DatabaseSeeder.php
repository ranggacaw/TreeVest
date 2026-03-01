<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Core reference data
            LegalDocumentSeeder::class,
            FruitTypeSeeder::class,
            
            // Users with different roles
            UserSeeder::class,
            
            // Content (articles, categories, tags)
            CategorySeeder::class,
            TagSeeder::class,
            EducationContentSeeder::class,
            EncyclopediaSeeder::class,
            
            // Farm and investment data
            FarmSeeder::class,
            InvestmentDataSeeder::class,
            
            // Notification system
            NotificationTemplateSeeder::class,
            NotificationPreferenceSeeder::class,
        ]);
    }
}
