interface ProfitLossRow {
    investmentId: number;
    treeIdentifier: string;
    fruitType: string;
    variant: string;
    farmName: string;
    amountInvestedIdr: number;
    totalPayoutsIdr: number;
    netIdr: number;
    actualRoiPercent: number;
    status: string;
    purchaseDate: string;
}

interface ProfitLossTableProps {
    rows: ProfitLossRow[];
    summary: {
        totalInvestedIdr: number;
        totalPayoutsIdr: number;
        netIdr: number;
        overallRoiPercent: number;
    };
}

export default function ProfitLossTable({ rows, summary }: ProfitLossTableProps) {
    const formatCurrency = (idr: number) => {
        return `Rp ${idr.toLocaleString('id-ID')}`;
    };

    const formatPercent = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Investment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Tree
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Farm
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Invested
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Payouts
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Net
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            ROI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Purchase Date
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {rows.map((row) => (
                        <tr key={row.investmentId}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                {row.investmentId}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                <div>
                                    <div className="font-medium">
                                        {row.treeIdentifier}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {row.fruitType} - {row.variant}
                                    </div>
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                {row.farmName}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                {formatCurrency(row.amountInvestedIdr)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                {formatCurrency(row.totalPayoutsIdr)}
                            </td>
                            <td
                                className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${row.netIdr >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                            >
                                {formatCurrency(row.netIdr)}
                            </td>
                            <td
                                className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${row.actualRoiPercent >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                            >
                                {formatPercent(row.actualRoiPercent)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold uppercase text-gray-800">
                                    {row.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                {row.purchaseDate}
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                        <td
                            colSpan={3}
                            className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                        >
                            <strong>Total</strong>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                            {formatCurrency(summary.totalInvestedIdr)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                            {formatCurrency(summary.totalPayoutsIdr)}
                        </td>
                        <td
                            className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${summary.netIdr >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                        >
                            {formatCurrency(summary.netIdr)}
                        </td>
                        <td
                            className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${summary.overallRoiPercent >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                        >
                            {formatPercent(summary.overallRoiPercent)}
                        </td>
                        <td colSpan={2}></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
