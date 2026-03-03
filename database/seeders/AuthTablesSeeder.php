<?php

namespace Database\Seeders;

use App\Models\OAuthProvider;
use App\Models\TwoFactorRecoveryCode;
use App\Models\TwoFactorSecret;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuthTablesSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if already have extra demo users from factory
        if (User::count() > 10) {
            $this->command->info('AuthTablesSeeder: extra users already exist, skipping.');
            return;
        }

        User::factory(10)->create()->each(function (User $user) {
            if ($user->id % 3 === 0) {
                OAuthProvider::factory()->create([
                    'user_id' => $user->id,
                ]);
            }

            if ($user->id % 2 === 0) {
                $twoFactorSecret = TwoFactorSecret::factory()->create([
                    'user_id' => $user->id,
                ]);

                TwoFactorRecoveryCode::factory(8)->create([
                    'user_id' => $user->id,
                ]);
            }
        });
    }
}
