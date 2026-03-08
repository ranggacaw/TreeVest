import { AppLayout } from '@/Layouts';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { formatRupiah } from '@/utils/currency';

export default function Create({ auth, crops }: PageProps<{ crops: any[] }>) {
    const { t } = useTranslation('farms');
    const queryParams = new URLSearchParams(window.location.search);
    const prefillCropId = queryParams.get('crop_id') || '';

    const { data, setData, post, processing, errors } = useForm({
        fruit_crop_id: prefillCropId,
        tree_identifier: '',
        age_years: 0,
        productive_lifespan_years: 10,
        risk_rating: 'medium',
        min_investment_cents: 500000,
        max_investment_cents: 50000000,
        status: 'growing',
        pricing_config: {
            base_price: 100000,
            age_coefficient: 0.1,
            crop_premium: 1.0,
            risk_multiplier: 1.0,
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('farm-owner.trees.store'));
    };

    const estimatedPrice =
        data.pricing_config.base_price *
        (1 + data.pricing_config.age_coefficient * data.age_years) *
        data.pricing_config.crop_premium *
        data.pricing_config.risk_multiplier;

    let rawROI = 8.0 * data.pricing_config.crop_premium * data.pricing_config.risk_multiplier;
    if (data.productive_lifespan_years > 5) {
        rawROI += (data.productive_lifespan_years - 5) * 0.5;
    }
    const estimatedROI = Math.min(Math.max(rawROI, 1.0), 99.99).toFixed(2);

    return (
        <AppLayout title="Add Tree">
            <Head title="Add Tree" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-5">
                        <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to Previous
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={submit} className="grid grid-cols-2 gap-5">
                                <div>
                                    <InputLabel htmlFor="fruit_crop_id" value="Crop" />
                                    <select
                                        id="fruit_crop_id"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.fruit_crop_id}
                                        onChange={e => setData('fruit_crop_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a Crop</option>
                                        {crops.map(crop => (
                                            <option key={crop.id} value={crop.id}>
                                                {crop.fruit_type?.name} — {crop.variant} ({crop.farm?.name ?? `Farm #${crop.farm_id}`})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.fruit_crop_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tree_identifier" value="Tree Identifier" />
                                    <TextInput
                                        id="tree_identifier"
                                        className="mt-1 block w-full"
                                        value={data.tree_identifier}
                                        onChange={e => setData('tree_identifier', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.tree_identifier} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="age_years" value="Age (Years)" />
                                        <TextInput
                                            id="age_years"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.age_years}
                                            onChange={e => setData('age_years', parseInt(e.target.value))}
                                            required
                                        />
                                        <InputError message={errors.age_years} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="productive_lifespan_years" value="Lifespan (Years)" />
                                        <TextInput
                                            id="productive_lifespan_years"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.productive_lifespan_years}
                                            onChange={e => setData('productive_lifespan_years', parseInt(e.target.value))}
                                            required
                                        />
                                        <InputError message={errors.productive_lifespan_years} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="status" value="Status" />
                                        <select
                                            id="status"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            required
                                        >
                                            <option value="seedling">Seedling</option>
                                            <option value="growing">Growing</option>
                                            <option value="productive">Productive</option>
                                            <option value="declining">Declining</option>
                                            <option value="retired">Retired</option>
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="risk_rating" value="Risk Rating" />
                                        <select
                                            id="risk_rating"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.risk_rating}
                                            onChange={e => setData('risk_rating', e.target.value)}
                                            required
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <InputError message={errors.risk_rating} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="min_investment_cents" value="Min Investment (IDR)" />
                                        <TextInput
                                            id="min_investment_cents"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.min_investment_cents === 0 ? '' : new Intl.NumberFormat('id-ID').format(data.min_investment_cents)}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setData('min_investment_cents', parseInt(val) || 0);
                                            }}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatRupiah(data.min_investment_cents)}
                                        </p>
                                        <InputError message={errors.min_investment_cents} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="max_investment_cents" value="Max Investment (IDR)" />
                                        <TextInput
                                            id="max_investment_cents"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.max_investment_cents === 0 ? '' : new Intl.NumberFormat('id-ID').format(data.max_investment_cents)}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setData('max_investment_cents', parseInt(val) || 0);
                                            }}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatRupiah(data.max_investment_cents)}
                                        </p>
                                        <InputError message={errors.max_investment_cents} className="mt-2" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-4">Pricing Configuration</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="base_price" value="Base Price (IDR)" />
                                            <TextInput
                                                id="base_price"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.pricing_config.base_price === 0 ? '' : new Intl.NumberFormat('id-ID').format(data.pricing_config.base_price)}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setData('pricing_config', { ...data.pricing_config, base_price: parseInt(val) || 0 });
                                                }}
                                                required
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {formatRupiah(data.pricing_config.base_price)}
                                            </p>
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="age_coefficient" value="Age Coefficient" />
                                            <TextInput
                                                id="age_coefficient"
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full"
                                                value={data.pricing_config.age_coefficient}
                                                onChange={e => setData('pricing_config', { ...data.pricing_config, age_coefficient: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="crop_premium" value="Crop Premium" />
                                            <TextInput
                                                id="crop_premium"
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full"
                                                value={data.pricing_config.crop_premium}
                                                onChange={e => setData('pricing_config', { ...data.pricing_config, crop_premium: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="risk_multiplier" value="Risk Multiplier" />
                                            <TextInput
                                                id="risk_multiplier"
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full"
                                                value={data.pricing_config.risk_multiplier}
                                                onChange={e => setData('pricing_config', { ...data.pricing_config, risk_multiplier: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">
                                        Estimated Price: <span className="font-semibold text-gray-900">{formatRupiah(estimatedPrice)}</span>{' '}
                                        <span className="mx-2 text-gray-300">|</span>{' '}
                                        Estimated ROI: <span className="font-semibold text-green-700">{estimatedROI}%</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>{t('common.save')}</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
