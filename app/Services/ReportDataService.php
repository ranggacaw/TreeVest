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
            'lot.fruitCrop.farm',
            'lot.fruitCrop.fruitType',
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
            $query->where(function ($q) use ($filters) {
                $q->whereHas('tree.fruitCrop.farm', function ($subQ) use ($filters) {
                    $subQ->where('id', $filters['farm_id']);
                })
                    ->orWhereHas('lot.fruitCrop.farm', function ($subQ) use ($filters) {
                        $subQ->where('id', $filters['farm_id']);
                    });
            });
        }

        if (! empty($filters['fruit_type_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereHas('tree.fruitCrop', function ($subQ) use ($filters) {
                    $subQ->where('fruit_type_id', $filters['fruit_type_id']);
                })
                    ->orWhereHas('lot.fruitCrop', function ($subQ) use ($filters) {
                        $subQ->where('fruit_type_id', $filters['fruit_type_id']);
                    });
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
            $tree = $investment->tree;
            $fruitCrop = $tree?->fruitCrop;
            $fruitType = $fruitCrop?->fruitType;
            $farm = $fruitCrop?->farm;

            $treeIdentifier = $tree?->tree_identifier ?? $investment->lot?->name ?? 'N/A';
            $fruitTypeName = $fruitType?->name ?? 'Unknown';
            $variant = $fruitCrop?->variant ?? 'N/A';
            $farmName = $farm?->name ?? 'Unknown';

            $totalPayoutsIdr = $investment->payouts->sum('net_amount_idr');
            $netIdr = $totalPayoutsIdr - $investment->amount_idr;
            $actualRoiPercent = $investment->amount_idr > 0
                ? round(($netIdr / $investment->amount_idr) * 100, 2)
                : 0;

            $rows[] = [
                'investmentId' => $investment->id,
                'treeIdentifier' => $treeIdentifier,
                'fruitType' => $fruitTypeName,
                'variant' => $variant,
                'farmName' => $farmName,
                'amountInvestedIdr' => $investment->amount_idr,
                'totalPayoutsIdr' => $totalPayoutsIdr,
                'netIdr' => $netIdr,
                'actualRoiPercent' => $actualRoiPercent,
                'status' => $investment->status->value,
                'purchaseDate' => $investment->purchase_date->toDateString(),
            ];

            $totalInvested += $investment->amount_idr;
            $totalPayouts += $totalPayoutsIdr;
        }

        return [
            'rows' => $rows,
            'summary' => [
                'totalInvestedIdr' => $totalInvested,
                'totalPayoutsIdr' => $totalPayouts,
                'netIdr' => $totalPayouts - $totalInvested,
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

        $payouts = \App\Models\Payout::with(['investment.tree.fruitCrop.farm', 'investment.lot.fruitCrop.farm'])
            ->where('investor_id', $user->id)
            ->where('status', PayoutStatus::Completed)
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->get();

        $investments = Investment::with(['tree.fruitCrop.farm', 'lot.fruitCrop.farm'])
            ->where('user_id', $user->id)
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->get();

        $incomeRows = [];
        $totalIncome = 0;

        foreach ($payouts as $payout) {
            $farmName = $payout->investment->tree?->fruitCrop?->farm?->name
                ?? $payout->investment->lot?->fruitCrop?->farm?->name
                ?? 'Unknown';

            $incomeRows[] = [
                'payoutId' => $payout->id,
                'date' => $payout->completed_at->toDateString(),
                'farmName' => $farmName,
                'grossAmountIdr' => $payout->gross_amount_idr,
                'platformFeeIdr' => $payout->platform_fee_idr,
                'netAmountIdr' => $payout->net_amount_idr,
            ];
            $totalIncome += $payout->net_amount_idr;
        }

        $investmentRows = [];
        $totalInvested = 0;

        foreach ($investments as $investment) {
            $farmName = $investment->tree?->fruitCrop?->farm?->name
                ?? $investment->lot?->fruitCrop?->farm?->name
                ?? 'Unknown';

            $investmentRows[] = [
                'investmentId' => $investment->id,
                'date' => $investment->purchase_date->toDateString(),
                'farmName' => $farmName,
                'amountIdr' => $investment->amount_idr,
            ];
            $totalInvested += $investment->amount_idr;
        }

        return [
            'year' => $year,
            'income' => [
                'rows' => $incomeRows,
                'totalIdr' => $totalIncome,
            ],
            'investments' => [
                'rows' => $investmentRows,
                'totalIdr' => $totalInvested,
            ],
            'summary' => [
                'totalIncomeIdr' => $totalIncome,
                'totalInvestedIdr' => $totalInvested,
                'netIdr' => $totalIncome - $totalInvested,
            ],
        ];
    }

    public function getPerformanceData(User $user, array $filters = []): array
    {
        $query = Investment::with([
            'tree.fruitCrop.farm',
            'lot.fruitCrop.farm',
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
            if (! $investment->purchase_date) {
                continue;
            }

            $month = $investment->purchase_date->format('Y-m');
            if (! isset($byMonth[$month])) {
                $byMonth[$month] = [
                    'month' => $month,
                    'investedIdr' => 0,
                    'payoutsIdr' => 0,
                ];
            }
            $byMonth[$month]['investedIdr'] += $investment->amount_idr;

            foreach ($investment->payouts as $payout) {
                if (! $payout->completed_at) {
                    continue;
                }
                $payoutMonth = $payout->completed_at->format('Y-m');
                if (! isset($byMonth[$payoutMonth])) {
                    $byMonth[$payoutMonth] = [
                        'month' => $payoutMonth,
                        'investedIdr' => 0,
                        'payoutsIdr' => 0,
                    ];
                }
                $byMonth[$payoutMonth]['payoutsIdr'] += $payout->net_amount_idr;
            }
        }

        ksort($byMonth);

        $cumulative = 0;
        $dataPoints = [];
        foreach ($byMonth as $monthData) {
            $cumulative += $monthData['payoutsIdr'] - $monthData['investedIdr'];
            $dataPoints[] = [
                'month' => $monthData['month'],
                'investedIdr' => $monthData['investedIdr'],
                'payoutsIdr' => $monthData['payoutsIdr'],
                'cumulativeIdr' => $cumulative,
            ];
        }

        return $dataPoints;
    }
}
