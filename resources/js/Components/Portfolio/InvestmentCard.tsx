import { Link } from '@inertiajs/react';
import { PortfolioInvestment } from '@/types';

interface Props {
    investment: PortfolioInvestment;
    formatCurrency: (idr: number) => string;
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'productive':
            return 'bg-success-50 text-success-700';
        case 'growing':
            return 'bg-info-50 text-info-700';
        case 'seedling':
            return 'bg-warning-50 text-warning-700';
        default:
            return 'bg-bg text-text';
    }
}

export default function InvestmentCard({ investment, formatCurrency }: Props) {
    const roiProgress = investment.projected_return_idr > 0
        ? Math.min((investment.actual_return_idr / investment.projected_return_idr) * 100, 100)
        : 0;

    return (
        <div className="bg-card overflow-hidden shadow-card sm:rounded-lg hover:shadow-floating transition-shadow">
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-semibold text-text">
                            {investment.tree.fruit_type}
                        </h4>
                        <p className="text-sm text-textSecondary">
                            {investment.tree.variant} • Tree #{investment.tree.identifier}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.tree.status)}`}>
                        {investment.tree.status}
                    </span>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-textSecondary">Investment</span>
                        <span className="font-medium text-text">
                            {formatCurrency(investment.amount_idr)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-textSecondary">Farm</span>
                        <span className="font-medium text-text">
                            {investment.tree.farm_name}
                        </span>
                    </div>
                    {investment.next_harvest && (
                        <div className="flex justify-between">
                            <span className="text-textSecondary">Next Harvest</span>
                            <span className="font-medium text-text">
                                {new Date(investment.next_harvest).toLocaleDateString('en-MY', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-textSecondary">Expected ROI</span>
                        <span className="font-medium text-text">
                            {investment.tree.expected_roi_percent}%
                        </span>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="flex justify-between text-xs text-textSecondary mb-1">
                        <span>ROI Progress</span>
                        <span>{roiProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${roiProgress}%` }}
                        />
                    </div>
                </div>

                <Link
                    href={`/investments/${investment.id}`}
                    className="mt-4 block w-full text-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-dark"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
