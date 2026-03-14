import { AppLayout } from '@/Layouts';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { FormEventHandler } from 'react';
import { formatRupiah } from '@/utils/currency';
import { Transition } from '@headlessui/react';

export default function Edit({ auth, tree, crops }: PageProps<{ tree: any, crops: any[] }>) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        fruit_crop_id: tree.fruit_crop_id || '',
        tree_identifier: tree.tree_identifier || '',
        age_years: tree.age_years || 0,
        productive_lifespan_years: tree.productive_lifespan_years || 10,
        risk_rating: tree.risk_rating || 'medium',
        min_investment_idr: tree.min_investment_idr || 1000,
        max_investment_idr: tree.max_investment_idr || 100000,
        status: tree.status || 'growing',
        pricing_config: tree.pricing_config_json || {
            base_price: 10000,
            age_coefficient: 0.1,
            crop_premium: 1.0,
            risk_multiplier: 1.0,
        },
    });

    const selectedCrop = crops.find(c => String(c.id) === String(data.fruit_crop_id)) ?? null;

    const generateIdentifier = (cropId?: string) => {
        const id = cropId || data.fruit_crop_id;
        const crop = crops.find(c => String(c.id) === String(id));
        if (!crop) return;

        const variantAcronym = (crop.variant || '')
            .split(' ')
            .filter((word: string) => word.length > 0)
            .map((word: string) => word[0])
            .join('')
            .toUpperCase();

        const typePrefix = (crop.fruit_type?.name || 'TR')
            .substring(0, 3)
            .toUpperCase();

        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

        const newIdentifier = `${variantAcronym}-${typePrefix}-${randomSuffix}`;
        setData('tree_identifier', newIdentifier);
    };

    const printIdentifier = () => {
        const identifier = data.tree_identifier;
        if (!identifier) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Label - ${identifier}</title>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            font-family: sans-serif;
                            text-align: center;
                        }
                        .label {
                            border: 3px solid black;
                            padding: 40px;
                            border-radius: 15px;
                            max-width: 80%;
                        }
                        h1 { font-size: 5rem; margin: 10px 0; letter-spacing: 2px; }
                        p { font-size: 2rem; color: #333; margin: 0; font-weight: bold; text-transform: uppercase; }
                        .farm { font-size: 1.2rem; color: #666; margin-top: 15px; font-weight: normal; }
                    </style>
                </head>
                <body>
                    <div class="label">
                        <p>${selectedCrop?.fruit_type?.name} - ${selectedCrop?.variant}</p>
                        <h1>${identifier}</h1>
                        <div class="farm">${selectedCrop?.farm?.name || ''}</div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('farm-owner.trees.update', tree.id), {
            preserveScroll: true,
        });
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
        <AppLayout title="Edit Tree" subtitle={tree.tree_identifier}>
            <Head title="Edit Tree" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-5">
                        <button onClick={() => window.history.back()} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back
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
                                        onChange={e => {
                                            const newId = e.target.value;
                                            setData('fruit_crop_id', newId);
                                            if (newId) generateIdentifier(newId);
                                        }}
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

                                    {selectedCrop && (() => {
                                        const registered = selectedCrop.trees_count ?? 0;
                                        const capacity = selectedCrop.total_trees ?? null;
                                        const productive = selectedCrop.productive_trees ?? null;
                                        // current tree is already counted — exclude self
                                        const registeredExcludingSelf = Math.max(0, registered - 1);
                                        const remaining = capacity != null ? capacity - registeredExcludingSelf : null;
                                        const fillPct = capacity != null && capacity > 0
                                            ? Math.min(100, Math.round((registeredExcludingSelf / capacity) * 100))
                                            : null;
                                        const isOver = remaining != null && remaining < 0;
                                        const isFull = remaining != null && remaining === 0;

                                        return (
                                            <div className={`mt-2 rounded-md border px-3 py-2.5 text-xs ${isOver ? 'border-red-200 bg-red-50 text-red-800' : isFull ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
                                                <p className="font-semibold mb-1.5">
                                                    {selectedCrop.farm?.name ?? `Farm #${selectedCrop.farm_id}`}
                                                    <span className="mx-1.5 font-normal opacity-50">›</span>
                                                    {selectedCrop.fruit_type?.name} — {selectedCrop.variant}
                                                </p>

                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span>
                                                        Registered in this crop:{' '}
                                                        <span className="font-bold">{registeredExcludingSelf}</span>
                                                        {capacity != null && (
                                                            <span className="opacity-70"> / {capacity} capacity</span>
                                                        )}
                                                    </span>

                                                    {productive != null && (
                                                        <>
                                                            <span className="opacity-30">·</span>
                                                            <span>
                                                                Productive trees:{' '}
                                                                <span className="font-bold">{productive}</span>
                                                            </span>
                                                        </>
                                                    )}

                                                    {remaining != null && (
                                                        <>
                                                            <span className="opacity-30">·</span>
                                                            <span className={`font-semibold ${isOver ? 'text-red-700' : isFull ? 'text-amber-700' : ''}`}>
                                                                {isOver
                                                                    ? `${Math.abs(remaining)} over capacity`
                                                                    : isFull
                                                                        ? 'At capacity'
                                                                        : `${remaining} slot${remaining !== 1 ? 's' : ''} remaining`}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {fillPct != null && (
                                                    <div className="mt-2 h-1.5 w-full rounded-full bg-black/10">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all ${isOver ? 'bg-red-500' : isFull ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${fillPct}%` }}
                                                        />
                                                    </div>
                                                )}

                                                {(isOver || isFull) && (
                                                    <p className={`mt-1.5 font-medium ${isOver ? 'text-red-700' : 'text-amber-700'}`}>
                                                        {isOver
                                                            ? '⚠ This crop already exceeds its declared total tree capacity.'
                                                            : '⚠ This crop has reached its declared total tree capacity.'}
                                                        {' '}Update the crop\'s Total Trees if needed.
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div>
                                    <InputLabel htmlFor="tree_identifier" value="Tree Identifier" />
                                    <div className="mt-1 flex gap-2">
                                        <div className="relative flex-grow">
                                            <TextInput
                                                id="tree_identifier"
                                                className="block w-full"
                                                value={data.tree_identifier}
                                                onChange={e => setData('tree_identifier', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => generateIdentifier()}
                                            title="Regenerate Identifier"
                                            className="px-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </SecondaryButton>
                                        <SecondaryButton
                                            type="button"
                                            onClick={printIdentifier}
                                            title="Print Label"
                                            className="px-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                        </SecondaryButton>
                                    </div>
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
                                        <InputLabel htmlFor="min_investment_idr" value="Min Investment (IDR)" />
                                        <TextInput
                                            id="min_investment_idr"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.min_investment_idr === 0 ? '' : new Intl.NumberFormat('id-ID').format(data.min_investment_idr)}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setData('min_investment_idr', parseInt(val) || 0);
                                            }}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{formatRupiah(data.min_investment_idr)}</p>
                                        <InputError message={errors.min_investment_idr} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="max_investment_idr" value="Max Investment (IDR)" />
                                        <TextInput
                                            id="max_investment_idr"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.max_investment_idr === 0 ? '' : new Intl.NumberFormat('id-ID').format(data.max_investment_idr)}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setData('max_investment_idr', parseInt(val) || 0);
                                            }}
                                            required
                                        />
                                        <p className="mt-1 text-xs text-gray-500">{formatRupiah(data.max_investment_idr)}</p>
                                        <InputError message={errors.max_investment_idr} className="mt-2" />
                                    </div>
                                </div>

                                <div className="col-span-2 pt-4 border-t border-gray-200">
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
                                            <p className="mt-1 text-xs text-gray-500">{formatRupiah(data.pricing_config.base_price)}</p>
                                            {/* @ts-ignore */}
                                            <InputError message={errors['pricing_config.base_price']} className="mt-2" />
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
                                            {/* @ts-ignore */}
                                            <InputError message={errors['pricing_config.age_coefficient']} className="mt-2" />
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
                                            {/* @ts-ignore */}
                                            <InputError message={errors['pricing_config.crop_premium']} className="mt-2" />
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
                                            {/* @ts-ignore */}
                                            <InputError message={errors['pricing_config.risk_multiplier']} className="mt-2" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-600">
                                        Estimated Price: <span className="font-semibold text-gray-900">{formatRupiah(estimatedPrice)}</span>{' '}
                                        <span className="mx-2 text-gray-300">|</span>{' '}
                                        Estimated ROI: <span className="font-semibold text-green-700">{estimatedROI}%</span>
                                    </p>
                                </div>

                                <div className="col-span-2 flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Update</PrimaryButton>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-gray-600">Updated.</p>
                                    </Transition>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
