import { Link } from '@inertiajs/react';
import { PortfolioInvestment } from '@/types';

interface Props {
    investment: PortfolioInvestment;
    formatCurrency: (cents: number) => string;
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'productive':
            return 'bg-green-100 text-green-800';
        case 'growing':
            return 'bg-blue-100 text-blue-800';
        case 'seedling':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export default function InvestmentCard({ investment, formatCurrency }: Props) {
    const roiProgress = investment.projected_return_cents > 0
        ? Math.min((investment.actual_return_cents / investment.projected_return_cents) * 100, 100)
        : 0;

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-semibold text-gray-900">
                            {investment.tree.fruit_type}
                        </h4>
                        <p className="text-sm text-gray-500">
                            {investment.tree.variant} • Tree #{investment.tree.identifier}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.tree.status)}`}>
                        {investment.tree.status}
                    </span>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Investment</span>
                        <span className="font-medium text-gray-900">
                            {formatCurrency(investment.amount_cents)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Farm</span>
                        <span className="font-medium text-gray-900">
                            {investment.tree.farm_name}
                        </span>
                    </div>
                    {investment.next_harvest && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Next Harvest</span>
                            <span className="font-medium text-gray-900">
                                {new Date(investment.next_harvest).toLocaleDateString('en-MY', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Expected ROI</span>
                        <span className="font-medium text-gray-900">
                            {investment.tree.expected_roi_percent}%
                        </span>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>ROI Progress</span>
                        <span>{roiProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${roiProgress}%` }}
                        />
                    </div>
                </div>

                <Link
                    href={`/investments/${investment.id}`}
                    className="mt-4 block w-full text-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
