import { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps, Tree, PaymentMethod } from '@/types';
import FinancialErrorBoundary from '@/Components/FinancialErrorBoundary';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';
import { IconArrowLeft, IconTree, IconDollar, IconCheck, IconInfoCircle } from '@/Components/Icons/AppIcons';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';

interface Props extends PageProps {
    tree: Tree;
    user: {
        kyc_verified: boolean;
    };
    payment_methods: PaymentMethod[];
}

export default function Configure({ auth, tree, user, payment_methods, unread_notifications_count }: Props) {
    const { t } = useTranslation('investments');
    const { props } = usePage<any>();
    const { flash } = props;

    // Derive min/max trees from investment limits and tree price
    const minTrees = useMemo(() => {
        if (!tree.price_idr || tree.price_idr === 0) return 1;
        return Math.ceil(tree.min_investment_idr / tree.price_idr);
    }, [tree.min_investment_idr, tree.price_idr]);

    const maxTrees = useMemo(() => {
        if (!tree.price_idr || tree.price_idr === 0) return 1;
        return Math.floor(tree.max_investment_idr / tree.price_idr);
    }, [tree.max_investment_idr, tree.price_idr]);

    const { data, setData, post, processing, errors } = useForm({
        tree_id: tree.id,
        quantity: minTrees,
        acceptance_risk_disclosure: false,
        acceptance_terms: false,
        payment_method_id: payment_methods.length > 0 ? payment_methods[0].id : '',
    });

    const [showRiskModal, setShowRiskModal] = useState(false);

    const totalIdr = data.quantity * tree.price_idr;
    const isValidQuantity = data.quantity >= minTrees && data.quantity <= maxTrees;

    const decrement = () => {
        if (data.quantity > minTrees) setData('quantity', data.quantity - 1);
    };

    const increment = () => {
        if (data.quantity < maxTrees) setData('quantity', data.quantity + 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidQuantity) {
            alert(t('invalid_amount_message'));
            return;
        }

        if (!data.acceptance_risk_disclosure || !data.acceptance_terms) {
            alert(t('validation_failed'));
            return;
        }

        post('/investments');
    };

    return (
        <AppShellLayout>
            <Head title={t('configure_investment')} />

            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
                    <AppTopBar notificationCount={unread_notifications_count} />

                    {/* Back Navigation */}
                    <div className="bg-white px-6 pt-4 pb-2">
                        <button onClick={() => window.history.back()} className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                            <IconArrowLeft className="w-4 h-4 mr-1" />
                            {t('back')}
                        </button>
                    </div>

                    <FinancialErrorBoundary context="investment-purchase-configure">
                        <div className="bg-white px-6 pb-6 pt-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <IconTree className="w-6 h-6 text-emerald-600" />
                                {t('invest_in_tree', { identifier: tree.identifier })}
                            </h2>

                            {flash?.error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" role="alert">
                                    {flash.error}
                                </div>
                            )}

                             {flash?.success && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm" role="alert">
                                    {flash.success}
                                </div>
                            )}

                            {/* Tree Details Card */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('farm')}</span>
                                    <span className="font-semibold text-gray-900">{tree.farm.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('fruit_type')}</span>
                                    <span className="font-semibold text-gray-900">{tree.fruit_crop.fruit_type} ({tree.fruit_crop.variant})</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('price_per_tree')}</span>
                                    <span className="font-semibold text-emerald-600">{formatRupiah(tree.price_idr)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('expected_roi', { roi: '' }).replace('%', '').trim()}</span>
                                    <span className="font-semibold text-emerald-600">{tree.expected_roi}%</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Quantity Stepper */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                        {t('select_trees', { defaultValue: 'How many trees do you want to invest in?' })}
                                    </label>

                                    <div className="flex items-center justify-center gap-6">
                                        <button
                                            type="button"
                                            onClick={decrement}
                                            disabled={data.quantity <= minTrees}
                                            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 text-xl font-bold"
                                        >
                                            −
                                        </button>

                                        <div className="text-center w-24">
                                            <input
                                                type="number"
                                                min={minTrees}
                                                max={maxTrees}
                                                value={data.quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || minTrees;
                                                    setData('quantity', Math.min(maxTrees, Math.max(minTrees, val)));
                                                }}
                                                className="w-full text-center text-3xl font-bold text-gray-900 border-none focus:ring-0 bg-transparent p-0"
                                            />
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide font-medium">Trees</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={increment}
                                            disabled={data.quantity >= maxTrees}
                                            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 text-xl font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-center text-xs text-gray-400 mt-2">
                                        {t('trees_range', { min: minTrees, max: maxTrees, defaultValue: 'Min {{min}} — Max {{max}}' })}
                                    </p>
                                    {errors.quantity && <p className="mt-2 text-sm text-red-600 text-center">{errors.quantity}</p>}
                                </div>

                                {/* Total Price Preview */}
                                <div className="bg-emerald-600 text-white p-5 rounded-2xl mb-8 shadow-lg shadow-emerald-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-emerald-100 text-sm font-medium">{t('total_investment', { defaultValue: 'Total Investment' })}</span>
                                        <IconDollar className="w-5 h-5 text-emerald-200" />
                                    </div>
                                    <div className="text-3xl font-bold mb-2">
                                        {formatRupiah(totalIdr)}
                                    </div>
                                    <div className="text-emerald-100 text-xs flex justify-between">
                                        <span>{data.quantity} {t('trees', { defaultValue: 'trees' })} × {formatRupiah(tree.price_idr)}</span>
                                    </div>
                                </div>

                                {/* Terms & Risk */}
                                <div className="space-y-4 mb-8">
                                    <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-white hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center h-5 mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={data.acceptance_risk_disclosure}
                                                onChange={(e) => setData('acceptance_risk_disclosure', e.target.checked)}
                                                className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            I have read and accept the{' '}
                                            <button type="button" onClick={() => setShowRiskModal(true)} className="text-emerald-600 font-semibold hover:underline">
                                                Risk Disclosure
                                            </button>
                                        </span>
                                    </label>

                                    <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-white hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center h-5 mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={data.acceptance_terms}
                                                onChange={(e) => setData('acceptance_terms', e.target.checked)}
                                                className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            I agree to the{' '}
                                            <a href="/legal/terms" target="_blank" className="text-emerald-600 font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                                                Terms & Conditions
                                            </a>
                                        </span>
                                    </label>
                                </div>

                                {/* Payment Method */}
                                {payment_methods.length > 0 && (
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('payment_method_label')}
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={data.payment_method_id}
                                                onChange={(e) => setData('payment_method_id', e.target.value)}
                                                className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                                            >
                                                <option value="">{t('select_payment_method')}</option>
                                                {payment_methods.map((pm) => (
                                                    <option key={pm.id} value={pm.id}>
                                                        {pm.brand ? pm.brand.toUpperCase() : 'Card'} •••• {pm.last4}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <PrimaryButton
                                    className="w-full justify-center py-4 text-base rounded-xl shadow-lg shadow-emerald-200 mb-4"
                                    disabled={processing || !isValidQuantity || !data.acceptance_risk_disclosure || !data.acceptance_terms}
                                >
                                    {processing ? t('processing_button') : t('proceed_to_payment')}
                                </PrimaryButton>
                                
                                <Link
                                    href={route('farms.index')}
                                    className="block text-center text-sm font-medium text-gray-500 hover:text-gray-900 pb-4"
                                >
                                    {t('cancel_button')}
                                </Link>
                            </form>
                        </div>
                    </FinancialErrorBoundary>
                </div>
            </div>

            {/* Risk Disclosure Modal */}
            <Modal show={showRiskModal} onClose={() => setShowRiskModal(false)}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-amber-600">
                        <IconInfoCircle className="w-6 h-6" />
                        <h3 className="text-lg font-bold">{t('risk_modal_title')}</h3>
                    </div>
                    
                    <div className="prose prose-sm max-h-[60vh] overflow-y-auto pr-2 mb-6 text-gray-600">
                        <p className="mb-2">{t('risk_modal_intro')}</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>{t('risk_climate')}</li>
                            <li>{t('risk_market')}</li>
                            <li>{t('risk_pest')}</li>
                            <li>{t('risk_natural_disaster')}</li>
                            <li>{t('risk_regulatory')}</li>
                            <li>{t('risk_operator')}</li>
                        </ul>
                        <p>{t('risk_modal_outro')}</p>
                    </div>

                    <PrimaryButton onClick={() => setShowRiskModal(false)} className="w-full justify-center">
                        {t('i_understand')}
                    </PrimaryButton>
                </div>
            </Modal>

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
