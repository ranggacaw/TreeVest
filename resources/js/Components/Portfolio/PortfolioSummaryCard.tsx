import { PortfolioSummary } from '@/types';

interface Props {
    summary: PortfolioSummary;
    formatCurrency: (cents: number) => string;
}

export default function PortfolioSummaryCard({ summary, formatCurrency }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-gray-500">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.total_value_cents)}
                    </p>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-gray-500">Total Trees</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {summary.tree_count}
                    </p>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-gray-500">Average ROI</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {summary.average_roi_percent}%
                    </p>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-gray-500">Total Payouts</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.total_payouts_cents)}
                    </p>
                </div>
            </div>
        </div>
    );
}
