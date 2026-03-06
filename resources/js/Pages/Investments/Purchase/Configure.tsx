import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps, Tree, PaymentMethod } from '@/types';
import FinancialErrorBoundary from '@/Components/FinancialErrorBoundary';
import { useTranslation } from 'react-i18next';

interface Props extends PageProps {
    tree: Tree;
    user: {
        kyc_verified: boolean;
    };
    payment_methods: PaymentMethod[];
}

export default function Configure({ auth, tree, user, payment_methods }: Props) {
    const { t } = useTranslation('investments');
    const { props } = usePage<any>();
    const { flash } = props;

    const { data, setData, post, processing, errors } = useForm({
        tree_id: tree.id,
        amount_cents: tree.min_investment_cents,
        acceptance_risk_disclosure: false,
        acceptance_terms: false,
        payment_method_id: payment_methods.find(p => true)?.id || '',
    });

    const [showRiskModal, setShowRiskModal] = useState(false);

    const amountInDollars = data.amount_cents / 100;
    const isValidAmount = data.amount_cents >= tree.min_investment_cents &&
        data.amount_cents <= tree.max_investment_cents;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidAmount) {
            alert(t('invalid_amount_message'));
            return;
        }

        if (!data.acceptance_risk_disclosure || !data.acceptance_terms) {
            alert(t('validation_failed'));
            return;
        }

        post('/investments');
    };

    const formatCurrency = (cents: number) => {
        return 'Rp ' + (cents / 100).toFixed(2);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('invest_in_tree', { identifier: tree.identifier })}
                </h2>
            }
        >
            <Head title={t('configure_investment')} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <FinancialErrorBoundary context="investment-purchase-configure">
                        {flash?.error && (
                            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{flash.error}</span>
                            </div>
                        )}

                        {flash?.success && (
                            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{flash.success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            {t('tree_details')}
                                        </h3>

                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-sm text-gray-500">{t('tree_id')}</dt>
                                                <dd className="font-medium text-gray-900">#{tree.identifier}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-gray-500">{t('fruit_type')}</dt>
                                                <dd className="font-medium text-gray-900">{tree.fruit_crop.fruit_type}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-gray-500">{t('variant')}</dt>
                                                <dd className="font-medium text-gray-900">{tree.fruit_crop.variant}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-gray-500">{t('farm')}</dt>
                                                <dd className="font-medium text-gray-900">{tree.farm.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-gray-500">{t('expected_roi', { roi: '' }).replace('%', '').trim()}</dt>
                                                <dd className="font-medium text-gray-900">{tree.expected_roi}%</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm text-gray-500">{t('risk_rating')}</dt>
                                                <dd className="font-medium text-gray-900 capitalize">{tree.risk_rating}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            {t('investment_amount')}
                                        </h3>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('amount_label', { formatted: formatCurrency(data.amount_cents) })}
                                            </label>
                                            <input
                                                type="range"
                                                min={tree.min_investment_cents}
                                                max={tree.max_investment_cents}
                                                step={100}
                                                value={data.amount_cents}
                                                onChange={(e) => setData('amount_cents', parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>{tree.min_investment_formatted}</span>
                                                <span>{tree.max_investment_formatted}</span>
                                            </div>
                                            {errors.amount_cents && (
                                                <p className="mt-1 text-sm text-red-600">{errors.amount_cents}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('or_enter_custom_amount')}
                                            </label>
                                            <input
                                                type="number"
                                                min={tree.min_investment_cents}
                                                max={tree.max_investment_cents}
                                                value={data.amount_cents}
                                                onChange={(e) => setData('amount_cents', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>

                                        {isValidAmount && (
                                            <div className="bg-green-50 p-4 rounded-lg mb-6">
                                                <p className="text-sm text-green-800">
                                                    {t('valid_amount_message')}
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        id="acceptance_risk_disclosure"
                                                        type="checkbox"
                                                        checked={data.acceptance_risk_disclosure}
                                                        onChange={(e) => setData('acceptance_risk_disclosure', e.target.checked)}
                                                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor="acceptance_risk_disclosure" className="font-medium text-gray-700">
                                                        {t('acceptance_risk_disclosure_text')}{' '}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowRiskModal(true)}
                                                            className="text-green-600 hover:underline"
                                                        >
                                                            {t('risk_disclosure_link')}
                                                        </button>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        id="acceptance_terms"
                                                        type="checkbox"
                                                        checked={data.acceptance_terms}
                                                        onChange={(e) => setData('acceptance_terms', e.target.checked)}
                                                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label htmlFor="acceptance_terms" className="font-medium text-gray-700">
                                                        {t('acceptance_terms_text')}{' '}
                                                        <a href="/legal/terms" target="_blank" className="text-green-600 hover:underline">
                                                            {t('terms_and_conditions_link')}
                                                        </a>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {payment_methods.length > 0 && (
                                            <div className="mt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('payment_method_label')}
                                                </label>
                                                <select
                                                    value={data.payment_method_id}
                                                    onChange={(e) => setData('payment_method_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="">{t('select_payment_method')}</option>
                                                    {payment_methods.map((pm) => (
                                                        <option key={pm.id} value={pm.id}>
                                                            {pm.brand} •••• {pm.last4} (expires {pm.exp_month}/{pm.exp_year})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {Object.keys(errors).length > 0 && (
                                            <div className="bg-red-50 p-4 rounded-lg mt-6">
                                                <p className="text-sm font-semibold text-red-800 mb-2">{t('problems_with_submission')}</p>
                                                <ul className="list-disc pl-5 text-sm text-red-700">
                                                    {Object.entries(errors).map(([field, msg]) => (
                                                        <li key={field}>{msg}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="mt-6 flex gap-4">
                                            <Link
                                                href="/farms"
                                                className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                {t('cancel_button')}
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? t('processing_button') : t('proceed_to_payment')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </FinancialErrorBoundary>
                </div>
            </div>

            {showRiskModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowRiskModal(false)}></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('risk_modal_title')}</h3>
                                <div className="prose prose-sm max-h-96 overflow-y-auto">
                                    <p>{t('risk_modal_intro')}</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>{t('risk_climate')}</li>
                                        <li>{t('risk_market')}</li>
                                        <li>{t('risk_pest')}</li>
                                        <li>{t('risk_natural_disaster')}</li>
                                        <li>{t('risk_regulatory')}</li>
                                        <li>{t('risk_operator')}</li>
                                    </ul>
                                    <p className="mt-4">{t('risk_modal_outro')}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => setShowRiskModal(false)}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {t('i_understand')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
