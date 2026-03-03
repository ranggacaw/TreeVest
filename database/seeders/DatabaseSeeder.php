<?php

namespace Database\Seeders;

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
            KycSeeder::class,

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

            // Weather and health monitoring
            WeatherDataSeeder::class,
            HealthUpdateSeeder::class,
            HealthAlertSeeder::class,

            // Market data
            MarketPriceSeeder::class,

            // Harvests and payouts
            HarvestSeeder::class,
            PayoutSeeder::class,

            // Financial transactions
            TransactionSeeder::class,
            PaymentMethodSeeder::class,

            // Reports
            GeneratedReportSeeder::class,

            // Notifications (in-app + delivery logs)
            NotificationSeeder::class,

            // Auth extras (OAuth providers, 2FA secrets for demo users)
            AuthTablesSeeder::class,
        ]);
    }
}
