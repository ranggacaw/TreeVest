<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Tax Summary Report</title>
    <style>
        body {
            font-family: serif;
            font-size: 10pt;
            color: #333;
        }

        h1 {
            font-size: 16pt;
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 8px;
        }

        h2 {
            font-size: 12pt;
            color: #4b5563;
            margin-top: 20px;
        }

        .header {
            margin-bottom: 30px;
        }

        .summary-box {
            background-color: #f3f4f6;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #1e40af;
        }

        .summary-row {
            margin: 5px 0;
        }

        .summary-label {
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        th {
            background-color: #1e40af;
            color: white;
            padding: 8px;
            text-align: left;
            font-size: 9pt;
        }

        td {
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
        }

        tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .positive {
            color: #059669;
            font-weight: bold;
        }

        .negative {
            color: #dc2626;
            font-weight: bold;
        }

        .disclaimer {
            font-size: 8pt;
            color: #6b7280;
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }

        .meta {
            font-size: 9pt;
            color: #6b7280;
            margin-bottom: 20px;
        }

        .total-row {
            background-color: #e5e7eb;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Tax Summary Report - {{ $data['year'] }}</h1>
        <div class="meta">
            <p>Generated: {{ $data['generatedAt'] }}</p>
            <p>Investor: {{ $data['user']->name }} ({{ $data['user']->email }})</p>
        </div>
    </div>

    <h2>Income (Payouts)</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Farm Name</th>
                <th>Gross Amount (Rp)</th>
                <th>Platform Fee (Rp)</th>
                <th>Net Amount (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['taxSummary']['income']['rows'] as $row)
                <tr>
                    <td>{{ $row['date'] }}</td>
                    <td>{{ $row['farmName'] }}</td>
                    <td>{{ number_format($row['grossAmountIdr'] / 100, 2) }}</td>
                    <td>{{ number_format($row['platformFeeIdr'] / 100, 2) }}</td>
                    <td>{{ number_format($row['netAmountIdr'] / 100, 2) }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="2"><strong>Total Income</strong></td>
                <td>{{ number_format(array_sum(array_column($data['taxSummary']['income']['rows'], 'grossAmountIdr')) / 100, 2) }}
                </td>
                <td>{{ number_format(array_sum(array_column($data['taxSummary']['income']['rows'], 'platformFeeIdr')) / 100, 2) }}
                </td>
                <td>{{ number_format($data['taxSummary']['income']['totalIdr'] / 100, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <h2>Investment Activity</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Farm Name</th>
                <th>Amount (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['taxSummary']['investments']['rows'] as $row)
                <tr>
                    <td>{{ $row['date'] }}</td>
                    <td>{{ $row['farmName'] }}</td>
                    <td>{{ number_format($row['amountIdr'] / 100, 2) }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="2"><strong>Total Investments</strong></td>
                <td>{{ number_format($data['taxSummary']['investments']['totalIdr'] / 100, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="summary-box">
        <h2>Summary</h2>
        <div class="summary-row">
            <span class="summary-label">Total Income (Payouts):</span>
            <span>Rp {{ number_format($data['taxSummary']['summary']['totalIncomeIdr'] / 100, 2) }}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Total Investments:</span>
            <span>Rp {{ number_format($data['taxSummary']['summary']['totalInvestedIdr'] / 100, 2) }}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Net:</span>
            <span class="{{ $data['taxSummary']['summary']['netIdr'] >= 0 ? 'positive' : 'negative' }}">
                Rp {{ number_format($data['taxSummary']['summary']['netIdr'] / 100, 2) }}
            </span>
        </div>
    </div>

    <div class="disclaimer">
        <p><strong>Disclaimer:</strong> This tax summary report is generated by Treevest for informational purposes
            only. It contains records of your investment activity and payouts received during the calendar year
            {{ $data['year'] }}. This report is NOT official tax advice and should not be used as a substitute for
            professional tax consultation. Tax laws and regulations vary by jurisdiction and may change over time.
            Please consult with a qualified tax professional or accountant to determine your actual tax obligations.
            Treevest assumes no liability for any errors or omissions in this report.</p>
    </div>
</body>

</html>