import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    PageProps,
    PortfolioSummary,
    DiversificationData,
    HarvestEvent,
    PerformanceMetrics,
    PaginatedInvestments,
} from '@/types';
import PortfolioSummaryCard from '@/Components/Portfolio/PortfolioSummaryCard';
import HarvestCalendar from '@/Components/Portfolio/HarvestCalendar';
import DiversificationChart from '@/Components/Portfolio/DiversificationChart';
import PerformanceChart from '@/Components/Portfolio/PerformanceChart';
import InvestmentCard from '@/Components/Portfolio/InvestmentCard';
import EmptyPortfolio from '@/Components/Portfolio/EmptyPortfolio';

interface Props extends PageProps {
    summary: PortfolioSummary;
    diversification: {
        by_fruit_type: DiversificationData[];
        by_farm: DiversificationData[];
        by_risk: DiversificationData[];
    };
    performance: PerformanceMetrics;
    upcomingHarvests: HarvestEvent[];
    investments: PaginatedInvestments;
}

function formatCurrency(cents: number): string {
    return 'RM ' + (cents / 100).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard({
    auth,
    summary,
    diversification,
    performance,
    upcomingHarvests,
    investments,
}: Props) {
    const hasInvestments = summary.tree_count > 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Portfolio
                </h2>
            }
        >
            <Head title="My Portfolio" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {!hasInvestments ? (
                        <EmptyPortfolio />
                    ) : (
                        <>
                            <PortfolioSummaryCard summary={summary} formatCurrency={formatCurrency} />

                            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <HarvestCalendar
                                    harvests={upcomingHarvests}
                                />
                                <DiversificationChart
                                    data={diversification}
                                />
                            </div>

                            <div className="mt-6">
                                <PerformanceChart
                                    performance={performance}
                                    formatCurrency={formatCurrency}
                                />
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        My Investments
                                    </h3>
                                    {investments.last_page > 1 && (
                                        <Link
                                            href="/investments"
                                            className="text-sm text-green-600 hover:text-green-700"
                                        >
                                            View All ({investments.total})
                                        </Link>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {investments.data.map((investment) => (
                                        <InvestmentCard
                                            key={investment.id}
                                            investment={investment}
                                            formatCurrency={formatCurrency}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
