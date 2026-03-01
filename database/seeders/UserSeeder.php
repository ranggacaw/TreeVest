<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        User::firstOrCreate(
            ['email' => 'admin@treevest.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'kyc_expires_at' => now()->addYears(2),
            ]
        );

        // Farm Owner User
        User::firstOrCreate(
            ['email' => 'farmowner@treevest.com'],
            [
                'name' => 'Farm Owner',
                'password' => Hash::make('farm123'),
                'role' => 'farm_owner',
                'email_verified_at' => now(),
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'kyc_expires_at' => now()->addYears(2),
            ]
        );

        // Investor User
        User::firstOrCreate(
            ['email' => 'investor@treevest.com'],
            [
                'name' => 'Investor User',
                'password' => Hash::make('investor123'),
                'role' => 'investor',
                'email_verified_at' => now(),
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'kyc_expires_at' => now()->addYears(2),
            ]
        );

        // Additional demo users
        User::firstOrCreate(
            ['email' => 'john.investor@example.com'],
            [
                'name' => 'John Investor',
                'password' => Hash::make('password'),
                'role' => 'investor',
                'email_verified_at' => now(),
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'kyc_expires_at' => now()->addYears(2),
            ]
        );

        User::firstOrCreate(
            ['email' => 'jane.farmer@example.com'],
            [
                'name' => 'Jane Farmer',
                'password' => Hash::make('password'),
                'role' => 'farm_owner',
                'email_verified_at' => now(),
                'kyc_status' => 'verified',
                'kyc_verified_at' => now(),
                'kyc_expires_at' => now()->addYears(2),
            ]
        );
    }
}
