<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Profit & Loss Report</title>
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
    </style>
</head>

<body>
    <div class="header">
        <h1>Profit & Loss Report</h1>
        <div class="meta">
            <p>Generated: {{ $data['generatedAt'] }}</p>
            <p>Investor: {{ $data['user']->name }} ({{ $data['user']->email }})</p>
            @if(!empty($data['filters']))
                <p>Filters:
                    @if(!empty($data['filters']['from'])) {{ 'From: ' . $data['filters']['from'] }} @endif
                    @if(!empty($data['filters']['to'])) {{ 'To: ' . $data['filters']['to'] }} @endif
                    @if(!empty($data['filters']['farm_id'])) {{ 'Farm ID: ' . $data['filters']['farm_id'] }} @endif
                </p>
            @endif
        </div>
    </div>

    <div class="summary-box">
        <h2>Portfolio Summary</h2>
        <div class="summary-row">
            <span class="summary-label">Total Invested:</span>
            <span>Rp {{ number_format($data['profitLoss']['summary']['totalInvestedCents'] / 100, 2) }}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Total Payouts Received:</span>
            <span>Rp {{ number_format($data['profitLoss']['summary']['totalPayoutsCents'] / 100, 2) }}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Net Return:</span>
            <span class="{{ $data['profitLoss']['summary']['netCents'] >= 0 ? 'positive' : 'negative' }}">
                Rp {{ number_format($data['profitLoss']['summary']['netCents'] / 100, 2) }}
            </span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Overall ROI:</span>
            <span class="{{ $data['profitLoss']['summary']['overallRoiPercent'] >= 0 ? 'positive' : 'negative' }}">
                {{ number_format($data['profitLoss']['summary']['overallRoiPercent'], 2) }}%
            </span>
        </div>
    </div>

    <h2>Investment Details</h2>
    <table>
        <thead>
            <tr>
                <th>Investment ID</th>
                <th>Tree Identifier</th>
                <th>Fruit Type</th>
                <th>Variant</th>
                <th>Farm Name</th>
                <th>Invested (Rp)</th>
                <th>Payouts (Rp)</th>
                <th>Net (Rp)</th>
                <th>ROI (%)</th>
                <th>Status</th>
                <th>Purchase Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['profitLoss']['rows'] as $row)
                <tr>
                    <td>{{ $row['investmentId'] }}</td>
                    <td>{{ $row['treeIdentifier'] }}</td>
                    <td>{{ $row['fruitType'] }}</td>
                    <td>{{ $row['variant'] }}</td>
                    <td>{{ $row['farmName'] }}</td>
                    <td>{{ number_format($row['amountInvestedCents'] / 100, 2) }}</td>
                    <td>{{ number_format($row['totalPayoutsCents'] / 100, 2) }}</td>
                    <td class="{{ $row['netCents'] >= 0 ? 'positive' : 'negative' }}">
                        {{ number_format($row['netCents'] / 100, 2) }}
                    </td>
                    <td class="{{ $row['actualRoiPercent'] >= 0 ? 'positive' : 'negative' }}">
                        {{ number_format($row['actualRoiPercent'], 2) }}%
                    </td>
                    <td>{{ ucfirst($row['status']) }}</td>
                    <td>{{ $row['purchaseDate'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="disclaimer">
        <p><strong>Disclaimer:</strong> This report is generated by Treevest for informational purposes only. All
            financial figures are based on actual investment and payout data recorded in the platform. Past performance
            is not indicative of future results. This report should not be considered as financial or investment advice.
            For tax purposes, please consult with a qualified tax professional. The data in this report is accurate as
            of the generation timestamp.</p>
    </div>
</body>

</html>