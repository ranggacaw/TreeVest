import { PortfolioSummary } from '@/types';

interface Props {
    summary: PortfolioSummary;
    formatCurrency: (idr: number) => string;
}

export default function PortfolioSummaryCard({ summary, formatCurrency }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card overflow-hidden shadow-card sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-textSecondary">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-text">
                        {formatCurrency(summary.total_value_idr)}
                    </p>
                </div>
            </div>

            <div className="bg-card overflow-hidden shadow-card sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-textSecondary">Total Trees</p>
                    <p className="text-2xl font-bold text-text">
                        {summary.tree_count}
                    </p>
                </div>
            </div>

            <div className="bg-card overflow-hidden shadow-card sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-textSecondary">Average ROI</p>
                    <p className="text-2xl font-bold text-text">
                        {summary.average_roi_percent}%
                    </p>
                </div>
            </div>

            <div className="bg-card overflow-hidden shadow-card sm:rounded-lg">
                <div className="p-6">
                    <p className="text-sm text-textSecondary">Total Payouts</p>
                    <p className="text-2xl font-bold text-text">
                        {formatCurrency(summary.total_payouts_idr)}
                    </p>
                </div>
            </div>
        </div>
    );
}
