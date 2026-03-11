<?php

namespace App\Policies;

use App\Models\Investment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvestmentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any investments.
     */
    public function viewAny(User $user): bool
    {
        // Users can view their own investments, admins can view all
        return $user->hasRole('investor') || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can view the investment.
     */
    public function view(User $user, Investment $investment): bool
    {
        // Users can only view their own investments, admins can view all
        return $user->id === $investment->user_id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can create investments.
     */
    public function create(User $user): bool
    {
        // Only verified investors can create investments
        return $user->hasRole('investor') && $user->isKycValid();
    }

    /**
     * Determine whether the user can update the investment.
     */
    public function update(User $user, Investment $investment): bool
    {
        // Users can only update their own investments if in pending status
        return $user->id === $investment->user_id &&
               $investment->status === 'pending_payment';
    }

    /**
     * Determine whether the user can delete the investment.
     */
    public function delete(User $user, Investment $investment): bool
    {
        // Users can cancel their own investments if cancellable, admins can delete any
        return ($user->id === $investment->user_id && $investment->isCancellable()) ||
               $user->hasRole('admin');
    }

    /**
     * Determine whether the user can top up the investment.
     */
    public function topUp(User $user, Investment $investment): bool
    {
        // Users can only top up their own active investments
        return $user->id === $investment->user_id &&
               $investment->status === 'active' &&
               $user->isKycValid();
    }

    /**
     * Determine whether the user can view investment details including harvest data.
     */
    public function viewDetails(User $user, Investment $investment): bool
    {
        // Same as view but with additional checks for sensitive data
        return ($user->id === $investment->user_id || $user->hasRole('admin')) &&
               $user->isKycValid();
    }

    /**
     * Determine whether the user can view investment payouts.
     */
    public function viewPayouts(User $user, Investment $investment): bool
    {
        // Users can only view payouts for their own investments
        return $user->id === $investment->user_id && $user->isKycValid();
    }
}
