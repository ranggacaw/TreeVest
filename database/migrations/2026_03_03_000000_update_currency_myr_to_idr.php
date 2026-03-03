<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Update all existing MYR currency values to IDR (Indonesian Rupiah).
     * This migration handles existing data in the database.
     */
    public function up(): void
    {
        // Update investments table
        DB::table('investments')->where('currency', 'MYR')->update(['currency' => 'IDR']);

        // Update transactions table
        DB::table('transactions')->where('currency', 'MYR')->update(['currency' => 'IDR']);

        // Update payouts table
        DB::table('payouts')->where('currency', 'MYR')->update(['currency' => 'IDR']);

        // Update market_listings table
        DB::table('market_listings')->where('currency', 'MYR')->update(['currency' => 'IDR']);

        // Update market_prices table
        DB::table('market_prices')->where('currency', 'MYR')->update(['currency' => 'IDR']);
    }

    /**
     * Reverse the migration (rollback IDR back to MYR).
     */
    public function down(): void
    {
        DB::table('investments')->where('currency', 'IDR')->update(['currency' => 'MYR']);
        DB::table('transactions')->where('currency', 'IDR')->update(['currency' => 'MYR']);
        DB::table('payouts')->where('currency', 'IDR')->update(['currency' => 'MYR']);
        DB::table('market_listings')->where('currency', 'IDR')->update(['currency' => 'MYR']);
        DB::table('market_prices')->where('currency', 'IDR')->update(['currency' => 'MYR']);
    }
};
