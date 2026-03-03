<?php

namespace Database\Seeders;

use App\Enums\InvestmentStatus;
use App\Enums\PayoutStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Investment;
use App\Models\Payout;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if transactions already exist
        if (Transaction::count() > 0) {
            $this->command->info('TransactionSeeder: data already exists, skipping.');
            return;
        }

        $this->seedInvestmentTransactions();
        $this->seedPayoutTransactions();
        $this->seedDepositTransactions();

        $this->command->info('Transactions seeded successfully!');
    }

    private function seedInvestmentTransactions(): void
    {
        $investments = Investment::where('status', InvestmentStatus::Active)->get();

        foreach ($investments as $investment) {
            $status = $this->getRandomTransactionStatus(TransactionType::InvestmentPurchase);

            Transaction::create([
                'user_id' => $investment->user_id,
                'type' => TransactionType::InvestmentPurchase,
                'status' => $status,
                'amount' => $investment->amount_cents,
                'currency' => 'IDR',
                'related_investment_id' => $investment->id,
                'stripe_payment_intent_id' => 'pi_' . fake()->unique()->lexify('??????????????????'),
                'payment_method_id' => null,
                'related_payout_id' => null,
                'metadata' => [
                    'tree_id' => $investment->tree_id,
                    'tree_identifier' => $investment->tree->tree_identifier,
                    'fruit_crop' => $investment->tree->fruitCrop->variant,
                    'farm_name' => $investment->tree->fruitCrop->farm->name,
                ],
                'stripe_metadata' => [],
                'failure_reason' => $status === TransactionStatus::Failed ? $this->getFailureReason() : null,
                'completed_at' => $status === TransactionStatus::Completed ? $investment->purchase_date->addMinutes(rand(5, 30)) : null,
                'failed_at' => $status === TransactionStatus::Failed ? $investment->purchase_date->addMinutes(rand(1, 10)) : null,
                'created_at' => $investment->purchase_date,
            ]);
        }
    }

    private function seedPayoutTransactions(): void
    {
        $completedPayouts = Payout::where('status', PayoutStatus::Completed)->get();

        foreach ($completedPayouts as $payout) {
            Transaction::create([
                'user_id' => $payout->investor_id,
                'type' => TransactionType::Payout,
                'status' => TransactionStatus::Completed,
                'amount' => $payout->net_amount_cents,
                'currency' => 'IDR',
                'related_investment_id' => $payout->investment_id,
                'stripe_payment_intent_id' => null,
                'payment_method_id' => null,
                'related_payout_id' => $payout->id,
                'metadata' => [
                    'harvest_id' => $payout->harvest_id,
                    'gross_amount' => $payout->gross_amount_cents,
                    'platform_fee' => $payout->platform_fee_cents,
                    'payout_method' => $payout->payout_method,
                ],
                'stripe_metadata' => [],
                'failure_reason' => null,
                'completed_at' => $payout->completed_at,
                'failed_at' => null,
                'created_at' => $payout->completed_at,
            ]);
        }
    }

    private function seedDepositTransactions(): void
    {
        $users = User::whereIn('role', ['investor'])->get();

        foreach ($users as $user) {
            $numDeposits = rand(1, 5);

            for ($i = 0; $i < $numDeposits; $i++) {
                $status = $this->getRandomTransactionStatus(TransactionType::TopUp);
                $amountCents = rand(500000, 10000000);

                Transaction::create([
                    'user_id' => $user->id,
                    'type' => TransactionType::TopUp,
                    'status' => $status,
                    'amount' => $amountCents,
                    'currency' => 'IDR',
                    'related_investment_id' => null,
                'stripe_payment_intent_id' => 'pi_' . fake()->unique()->lexify('??????????????????'),
                    'payment_method_id' => null,
                    'related_payout_id' => null,
                    'metadata' => [
                        'description' => 'Wallet top-up',
                    ],
                    'stripe_metadata' => [],
                    'failure_reason' => $status === TransactionStatus::Failed ? $this->getFailureReason() : null,
                    'completed_at' => $status === TransactionStatus::Completed ? now()->subDays(rand(1, 180)) : null,
                    'failed_at' => $status === TransactionStatus::Failed ? now()->subDays(rand(1, 180)) : null,
                    'created_at' => now()->subDays(rand(1, 180)),
                ]);
            }
        }
    }

    private function getRandomTransactionStatus(TransactionType $type): TransactionStatus
    {
        $statusSets = match ($type) {
            TransactionType::InvestmentPurchase => [
                ['status' => TransactionStatus::Completed, 'weight' => 90],
                ['status' => TransactionStatus::Failed, 'weight' => 10],
            ],
            TransactionType::TopUp => [
                ['status' => TransactionStatus::Completed, 'weight' => 85],
                ['status' => TransactionStatus::Failed, 'weight' => 15],
            ],
            default => [
                ['status' => TransactionStatus::Completed, 'weight' => 100],
            ],
        };

        $total = array_sum(array_column($statusSets, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($statusSets as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['status'];
            }
        }

        return TransactionStatus::Completed;
    }

    private function getFailureReason(): string
    {
        $reasons = [
            'Insufficient funds',
            'Card declined',
            'Payment processing error',
            'Bank authorization failed',
            'Network timeout',
            'Invalid payment method',
        ];

        return $reasons[array_rand($reasons)];
    }
}
