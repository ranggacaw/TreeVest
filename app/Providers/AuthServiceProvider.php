<?php

namespace App\Providers;

use App\Models\Investment;
use App\Policies\InvestmentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Investment::class => InvestmentPolicy::class,
        \App\Models\TreeHealthUpdate::class => \App\Policies\HealthUpdatePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            if ($user->isAdmin()) {
                return true;
            }
        });

        \Illuminate\Support\Facades\Gate::define('manage-health-updates', function ($user, \App\Models\Farm $farm) {
            return $user->isFarmOwner() && $user->id === $farm->owner_id;
        });
    }
}
