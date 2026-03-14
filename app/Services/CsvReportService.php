<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Response;

class CsvReportService
{
    public function streamProfitLoss(User $user, array $filters = [])
    {
        $reportDataService = new ReportDataService;
        $data = $reportDataService->getProfitLossData($user, $filters);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="profit_loss_report.csv"',
        ];

        $callback = function () use ($data) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Investment ID',
                'Tree Identifier',
                'Fruit Type',
                'Variant',
                'Farm Name',
                'Amount Invested (cents)',
                'Total Payouts (cents)',
                'Net (cents)',
                'Actual ROI (%)',
                'Status',
                'Purchase Date',
            ]);

            foreach ($data['rows'] as $row) {
                fputcsv($handle, [
                    $row['investmentId'],
                    $row['treeIdentifier'],
                    $row['fruitType'],
                    $row['variant'],
                    $row['farmName'],
                    $row['amountInvestedIdr'],
                    $row['totalPayoutsIdr'],
                    $row['netIdr'],
                    $row['actualRoiPercent'],
                    $row['status'],
                    $row['purchaseDate'],
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['Total', '', '', '', '', $data['summary']['totalInvestedIdr'], $data['summary']['totalPayoutsIdr'], $data['summary']['netIdr'], $data['summary']['overallRoiPercent'], '', '']);

            fclose($handle);
        };

        return Response::stream($callback, 200, $headers);
    }

    public function streamTaxSummary(User $user, int $year)
    {
        $reportDataService = new ReportDataService;
        $data = $reportDataService->getTaxSummaryData($user, $year);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="tax_summary_'.$year.'.csv"',
        ];

        $callback = function () use ($data) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Tax Summary Report - '.$data['year']]);
            fputcsv($handle, []);
            fputcsv($handle, ['INCOME (PAYOUTS)']);
            fputcsv($handle, ['Date', 'Farm Name', 'Gross Amount (cents)', 'Platform Fee (cents)', 'Net Amount (cents)']);

            foreach ($data['income']['rows'] as $row) {
                fputcsv($handle, [
                    $row['date'],
                    $row['farmName'],
                    $row['grossAmountIdr'],
                    $row['platformFeeIdr'],
                    $row['netAmountIdr'],
                ]);
            }

            fputcsv($handle, ['Total', '', $data['income']['totalIdr'], '', $data['income']['totalIdr']]);
            fputcsv($handle, []);
            fputcsv($handle, ['INVESTMENTS']);
            fputcsv($handle, ['Date', 'Farm Name', 'Amount (cents)']);

            foreach ($data['investments']['rows'] as $row) {
                fputcsv($handle, [
                    $row['date'],
                    $row['farmName'],
                    $row['amountIdr'],
                ]);
            }

            fputcsv($handle, ['Total', '', $data['investments']['totalIdr']]);
            fputcsv($handle, []);
            fputcsv($handle, ['SUMMARY']);
            fputcsv($handle, ['Total Income', $data['summary']['totalIncomeIdr']]);
            fputcsv($handle, ['Total Investments', $data['summary']['totalInvestedIdr']]);
            fputcsv($handle, ['Net', $data['summary']['netIdr']]);

            fclose($handle);
        };

        return Response::stream($callback, 200, $headers);
    }
}
