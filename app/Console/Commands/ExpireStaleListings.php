<?php

namespace App\Console\Commands;

use App\Services\SecondaryMarketService;
use Illuminate\Console\Command;

class ExpireStaleListings extends Command
{
    protected $signature = 'listings:expire {--dry-run : Show what would be done without making changes}';

    protected $description = 'Expire stale secondary market listings that have passed their expiration date';

    public function handle(SecondaryMarketService $service): int
    {
        if ($this->option('dry-run')) {
            $staleListings = \App\Models\MarketListing::active()
                ->expired()
                ->count();

            $this->info("Dry run: {$staleListings} stale listings would be expired.");

            return self::SUCCESS;
        }

        $expiredCount = $service->expireListings();

        if ($expiredCount === 0) {
            $this->info('No stale listings to expire.');
        } else {
            $this->info("Successfully expired {$expiredCount} stale listings.");
        }

        return self::SUCCESS;
    }
}
