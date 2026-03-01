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
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'role' => 'admin',
        ]);

        $this->call([
            LegalDocumentSeeder::class,
            CategorySeeder::class,
            TagSeeder::class,
            EducationContentSeeder::class,
            EncyclopediaSeeder::class,
            FarmSeeder::class,
            FruitTypeSeeder::class,
            NotificationTemplateSeeder::class,
            NotificationPreferenceSeeder::class,
        ]);
    }
}
