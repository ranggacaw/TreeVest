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
    gross_amount_cents: number;
    gross_amount_formatted: string;
    platform_fee_cents: number;
    platform_fee_formatted: string;
    net_amount_cents: number;
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
    amount_cents: number;
    formatted_amount: string;
    status: string;
    status_label?: string;
    purchase_date: string;
    created_at?: string;
    current_value_cents: number;
    projected_return_cents: number;
    tree: {
        id: number;
        identifier: string;
        price_cents?: number;
        price_formatted?: string;
        expected_roi: number;
        risk_rating: string;
        age_years?: number;
        productive_lifespan_years?: number;
        status?: string;
        latitude?: number;
        longitude?: number;
        qr_code?: string;
        fruit_crop: {
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
        lot?: {
            id: number;
            name: string;
            status: string;
            total_trees: number;
            rack?: {
                id: number;
                name: string;
                description?: string;
                warehouse?: {
                    id: number;
                    name: string;
                    description?: string;
                };
            };
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

    const handleCancel = () => {
        if (confirm(t('confirm_cancel_investment'))) {
            destroy(`/investments/${investment.id}/cancel`);
        }
    };

    const statusColors: Record<string, string> = {
        pending_payment: 'bg-amber-100 text-amber-800',
        active: 'bg-emerald-100 text-emerald-800',
        listed: 'bg-blue-100 text-blue-800',
        matured: 'bg-indigo-100 text-indigo-800',
        sold: 'bg-purple-100 text-purple-800',
        cancelled: 'bg-red-100 text-red-800',
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

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unread_notifications_count} />

                    {/* Back Navigation */}
                    <div className="bg-white px-6 pt-4 pb-2">
                        <Link href={route('portfolio.dashboard')} className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                            <IconArrowLeft className="w-4 h-4 mr-1" />
                            {t('back_to_portfolio', 'Back to Portfolio')}
                        </Link>
                    </div>

                    {/* Header Section */}
                    <div className="bg-white px-6 pb-6 pt-2">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {investment.tree.identifier}
                                </h2>
                                <p className="text-sm text-gray-500">{investment.tree.fruit_crop.farm.name}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[investment.status] || 'bg-gray-100 text-gray-800'}`}>
                                {investment.status_label || investment.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('current_value')}</p>
                                <p className="font-bold text-gray-900">{formatRupiah(investment.current_value_cents)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('projected_return')}</p>
                                <p className="font-bold text-emerald-600">{formatRupiah(investment.projected_return_cents)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('amount_invested')}</p>
                                <p className="font-semibold text-gray-900">{investment.formatted_amount}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('expected_roi', 'ROI')}</p>
                                <p className="font-semibold text-emerald-600">{investment.tree.expected_roi}%</p>
                            </div>
                        </div>

                        {/* Actions */}
                        {investment.status === 'pending_payment' && (
                            <PrimaryButton
                                onClick={handleCancel}
                                disabled={processing}
                                className="w-full justify-center bg-red-600 hover:bg-red-700 py-3 rounded-xl"
                            >
                                {processing ? t('cancelling') : t('cancel_investment')}
                            </PrimaryButton>
                        )}

                        {investment.status === 'active' && (
                            <div className="flex gap-3">
                                <Link
                                    href={`/investments/${investment.id}/top-up`}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-3 bg-emerald-600 border border-transparent rounded-xl font-semibold text-sm text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    {t('top_up_investment', 'Top Up')}
                                </Link>
                                <Link
                                    href={`/secondary-market/create?investment_id=${investment.id}`}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
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

                    <div className="h-3 bg-gray-50" />

                    {/* Tree Details */}
                    <div className="bg-white p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <IconTree className="w-5 h-5 text-emerald-600" />
                            {t('tree_details')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">{t('variant')}</span>
                                <span className="text-sm font-medium text-gray-900">{investment.tree.fruit_crop.variant}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">{t('fruit_type')}</span>
                                <span className="text-sm font-medium text-gray-900">{investment.tree.fruit_crop.fruit_type.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">{t('age')}</span>
                                <span className="text-sm font-medium text-gray-900">{investment.tree.age_years} {t('years')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">{t('risk_rating')}</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{investment.tree.risk_rating}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">{t('harvest_cycle')}</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{investment.tree.fruit_crop.harvest_cycle}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">{t('location')}</span>
                                <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">
                                    {investment.tree.fruit_crop.farm.location || investment.tree.fruit_crop.farm.name}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 pt-2">
                             <Link
                                href={`/farms/${investment.tree.fruit_crop.farm.id}`}
                                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1"
                            >
                                {t('view_full_farm_details')}
                                <IconCheck className="w-4 h-4 rotate-90" /> {/* Using generic icon as placeholder for arrow-right if not available */}
                            </Link>
                        </div>
                    </div>

                    <div className="h-3 bg-gray-50" />

                    {/* Location Hierarchy */}
                    {investment.location_hierarchy && (
                        <div className="bg-white p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                {t('tree_location', 'Tree Location')}
                            </h3>
                            <LocationHierarchy
                                farm={investment.location_hierarchy.farm}
                                warehouse={investment.location_hierarchy.warehouse}
                                rack={investment.location_hierarchy.rack}
                                lot={investment.location_hierarchy.lot}
                                tree={{
                                    id: investment.location_hierarchy.tree.id,
                                    tree_identifier: investment.location_hierarchy.tree.identifier,
                                }}
                                fruitCrop={investment.location_hierarchy.fruit_crop}
                                compact={false}
                            />
                        </div>
                    )}

                    {/* GPS Map (if coordinates available) */}
                    {investment.tree.latitude && investment.tree.longitude && (
                        <>
                            <div className="h-3 bg-gray-50" />
                            <div className="bg-white p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    {t('gps_location', 'GPS Location')}
                                </h3>
                                <TreeLocationMap
                                    latitude={investment.tree.latitude}
                                    longitude={investment.tree.longitude}
                                    treeName={`${investment.tree.identifier} - ${investment.tree.fruit_crop.farm.name}`}
                                    height={400}
                                    showDirections={true}
                                />
                            </div>
                        </>
                    )}

                    {/* Growth Timeline */}
                    {investment.growth_timeline && investment.growth_timeline.length > 0 && (
                        <>
                            <div className="h-3 bg-gray-50" />
                            <div className="bg-white p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
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

                    <div className="h-3 bg-gray-50" />

                    {/* Harvest History & Upcoming */}
                    {investment.harvests && (
                        <div className="bg-white p-6">
                             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <IconCalendar className="w-5 h-5 text-emerald-600" />
                                {t('harvest_activity', 'Harvest Activity')}
                            </h3>
                            
                            {investment.harvests.upcoming.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('upcoming_harvests')}</h4>
                                    <div className="space-y-3">
                                        {investment.harvests.upcoming.map((harvest) => (
                                            <div key={harvest.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{formatDate(harvest.harvest_date)}</p>
                                                    <p className="text-xs text-gray-500">{t('est_yield')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-emerald-600">{harvest.estimated_yield_kg} kg</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {investment.harvests.completed.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('harvest_history')}</h4>
                                    <div className="space-y-3">
                                        {investment.harvests.completed.map((harvest) => (
                                            <div key={harvest.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-bold text-gray-900">{formatDate(harvest.harvest_date)}</span>
                                                    <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                                        {harvest.quality_grade || 'Grade A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">{t('actual_yield')}:</span>
                                                    <span className="font-medium text-gray-900">{harvest.actual_yield_kg ?? '-'} kg</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {investment.harvests.upcoming.length === 0 && investment.harvests.completed.length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center py-4">{t('no_harvest_activity', 'No harvest activity yet.')}</p>
                            )}
                        </div>
                    )}

                    <div className="h-3 bg-gray-50" />

                    {/* Payouts */}
                    {investment.payouts && investment.payouts.length > 0 && (
                        <div className="bg-white p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <IconDollar className="w-5 h-5 text-emerald-600" />
                                {t('payout_history')}
                            </h3>
                            <div className="space-y-3">
                                {investment.payouts.map((payout) => (
                                    <div key={payout.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {payout.harvest ? formatDate(payout.harvest.harvest_date) : 'Unknown Date'}
                                                </p>
                                                <p className="text-xs text-gray-500">{t('net_amount')}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                                payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                payout.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {payout.status_label}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-emerald-600">
                                            {payout.net_amount_formatted}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between text-xs text-gray-400">
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
