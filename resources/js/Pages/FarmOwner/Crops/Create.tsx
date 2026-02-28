import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { FormEventHandler } from 'react';

export default function Create({ auth, farms, fruitTypes }: PageProps<{ farms: any[], fruitTypes: any[] }>) {
    const { data, setData, post, processing, errors } = useForm({
        farm_id: '',
        fruit_type_id: '',
        variant: '',
        harvest_cycle: 'annual',
        planted_date: '',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('farm-owner.crops.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add Crop</h2>}>
            <Head title="Add Crop" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={submit} className="space-y-6 max-w-xl">
                                <div>
                                    <InputLabel htmlFor="farm_id" value="Farm" />
                                    <select
                                        id="farm_id"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.farm_id}
                                        onChange={e => setData('farm_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a Farm</option>
                                        {farms.map(farm => (
                                            <option key={farm.id} value={farm.id}>{farm.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.farm_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="fruit_type_id" value="Fruit Type" />
                                    <select
                                        id="fruit_type_id"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.fruit_type_id}
                                        onChange={e => setData('fruit_type_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a Fruit Type</option>
                                        {fruitTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.fruit_type_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="variant" value="Variant" />
                                    <TextInput
                                        id="variant"
                                        className="mt-1 block w-full"
                                        value={data.variant}
                                        onChange={e => setData('variant', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.variant} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="harvest_cycle" value="Harvest Cycle" />
                                    <select
                                        id="harvest_cycle"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.harvest_cycle}
                                        onChange={e => setData('harvest_cycle', e.target.value)}
                                        required
                                    >
                                        <option value="annual">Annual</option>
                                        <option value="biannual">Biannual</option>
                                        <option value="seasonal">Seasonal</option>
                                    </select>
                                    <InputError message={errors.harvest_cycle} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="planted_date" value="Planted Date (Optional)" />
                                    <TextInput
                                        id="planted_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.planted_date}
                                        onChange={e => setData('planted_date', e.target.value)}
                                    />
                                    <InputError message={errors.planted_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows={4}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
