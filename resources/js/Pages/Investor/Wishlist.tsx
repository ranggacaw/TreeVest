import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import WishlistToggleButton from '@/Components/WishlistToggleButton';

interface WishlistTreeItem {
    wishlist_id: number;
    id: number;
    identifier: string;
    price_cents: number;
    expected_roi_percent: number;
    risk_rating: string;
    status: string;
    fruit_crop: {
        variant: string;
        fruit_type: string;
        harvest_cycle: string | null;
    };
    farm: {
        id: number;
        name: string;
    };
    added_at: string;
}

interface Props extends PageProps {
    items: WishlistTreeItem[];
}

export default function Wishlist({ auth, items }: Props) {
    const { t } = useTranslation('investments');

    if (items.length === 0) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {t('my_wishlist', { defaultValue: 'My Wishlist' })}
                    </h2>
                }
            >
                <Head title={t('my_wishlist', { defaultValue: 'My Wishlist' })} />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <svg
                                    className="mx-auto h-16 w-16 text-gray-300 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t('wishlist_empty_title', { defaultValue: 'Your wishlist is empty' })}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {t('wishlist_empty_desc', { defaultValue: 'Browse the marketplace and save trees you are interested in.' })}
                                </p>
                                <Link
                                    href={route('trees.index')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                >
                                    {t('browse_marketplace', { defaultValue: 'Browse Marketplace' })}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('my_wishlist', { defaultValue: 'My Wishlist' })} ({items.length})
                </h2>
            }
        >
            <Head title={t('my_wishlist', { defaultValue: 'My Wishlist' })} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {t('wishlist_count', { count: items.length, defaultValue: '{{count}} saved trees' })}
                        </p>
                        <Link
                            href={route('trees.index')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            {t('browse_more', { defaultValue: 'Browse more trees' })}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.wishlist_id}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                            >
                                {/* Card header */}
                                <div className="p-5 flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-0.5">
                                                {item.fruit_crop.fruit_type} — {item.fruit_crop.variant}
                                            </p>
                                            <p className="text-sm text-gray-500">{item.farm.name}</p>
                                        </div>
                                        <WishlistToggleButton
                                            treeId={item.id}
                                            isWishlisted={true}
                                            authenticated={true}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-0.5">
                                                {t('price_per_tree', { defaultValue: 'Price / tree' })}
                                            </p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {formatRupiah(item.price_cents)}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-0.5">
                                                {t('expected_roi_label', { defaultValue: 'Expected ROI' })}
                                            </p>
                                            <p className="text-sm font-bold text-green-700">
                                                {item.expected_roi_percent}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                                            item.status === 'productive'
                                                ? 'bg-green-100 text-green-700'
                                                : item.status === 'growing'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                                            item.risk_rating === 'low'
                                                ? 'bg-blue-100 text-blue-700'
                                                : item.risk_rating === 'medium'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-red-100 text-red-700'
                                        }`}>
                                            {item.risk_rating} {t('risk', { defaultValue: 'risk' })}
                                        </span>
                                        {item.fruit_crop.harvest_cycle && (
                                            <span className="text-gray-400 capitalize">
                                                {item.fruit_crop.harvest_cycle.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-3 text-xs text-gray-400">
                                        {t('added', { defaultValue: 'Added' })}{' '}
                                        {new Date(item.added_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Card actions */}
                                <div className="border-t border-gray-100 p-4 flex gap-2">
                                    <Link
                                        href={route('trees.show', item.id)}
                                        className="flex-1 text-center py-2 px-3 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        {t('view_details', { defaultValue: 'View Details' })}
                                    </Link>
                                    <Link
                                        href={route('investments.configure', item.id)}
                                        className="flex-1 text-center py-2 px-3 border border-indigo-600 text-indigo-600 text-sm font-medium rounded-md hover:bg-indigo-50 transition-colors"
                                    >
                                        {t('invest_now', { defaultValue: 'Invest Now' })}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
