<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\User;

class HealthUpdatePolicy
{
    public function manageHealthUpdates(User $user, Farm $farm): bool
    {
        return $user->isFarmOwner() && $user->id === $farm->owner_id;
    }

    public function viewHealthFeed(User $user): bool
    {
        return $user->isInvestor();
    }

    public function viewHealthUpdate(User $user, \App\Models\TreeHealthUpdate $healthUpdate): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($healthUpdate->visibility === 'public') {
            return true;
        }

        if ($user->isFarmOwner() && $user->id === $healthUpdate->fruitCrop->farm->owner_id) {
            return true;
        }

        return $user->isInvestor();
    }
}
