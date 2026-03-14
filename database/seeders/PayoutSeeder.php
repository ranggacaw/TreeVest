<?php

namespace Database\Seeders;

use App\Enums\InvestmentStatus;
use App\Enums\PayoutStatus;
use App\Models\Harvest;
use App\Models\Investment;
use App\Models\Payout;
use Illuminate\Database\Seeder;

class PayoutSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if payout records already exist
        if (Payout::count() > 0) {
            $this->command->info('PayoutSeeder: data already exists, skipping.');

            return;
        }

        $completedHarvests = Harvest::where('status', 'completed')
            ->whereNotNull('actual_yield_kg')
            ->get();

        foreach ($completedHarvests as $harvest) {
            $investments = Investment::where('tree_id', $harvest->tree_id)
                ->where('status', InvestmentStatus::Active)
                ->get();

            foreach ($investments as $investment) {
                $status = $this->getRandomPayoutStatus();

                $grossAmountIdr = $this->calculateGrossAmount($harvest, $investment);
                $platformFeeIdr = (int) ($grossAmountIdr * $harvest->platform_fee_rate);
                $netAmountIdr = $grossAmountIdr - $platformFeeIdr;

                Payout::create([
                    'investment_id' => $investment->id,
                    'harvest_id' => $harvest->id,
                    'investor_id' => $investment->user_id,
                    'gross_amount_idr' => $grossAmountIdr,
                    'platform_fee_idr' => $platformFeeIdr,
                    'net_amount_idr' => $netAmountIdr,
                    'currency' => 'IDR',
                    'status' => $status,
                    'payout_method' => $this->getPayoutMethod(),
                    'transaction_id' => null,
                    'notes' => $this->getPayoutNote($status),
                    'processing_started_at' => $status !== PayoutStatus::Pending ? $harvest->completed_at->addHours(rand(1, 24)) : null,
                    'completed_at' => $status === PayoutStatus::Completed ? $harvest->completed_at->addDays(rand(1, 5)) : null,
                    'failed_at' => $status === PayoutStatus::Failed ? $harvest->completed_at->addDays(rand(1, 3)) : null,
                    'failed_reason' => $status === PayoutStatus::Failed ? $this->getFailedReason() : null,
                    'created_at' => $harvest->completed_at,
                ]);
            }
        }

        $this->command->info('Payouts seeded successfully!');
    }

    private function getRandomPayoutStatus(): PayoutStatus
    {
        $statuses = [
            ['status' => PayoutStatus::Pending, 'weight' => 10],
            ['status' => PayoutStatus::Processing, 'weight' => 5],
            ['status' => PayoutStatus::Completed, 'weight' => 80],
            ['status' => PayoutStatus::Failed, 'weight' => 5],
        ];

        $total = array_sum(array_column($statuses, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($statuses as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['status'];
            }
        }

        return PayoutStatus::Completed;
    }

    private function calculateGrossAmount(Harvest $harvest, Investment $investment): int
    {
        $marketPriceIdrPerKg = $harvest->marketPrice?->price_per_kg_idr ?? 5000;
        $actualYieldKg = $harvest->actual_yield_kg ?? 100;

        $investorShare = $investment->amount_idr / $harvest->tree->price_idr;

        return (int) ($marketPriceIdrPerKg * $actualYieldKg * $investorShare);
    }

    private function getPayoutMethod(): string
    {
        $methods = ['bank_transfer', 'digital_wallet'];
        $weights = [65, 35];

        $total = array_sum($weights);
        $random = rand(1, $total);
        $current = 0;

        foreach ($methods as $index => $method) {
            $current += $weights[$index];
            if ($random <= $current) {
                return $method;
            }
        }

        return 'bank_transfer';
    }

    private function getPayoutNote(PayoutStatus $status): ?string
    {
        return match ($status) {
            PayoutStatus::Pending => 'Payout queued for processing',
            PayoutStatus::Processing => 'Payout being processed by payment provider',
            PayoutStatus::Completed => 'Payout completed successfully',
            PayoutStatus::Failed => 'Payout failed - see failed reason',
        };
    }

    private function getFailedReason(): string
    {
        $reasons = [
            'Bank account verification failed',
            'Payment provider timeout',
            'Invalid payment method',
            'Account temporarily suspended',
            'Insufficient funds in payment provider account',
        ];

        return $reasons[array_rand($reasons)];
    }
}
