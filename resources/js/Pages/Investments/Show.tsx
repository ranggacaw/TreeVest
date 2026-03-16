import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps, LocationHierarchyData, TreeGrowthTimeline } from '@/types';
import { useTranslation } from 'react-i18next';
import { IconTree, IconDollar, IconChart, IconCalendar, IconArrowLeft, IconCheck, IconX } from '@/Components/Icons/AppIcons';
import { formatRupiah } from '@/utils/currency';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LocationHierarchy from '@/Components/LocationHierarchy';
import TreeLocationMap from '@/Components/TreeLocationMap';
import GrowthTimeline from '@/Components/GrowthTimeline';

interface HarvestData {
    id: number;
    harvest_date: string;
    estimated_yield_kg: number;
    actual_yield_kg?: number | null;
    quality_grade?: string;
    notes?: string;
}

interface PayoutData {
    id: number;
    gross_amount_idr: number;
    gross_amount_formatted: string;
    platform_fee_idr: number;
    platform_fee_formatted: string;
    net_amount_idr: number;
    net_amount_formatted: string;
    status: string;
    status_label: string;
    currency: string;
    harvest?: {
        id: number;
        harvest_date: string;
    };
    completed_at?: string;
    failed_at?: string;
    failed_reason?: string;
}

interface InvestmentData {
    id: number;
    amount_idr: number;
    formatted_amount: string;
    status: string;
    status_label?: string;
    purchase_date: string;
    created_at?: string;
    current_value_idr: number;
    projected_return_idr: number;
    investment_type: 'tree' | 'lot';
    tree?: {
        id: number;
        identifier: string;
        token_id?: string;
        price_idr?: number;
        price_formatted?: string;
        expected_roi: number;
        risk_rating: string;
        age_years?: number;
        productive_lifespan_years?: number;
        status?: string;
        latitude?: number;
        longitude?: number;
        qr_code?: string;
    };
    lot?: {
        id: number;
        name: string;
        total_trees: number;
        current_price_per_tree_idr: number;
        current_price_formatted: string;
        status?: string;
        cycle_started_at?: string;
        cycle_months?: number;
    };
    fruit_crop?: {
        variant: string;
        fruit_type: {
            name: string;
        };
        harvest_cycle?: string;
        farm: {
            id: number;
            name: string;
            location?: string;
            city?: string;
            state?: string;
            country?: string;
        };
    };
    harvests?: {
        completed: HarvestData[];
        upcoming: HarvestData[];
    };
    payouts?: PayoutData[];
    transaction?: {
        id: number;
        status: string;
        stripe_payment_intent_id?: string;
    };
    location_hierarchy?: LocationHierarchyData;
    growth_timeline?: TreeGrowthTimeline[];
}

interface Props extends PageProps {
    investment: InvestmentData;
}

export default function Show({ auth, investment, unread_notifications_count }: Props) {
    const { t } = useTranslation(['investments', 'translation']);
    const { delete: destroy, processing } = useForm();

    // Helper function to get investment identifier
    const getIdentifier = () => {
        if (investment.investment_type === 'tree' && investment.tree) {
            return investment.tree.identifier;
        } else if (investment.investment_type === 'lot' && investment.lot) {
            return investment.lot.name;
        }
        return 'Unknown';
    };

    // Helper to get expected ROI
    const getExpectedRoi = () => {
        if (investment.investment_type === 'tree' && investment.tree) {
            return investment.tree.expected_roi;
        }
        return 0;
    };

    // Helper to get risk rating
    const getRiskRating = () => {
        if (investment.investment_type === 'tree' && investment.tree) {
            return investment.tree.risk_rating;
        }
        return 'medium';
    };

    // Helper to get age/lifespan info
    const getAgeInfo = () => {
        if (investment.investment_type === 'tree' && investment.tree) {
            return {
                age: investment.tree.age_years,
                lifespan: investment.tree.productive_lifespan_years,
            };
        } else if (investment.investment_type === 'lot' && investment.lot) {
            return {
                age: investment.lot.cycle_started_at
                    ? Math.floor((new Date().getTime() - new Date(investment.lot.cycle_started_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
                    : 0,
                lifespan: investment.lot.cycle_months,
            };
        }
        return { age: 0, lifespan: 0 };
    };

    // Helper to get GPS coordinates
    const getGpsCoordinates = () => {
        if (investment.investment_type === 'tree' && investment.tree) {
            return { latitude: investment.tree.latitude, longitude: investment.tree.longitude };
        }
        return null;
    };

    const handleCancel = () => {
        if (confirm(t('confirm_cancel_investment'))) {
            destroy(`/investments/${investment.id}/cancel`);
        }
    };

    const statusColors: Record<string, string> = {
        pending_payment: 'bg-warning-50 text-warning-700',
        active: 'bg-success-50 text-success-700',
        listed: 'bg-blue-50 text-blue-700',
        matured: 'bg-indigo-50 text-indigo-700',
        sold: 'bg-purple-50 text-purple-700',
        cancelled: 'bg-danger-50 text-danger-700',
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppShellLayout>
            <Head title={t('investment_number', { id: investment.id })} />

            <div className="relative w-full max-w-md bg-bg flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unread_notifications_count} />

                    {/* Back Navigation */}
                    <div className="bg-card px-6 pt-4 pb-2">
                        <Link href={route('portfolio.dashboard')} className="inline-flex items-center text-sm text-textSecondary hover:text-primary transition-colors">
                            {t('back_to_portfolio', 'Back to Portfolio')}
                        </Link>
                    </div>

                    {/* Header Section */}
                    <div className="bg-card px-6 pb-6 pt-2">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-text">
                                    {getIdentifier()}
                                </h2>
                                <p className="text-sm text-textSecondary">{investment.fruit_crop?.farm?.name || 'Unknown Farm'}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[investment.status] || 'bg-bg text-textSecondary'}`}>
                                {investment.status_label || investment.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-3 bg-bg rounded-xl border border-border">
                                <p className="text-xs text-textSecondary mb-1">{t('current_value')}</p>
                                <p className="font-bold text-text">{formatRupiah(investment.current_value_idr)}</p>
                            </div>
                            <div className="p-3 bg-bg rounded-xl border border-border">
                                <p className="text-xs text-textSecondary mb-1">{t('projected_return')}</p>
                                <p className="font-bold text-primary">{formatRupiah(investment.projected_return_idr)}</p>
                            </div>
                            <div className="p-3 bg-bg rounded-xl border border-border">
                                <p className="text-xs text-textSecondary mb-1">{t('amount_invested')}</p>
                                <p className="font-semibold text-text">{investment.formatted_amount}</p>
                            </div>
                            <div className="p-3 bg-bg rounded-xl border border-border">
                                <p className="text-xs text-textSecondary mb-1">ROI</p>
                                <p className="font-semibold text-primary">{getExpectedRoi()}%</p>
                            </div>
                        </div>

                        {/* Actions */}
                        {investment.status === 'pending_payment' && (
                            <PrimaryButton
                                onClick={handleCancel}
                                disabled={processing}
                                className="w-full justify-center bg-danger hover:bg-danger-600 py-3 rounded-xl"
                            >
                                {processing ? t('cancelling') : t('cancel_investment')}
                            </PrimaryButton>
                        )}

                        {investment.status === 'active' && (
                            <div className="flex gap-3">
                                <Link
                                    href={`/investments/${investment.id}/top-up`}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-3 bg-primary border border-transparent rounded-xl font-semibold text-sm text-white hover:bg-primary-dark transition-colors shadow-card"
                                >
                                    {t('top_up_investment', 'Top Up')}
                                </Link>
                                <Link
                                    href={`/secondary-market/create?investment_id=${investment.id}`}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-3 bg-card border border-border rounded-xl font-semibold text-sm text-text hover:bg-bg transition-colors shadow-card"
                                >
                                    {t('list_for_sale', 'Sell')}
                                </Link>
                            </div>
                        )}

                        {investment.status === 'listed' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                                <p className="text-sm text-blue-800 font-medium mb-3">
                                    {t('listed_for_sale_message')}
                                </p>
                                <Link
                                    href="/secondary-market"
                                    className="inline-flex justify-center items-center px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white uppercase tracking-wider hover:bg-blue-700"
                                >
                                    {t('view_listings')}
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="h-3 bg-bg" />

                    {/* Tree Details */}
                    <div className="bg-card p-6">
                        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <IconTree className="w-5 h-5 text-primary" />
                            {investment.investment_type === 'tree' ? t('tree_details') : t('lot_details', 'Lot Details')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-sm text-textSecondary">{t('variant')}</span>
                                <span className="text-sm font-medium text-text">{investment.fruit_crop?.variant || '-'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-sm text-textSecondary">{t('fruit_type')}</span>
                                <span className="text-sm font-medium text-text">{investment.fruit_crop?.fruit_type?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-sm text-textSecondary">{t('age')}</span>
                                <span className="text-sm font-medium text-text">{getAgeInfo().age} {t('month')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-sm text-textSecondary">{t('risk_rating')}</span>
                                <span className="text-sm font-medium text-text capitalize">{getRiskRating()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-sm text-textSecondary">{t('harvest_cycle')}</span>
                                <span className="text-sm font-medium text-text capitalize">{investment.fruit_crop?.harvest_cycle || '-'}</span>
                            </div>
                            {investment.investment_type === 'tree' && investment.tree?.token_id && (
                                <div className="flex justify-between py-2 border-b border-border">
                                    <span className="text-sm text-textSecondary">{t('token_id', 'Token ID')}</span>
                                    <span className="text-sm font-mono font-medium text-text">{investment.tree.token_id}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-sm text-textSecondary">{t('location')}</span>
                                <span className="text-sm font-medium text-text text-right max-w-[60%] truncate">
                                    {investment.fruit_crop?.farm?.location || investment.fruit_crop?.farm?.name || '-'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 pt-2">
                             <Link
                                href={investment.fruit_crop?.farm?.id ? `/farms/${investment.fruit_crop.farm.id}` : '#'}
                                className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center justify-center gap-1"
                            >
                                {t('view_full_farm_details')}
                            </Link>
                        </div>
                    </div>

                    <div className="h-3 bg-bg" />

                    {/* Location Hierarchy */}
                    {investment.location_hierarchy && (
                        <div className="bg-card p-6">
                            <h3 className="text-lg font-bold text-text mb-4">
                                {t('tree_location', 'Tree Location')}
                            </h3>
                            <LocationHierarchy
                                farm={investment.location_hierarchy.farm}
                                warehouse={investment.location_hierarchy.warehouse}
                                rack={investment.location_hierarchy.rack}
                                lot={investment.location_hierarchy.lot}
                                tree={investment.location_hierarchy.tree ? {
                                    id: investment.location_hierarchy.tree.id,
                                    tree_identifier: investment.location_hierarchy.tree.identifier,
                                } : undefined}
                                fruitCrop={investment.location_hierarchy.fruit_crop}
                                compact={false}
                            />
                        </div>
                    )}

                    {/* GPS Map (if coordinates available) */}
                    {(() => {
                        const coords = getGpsCoordinates();
                        return coords && coords.latitude && coords.longitude ? (
                            <>
                                <div className="h-3 bg-bg" />
                                <div className="bg-card p-6">
                                    <h3 className="text-lg font-bold text-text mb-4">
                                        {t('gps_location', 'GPS Location')}
                                    </h3>
                                    <TreeLocationMap
                                        latitude={coords.latitude}
                                        longitude={coords.longitude}
                                        treeName={`${getIdentifier()} - ${investment.fruit_crop?.farm?.name || 'Unknown Farm'}`}
                                        height={400}
                                        showDirections={true}
                                    />
                                </div>
                            </>
                        ) : null;
                    })()}

                    {/* Growth Timeline */}
                    {investment.growth_timeline && investment.growth_timeline.length > 0 && (
                        <>
                            <div className="h-3 bg-bg" />
                            <div className="bg-card p-6">
                                <h3 className="text-lg font-bold text-text mb-4">
                                    {t('growth_timeline', 'Growth Timeline')}
                                </h3>
                                <GrowthTimeline
                                    entries={investment.growth_timeline.map((entry) => ({
                                        id: entry.id,
                                        title: entry.title,
                                        description: entry.description,
                                        milestone_type: {
                                            value: entry.milestone_type,
                                            label: entry.milestone_type_label,
                                            icon: entry.milestone_type_icon,
                                            color: entry.milestone_type_color,
                                        },
                                        health_status: {
                                            value: entry.health_status,
                                            label: entry.health_status_label,
                                            icon: entry.health_status_icon,
                                            color: entry.health_status_color,
                                        },
                                        photos: entry.photos,
                                        tree_height_cm: entry.height_cm,
                                        trunk_diameter_cm: entry.trunk_diameter_cm,
                                        estimated_fruit_count: entry.fruit_count,
                                        recorded_date: entry.recorded_at,
                                        recorded_by: entry.author ? { name: entry.author.name } : undefined,
                                    }))}
                                />
                            </div>
                        </>
                    )}

                    <div className="h-3 bg-bg" />

                    {/* Harvest History & Upcoming */}
                    {investment.harvests && (
                        <div className="bg-card p-6">
                             <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                                <IconCalendar className="w-5 h-5 text-primary" />
                                {t('harvest_activity', 'Harvest Activity')}
                            </h3>
                            
                            {investment.harvests.upcoming.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">{t('upcoming_harvests')}</h4>
                                    <div className="space-y-3">
                                        {investment.harvests.upcoming.map((harvest) => (
                                            <div key={harvest.id} className="bg-bg rounded-xl p-3 border border-border flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-bold text-text">{formatDate(harvest.harvest_date)}</p>
                                                    <p className="text-xs text-textSecondary">{t('est_yield')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-primary">{harvest.estimated_yield_kg} kg</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {investment.harvests.completed.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">{t('harvest_history')}</h4>
                                    <div className="space-y-3">
                                        {investment.harvests.completed.map((harvest) => (
                                            <div key={harvest.id} className="bg-card rounded-xl p-3 border border-border shadow-card">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-bold text-text">{formatDate(harvest.harvest_date)}</span>
                                                    <span className="text-xs font-semibold bg-success-50 text-success-700 px-2 py-0.5 rounded">
                                                        {harvest.quality_grade || 'Grade A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-textSecondary">{t('actual_yield')}:</span>
                                                    <span className="font-medium text-text">{harvest.actual_yield_kg ?? '-'} kg</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {investment.harvests.upcoming.length === 0 && investment.harvests.completed.length === 0 && (
                                <p className="text-sm text-textSecondary italic text-center py-4">{t('no_harvest_activity', 'No harvest activity yet.')}</p>
                            )}
                        </div>
                    )}

                    <div className="h-3 bg-bg" />

                    {/* Payouts */}
                    {investment.payouts && investment.payouts.length > 0 && (
                        <div className="bg-card p-6">
                            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                                <IconDollar className="w-5 h-5 text-primary" />
                                {t('payout_history')}
                            </h3>
                            <div className="space-y-3">
                                {investment.payouts.map((payout) => (
                                    <div key={payout.id} className="bg-card rounded-xl p-4 border border-border shadow-card">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-bold text-text">
                                                    {payout.harvest ? formatDate(payout.harvest.harvest_date) : 'Unknown Date'}
                                                </p>
                                                <p className="text-xs text-textSecondary">{t('net_amount')}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                                payout.status === 'completed' ? 'bg-success-50 text-success-700' :
                                                payout.status === 'failed' ? 'bg-danger-50 text-danger-700' :
                                                'bg-warning-50 text-warning-700'
                                            }`}>
                                                {payout.status_label}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            {payout.net_amount_formatted}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs text-textSecondary">
                                            <span>{t('gross')}: {payout.gross_amount_formatted}</span>
                                            <span>{t('fee')}: {payout.platform_fee_formatted}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                <BottomNav />
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </AppShellLayout>
    );
}
