<?php

namespace App\Services;

use App\Enums\AuditEventType;
use App\Enums\InvestmentStatus;
use App\Enums\ListingStatus;
use App\Events\ListingPurchased;
use App\Models\AuditLog;
use App\Models\Investment;
use App\Models\InvestmentTransfer;
use App\Models\MarketListing;
use App\Models\Transaction;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class SecondaryMarketService
{
    public function createListing(User $seller, Investment $investment, int $askPriceIdr, ?string $notes = null, ?string $expiresAt = null): MarketListing
    {
        if (! $seller->hasVerifiedKyc()) {
            throw new Exception('Seller must have verified KYC to create a listing.');
        }

        if ($investment->user_id !== $seller->id) {
            throw new Exception('You do not own this investment.');
        }

        if ($investment->status !== InvestmentStatus::Active) {
            throw new Exception('Only active investments can be listed for sale.');
        }

        $activeListing = $investment->activeListing()->first();
        if ($activeListing !== null) {
            throw new Exception('This investment already has an active listing.');
        }

        if ($askPriceIdr < $investment->amount_idr) {
            throw new Exception('Ask price cannot be less than the original investment amount.');
        }

        $feeRate = config('treevest.secondary_market_fee_rate', 0.02);
        $platformFeeIdr = (int) ceil($askPriceIdr * $feeRate);
        $netProceedsIdr = $askPriceIdr - $platformFeeIdr;

        $listing = DB::transaction(function () use ($seller, $investment, $askPriceIdr, $feeRate, $platformFeeIdr, $netProceedsIdr, $notes, $expiresAt) {
            $listing = MarketListing::create([
                'investment_id' => $investment->id,
                'seller_id' => $seller->id,
                'ask_price_idr' => $askPriceIdr,
                'currency' => $investment->currency,
                'platform_fee_rate' => $feeRate,
                'platform_fee_idr' => $platformFeeIdr,
                'net_proceeds_idr' => $netProceedsIdr,
                'status' => ListingStatus::Active,
                'notes' => $notes,
                'expires_at' => $expiresAt ? now()->parse($expiresAt) : null,
            ]);

            $investment->status = InvestmentStatus::Listed;
            $investment->save();

            AuditLog::create([
                'user_id' => $seller->id,
                'event_type' => AuditEventType::LISTING_CREATED,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'event_data' => [
                    'listing_id' => $listing->id,
                    'investment_id' => $investment->id,
                    'ask_price_idr' => $askPriceIdr,
                    'net_proceeds_idr' => $netProceedsIdr,
                ],
            ]);

            return $listing;
        });

        return $listing->load('investment.tree');
    }

    public function cancelListing(MarketListing $listing, User $actor): void
    {
        $isSeller = $listing->seller_id === $actor->id;
        $isAdmin = $actor->isAdmin();

        if (! $isSeller && ! $isAdmin) {
            AuditLog::create([
                'user_id' => $actor->id,
                'event_type' => AuditEventType::UNAUTHORIZED_LISTING_CANCELLATION,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'event_data' => [
                    'listing_id' => $listing->id,
                    'attempted_by' => $actor->id,
                ],
            ]);

            throw new Exception('You are not authorized to cancel this listing.');
        }

        if ($listing->status !== ListingStatus::Active) {
            throw new Exception('Only active listings can be cancelled.');
        }

        DB::transaction(function () use ($listing, $actor, $isAdmin) {
            $listing->status = ListingStatus::Cancelled;
            $listing->cancelled_at = now();
            $listing->save();

            $investment = $listing->investment;
            $investment->status = InvestmentStatus::Active;
            $investment->save();

            $eventType = $isAdmin ? AuditEventType::LISTING_ADMIN_CANCELLED : AuditEventType::LISTING_CANCELLED;

            AuditLog::create([
                'user_id' => $actor->id,
                'event_type' => $eventType,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'event_data' => [
                    'listing_id' => $listing->id,
                    'investment_id' => $investment->id,
                    'cancelled_by' => $actor->id,
                    'is_admin_action' => $isAdmin,
                ],
            ]);
        });
    }

    public function initiatePurchase(MarketListing $listing, User $buyer): Transaction
    {
        if (! $buyer->hasVerifiedKyc()) {
            throw new Exception('Buyer must have verified KYC to purchase.');
        }

        if ($listing->seller_id === $buyer->id) {
            throw new Exception('You cannot purchase your own listing.');
        }

        if ($listing->status !== ListingStatus::Active) {
            throw new Exception('This listing is no longer available.');
        }

        if ($listing->expires_at !== null && $listing->expires_at->isPast()) {
            throw new Exception('This listing has expired.');
        }

        return DB::transaction(function () use ($listing, $buyer) {
            $transaction = Transaction::create([
                'user_id' => $buyer->id,
                'type' => \App\Enums\TransactionType::SecondaryPurchase,
                'status' => \App\Enums\TransactionStatus::Pending,
                'amount' => $listing->ask_price_idr,
                'currency' => $listing->currency,
                'metadata' => [
                    'type' => 'secondary_purchase',
                    'listing_id' => $listing->id,
                    'investment_id' => $listing->investment_id,
                    'seller_id' => $listing->seller_id,
                ],
            ]);

            return $transaction;
        });
    }

    public function confirmPurchase(MarketListing $listing, Transaction $transaction): InvestmentTransfer
    {
        $transfer = DB::transaction(function () use ($listing, $transaction) {
            $lockedListing = MarketListing::lockForUpdate()->find($listing->id);

            if ($lockedListing === null) {
                throw new Exception('Listing not found.');
            }

            if ($lockedListing->status !== ListingStatus::Active) {
                throw new Exception('Listing is no longer available for purchase.');
            }

            $investment = $lockedListing->investment;

            $investment->user_id = $transaction->user_id;
            $investment->status = InvestmentStatus::Sold;
            $investment->save();

            $lockedListing->status = ListingStatus::Sold;
            $lockedListing->buyer_id = $transaction->user_id;
            $lockedListing->purchased_at = now();
            $lockedListing->save();

            $transfer = InvestmentTransfer::create([
                'investment_id' => $investment->id,
                'listing_id' => $lockedListing->id,
                'from_user_id' => $lockedListing->seller_id,
                'to_user_id' => $transaction->user_id,
                'transfer_price_idr' => $lockedListing->ask_price_idr,
                'platform_fee_idr' => $lockedListing->platform_fee_idr,
                'transaction_id' => $transaction->id,
                'transferred_at' => now(),
            ]);

            $transaction->status = \App\Enums\TransactionStatus::Completed;
            $transaction->completed_at = now();
            $transaction->save();

            AuditLog::create([
                'user_id' => $transaction->user_id,
                'event_type' => AuditEventType::LISTING_PURCHASED,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'event_data' => [
                    'listing_id' => $lockedListing->id,
                    'investment_id' => $investment->id,
                    'buyer_id' => $transaction->user_id,
                    'seller_id' => $lockedListing->seller_id,
                    'transfer_price_idr' => $lockedListing->ask_price_idr,
                    'transaction_id' => $transaction->id,
                ],
            ]);

            AuditLog::create([
                'user_id' => $transaction->user_id,
                'event_type' => AuditEventType::OWNERSHIP_TRANSFERRED,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'event_data' => [
                    'investment_id' => $investment->id,
                    'from_user_id' => $lockedListing->seller_id,
                    'to_user_id' => $transaction->user_id,
                    'transfer_id' => $transfer->id,
                    'listing_id' => $lockedListing->id,
                ],
            ]);

            return $transfer->load(['investment.tree', 'listing', 'fromUser', 'toUser', 'transaction']);
        });

        event(new ListingPurchased(
            listing: MarketListing::find($listing->id),
            transfer: InvestmentTransfer::find($transfer->id),
            buyer: User::find($transaction->user_id),
            seller: User::find($listing->seller_id),
        ));

        return $transfer;
    }

    public function expireListings(): int
    {
        $expiredListings = MarketListing::active()
            ->expired()
            ->with(['investment'])
            ->get();

        $expiredCount = 0;

        foreach ($expiredListings as $listing) {
            DB::transaction(function () use ($listing, &$expiredCount) {
                $listing->status = ListingStatus::Cancelled;
                $listing->cancelled_at = now();
                $listing->save();

                $investment = $listing->investment;
                $investment->status = InvestmentStatus::Active;
                $investment->save();

                $expiredCount++;
            });
        }

        return $expiredCount;
    }
}
