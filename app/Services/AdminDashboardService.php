<?php

namespace App\Services;

use App\Enums\FarmStatus;
use App\Enums\HarvestStatus;
use App\Enums\InvestmentStatus;
use App\Enums\KycStatus;
use App\Enums\PayoutStatus;
use App\Models\Farm;
use App\Models\Harvest;
use App\Models\Investment;
use App\Models\KycVerification;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class AdminDashboardService
{
    public function getMetrics(?string $dateFrom = null, ?string $dateTo = null): array
    {
        if ($dateFrom || $dateTo) {
            return $this->computeMetrics($dateFrom, $dateTo);
        }

        return Cache::remember('admin.dashboard.metrics', 300, function () {
            return $this->computeMetrics();
        });
    }

    protected function computeMetrics(?string $dateFrom = null, ?string $dateTo = null): array
    {
        $investmentQuery = Investment::where('status', InvestmentStatus::Active);
        $payoutQuery = Payout::where('status', PayoutStatus::Completed);

        if ($dateFrom) {
            $investmentQuery->whereDate('created_at', '>=', $dateFrom);
            $payoutQuery->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $investmentQuery->whereDate('created_at', '<=', $dateTo);
            $payoutQuery->whereDate('created_at', '<=', $dateTo);
        }

        return [
            'total_users' => User::count(),
            'kyc_verified' => User::where('kyc_status', KycStatus::VERIFIED)->count(),
            'active_investments' => $investmentQuery->count(),
            'investment_volume' => (int) $investmentQuery->sum('amount_cents'),
            'pending_kyc' => KycVerification::where('status', KycStatus::SUBMITTED)->count(),
            'pending_farms' => Farm::where('status', FarmStatus::PENDING_APPROVAL)->count(),
            'completed_harvests' => Harvest::where('status', HarvestStatus::Completed)->count(),
            'total_payouts' => (int) $payoutQuery->sum('net_amount_cents'),
        ];
    }

    public function getRecentActivity(int $limit = 10): array
    {
        $users = User::orderByDesc('created_at')->limit($limit)->get()->map(function ($u) {
            return [
                'type' => 'user_registered',
                'description' => 'registered a new account',
                'actor_name' => $u->name,
                'created_at' => $u->created_at->toIso8601String(),
            ];
        })->toArray();

        $investments = Investment::with('user')->orderByDesc('created_at')->limit($limit)->get()->map(function ($i) {
            return [
                'type' => 'investment_created',
                'description' => 'made an investment',
                'actor_name' => $i->user ? $i->user->name : 'Unknown',
                'created_at' => $i->created_at->toIso8601String(),
            ];
        })->toArray();

        $farms = Farm::with('owner')->orderByDesc('created_at')->limit($limit)->get()->map(function ($f) {
            return [
                'type' => 'farm_created',
                'description' => 'created a new farm: '.$f->name,
                'actor_name' => $f->owner ? $f->owner->name : 'Unknown',
                'created_at' => $f->created_at->toIso8601String(),
            ];
        })->toArray();

        $kyc = KycVerification::with('user')->orderByDesc('created_at')->limit($limit)->get()->map(function ($k) {
            return [
                'type' => 'kyc_submitted',
                'description' => 'submitted KYC for verification',
                'actor_name' => $k->user ? $k->user->name : 'Unknown',
                'created_at' => $k->created_at->toIso8601String(),
            ];
        })->toArray();

        $activities = array_merge($users, $investments, $farms, $kyc);

        usort($activities, function ($a, $b) {
            return strtotime($b['created_at']) <=> strtotime($a['created_at']);
        });

        return array_slice($activities, 0, $limit);
    }
}
