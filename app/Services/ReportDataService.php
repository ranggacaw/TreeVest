<?php

namespace App\Services;

use App\Enums\PayoutStatus;
use App\Models\Investment;
use App\Models\User;

class ReportDataService
{
    public function getProfitLossData(User $user, array $filters = []): array
    {
        $query = Investment::with([
            'tree.fruitCrop.farm',
            'tree.fruitCrop.fruitType',
            'payouts' => function ($q) {
                $q->where('status', PayoutStatus::Completed);
            },
        ])->where('user_id', $user->id);

        if (! empty($filters['from'])) {
            $query->where('purchase_date', '>=', $filters['from']);
        }

        if (! empty($filters['to'])) {
            $query->where('purchase_date', '<=', $filters['to']);
        }

        if (! empty($filters['farm_id'])) {
            $query->whereHas('tree.fruitCrop.farm', function ($q) use ($filters) {
                $q->where('id', $filters['farm_id']);
            });
        }

        if (! empty($filters['fruit_type_id'])) {
            $query->whereHas('tree.fruitCrop', function ($q) use ($filters) {
                $q->where('fruit_type_id', $filters['fruit_type_id']);
            });
        }

        if (! empty($filters['investment_id'])) {
            $query->where('id', $filters['investment_id']);
        }

        $investments = $query->get();

        $rows = [];
        $totalInvested = 0;
        $totalPayouts = 0;

        foreach ($investments as $investment) {
            $totalPayoutsCents = $investment->payouts->sum('net_amount_cents');
            $netCents = $totalPayoutsCents - $investment->amount_cents;
            $actualRoiPercent = $investment->amount_cents > 0
                ? round(($netCents / $investment->amount_cents) * 100, 2)
                : 0;

            $rows[] = [
                'investmentId' => $investment->id,
                'treeIdentifier' => $investment->tree->tree_identifier,
                'fruitType' => $investment->tree->fruitCrop->fruitType->name,
                'variant' => $investment->tree->fruitCrop->variant,
                'farmName' => $investment->tree->fruitCrop->farm->name,
                'amountInvestedCents' => $investment->amount_cents,
                'totalPayoutsCents' => $totalPayoutsCents,
                'netCents' => $netCents,
                'actualRoiPercent' => $actualRoiPercent,
                'status' => $investment->status->value,
                'purchaseDate' => $investment->purchase_date->toDateString(),
            ];

            $totalInvested += $investment->amount_cents;
            $totalPayouts += $totalPayoutsCents;
        }

        return [
            'rows' => $rows,
            'summary' => [
                'totalInvestedCents' => $totalInvested,
                'totalPayoutsCents' => $totalPayouts,
                'netCents' => $totalPayouts - $totalInvested,
                'overallRoiPercent' => $totalInvested > 0
                    ? round((($totalPayouts - $totalInvested) / $totalInvested) * 100, 2)
                    : 0,
            ],
        ];
    }

    public function getTaxSummaryData(User $user, int $year): array
    {
        $startDate = sprintf('%d-01-01', $year);
        $endDate = sprintf('%d-12-31', $year);

        $payouts = \App\Models\Payout::with(['investment.tree.fruitCrop.farm'])
            ->where('investor_id', $user->id)
            ->where('status', PayoutStatus::Completed)
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->get();

        $investments = Investment::with(['tree.fruitCrop.farm'])
            ->where('user_id', $user->id)
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->get();

        $incomeRows = [];
        $totalIncome = 0;

        foreach ($payouts as $payout) {
            $incomeRows[] = [
                'payoutId' => $payout->id,
                'date' => $payout->completed_at->toDateString(),
                'farmName' => $payout->investment->tree->fruitCrop->farm->name ?? 'Unknown',
                'grossAmountCents' => $payout->gross_amount_cents,
                'platformFeeCents' => $payout->platform_fee_cents,
                'netAmountCents' => $payout->net_amount_cents,
            ];
            $totalIncome += $payout->net_amount_cents;
        }

        $investmentRows = [];
        $totalInvested = 0;

        foreach ($investments as $investment) {
            $investmentRows[] = [
                'investmentId' => $investment->id,
                'date' => $investment->purchase_date->toDateString(),
                'farmName' => $investment->tree->fruitCrop->farm->name ?? 'Unknown',
                'amountCents' => $investment->amount_cents,
            ];
            $totalInvested += $investment->amount_cents;
        }

        return [
            'year' => $year,
            'income' => [
                'rows' => $incomeRows,
                'totalCents' => $totalIncome,
            ],
            'investments' => [
                'rows' => $investmentRows,
                'totalCents' => $totalInvested,
            ],
            'summary' => [
                'totalIncomeCents' => $totalIncome,
                'totalInvestedCents' => $totalInvested,
                'netCents' => $totalIncome - $totalInvested,
            ],
        ];
    }

    public function getPerformanceData(User $user, array $filters = []): array
    {
        $query = Investment::with([
            'tree.fruitCrop.farm',
            'payouts' => function ($q) {
                $q->where('status', PayoutStatus::Completed);
            },
        ])->where('user_id', $user->id);

        if (! empty($filters['from'])) {
            $query->where('purchase_date', '>=', $filters['from']);
        }

        if (! empty($filters['to'])) {
            $query->where('purchase_date', '<=', $filters['to']);
        }

        $investments = $query->get();

        $byMonth = [];

        foreach ($investments as $investment) {
            $month = $investment->purchase_date->format('Y-m');
            if (! isset($byMonth[$month])) {
                $byMonth[$month] = [
                    'month' => $month,
                    'investedCents' => 0,
                    'payoutsCents' => 0,
                ];
            }
            $byMonth[$month]['investedCents'] += $investment->amount_cents;

            foreach ($investment->payouts as $payout) {
                $payoutMonth = $payout->completed_at->format('Y-m');
                if (! isset($byMonth[$payoutMonth])) {
                    $byMonth[$payoutMonth] = [
                        'month' => $payoutMonth,
                        'investedCents' => 0,
                        'payoutsCents' => 0,
                    ];
                }
                $byMonth[$payoutMonth]['payoutsCents'] += $payout->net_amount_cents;
            }
        }

        ksort($byMonth);

        $cumulative = 0;
        $dataPoints = [];
        foreach ($byMonth as $monthData) {
            $cumulative += $monthData['payoutsCents'] - $monthData['investedCents'];
            $dataPoints[] = [
                'month' => $monthData['month'],
                'investedCents' => $monthData['investedCents'],
                'payoutsCents' => $monthData['payoutsCents'],
                'cumulativeCents' => $cumulative,
            ];
        }

        return $dataPoints;
    }
}
