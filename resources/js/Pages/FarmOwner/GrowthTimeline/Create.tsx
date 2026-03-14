import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Lot, Tree, GrowthMilestoneType, TreeHealthStatus } from '@/types';
import { useTranslation } from 'react-i18next';

interface Props extends PageProps {
    lot: Lot & {
        trees: Tree[];
        rack?: {
            name: string;
            warehouse?: {
                name: string;
            };
        };
    };
}

interface FormData {
    lot_id: number;
    tree_ids: number[];
    milestone_type: GrowthMilestoneType | '';
    health_status: TreeHealthStatus | '';
    title: string;
    description: string;
    photos: File[];
    height_cm: string;
    trunk_diameter_cm: string;
    fruit_count: string;
    visibility: 'public' | 'private';
}

const milestoneTypes: Array<{ value: GrowthMilestoneType; label: string; icon: string; color: string }> = [
    { value: 'planting', label: 'Planting', icon: '🌱', color: 'green' },
    { value: 'first_leaves', label: 'First Leaves', icon: '🌿', color: 'green' },
    { value: 'flowering', label: 'Flowering', icon: '🌸', color: 'pink' },
    { value: 'fruit_set', label: 'Fruit Set', icon: '🫐', color: 'purple' },
    { value: 'fruit_growth', label: 'Fruit Growth', icon: '🍇', color: 'purple' },
    { value: 'pre_harvest', label: 'Pre-Harvest', icon: '⏰', color: 'orange' },
    { value: 'harvest', label: 'Harvest', icon: '🧺', color: 'orange' },
    { value: 'post_harvest', label: 'Post-Harvest', icon: '📦', color: 'gray' },
    { value: 'pruning', label: 'Pruning', icon: '✂️', color: 'blue' },
    { value: 'fertilization', label: 'Fertilization', icon: '🌾', color: 'yellow' },
    { value: 'pest_control', label: 'Pest Control', icon: '🛡️', color: 'red' },
];

const healthStatuses: Array<{ value: TreeHealthStatus; label: string; icon: string; color: string }> = [
    { value: 'excellent', label: 'Excellent', icon: '💚', color: 'green' },
    { value: 'good', label: 'Good', icon: '✅', color: 'blue' },
    { value: 'fair', label: 'Fair', icon: '⚠️', color: 'yellow' },
    { value: 'poor', label: 'Poor', icon: '⚠️', color: 'orange' },
    { value: 'critical', label: 'Critical', icon: '🚨', color: 'red' },
];

export default function Create({ auth, lot }: Props) {
    const { t } = useTranslation(['farm_owner', 'translation']);
    const [selectedPhotoPreviews, setSelectedPhotoPreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        lot_id: lot.id,
        tree_ids: [],
        milestone_type: '',
        health_status: 'good',
        title: '',
        description: '',
        photos: [],
        height_cm: '',
        trunk_diameter_cm: '',
        fruit_count: '',
        visibility: 'public',
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('photos', files);

        // Generate previews
        const previews = files.map((file) => URL.createObjectURL(file));
        setSelectedPhotoPreviews(previews);
    };

    const removePhoto = (index: number) => {
        const newPhotos = data.photos.filter((_, i) => i !== index);
        const newPreviews = selectedPhotoPreviews.filter((_, i) => i !== index);
        setData('photos', newPhotos);
        setSelectedPhotoPreviews(newPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('lot_id', data.lot_id.toString());
        data.tree_ids.forEach((id) => formData.append('tree_ids[]', id.toString()));
        formData.append('milestone_type', data.milestone_type);
        formData.append('health_status', data.health_status);
        formData.append('title', data.title);
        formData.append('description', data.description);
        data.photos.forEach((photo) => formData.append('photos[]', photo));
        if (data.height_cm) formData.append('height_cm', data.height_cm);
        if (data.trunk_diameter_cm) formData.append('trunk_diameter_cm', data.trunk_diameter_cm);
        if (data.fruit_count) formData.append('fruit_count', data.fruit_count);
        formData.append('visibility', data.visibility);

        router.post(route('farm-owner.growth-timeline.store'), formData as any, {
            onSuccess: () => {
                reset();
                setSelectedPhotoPreviews([]);
            },
        });
    };

    const toggleTreeSelection = (treeId: number) => {
        if (data.tree_ids.includes(treeId)) {
            setData('tree_ids', data.tree_ids.filter((id) => id !== treeId));
        } else {
            setData('tree_ids', [...data.tree_ids, treeId]);
        }
    };

    const selectAllTrees = () => {
        setData('tree_ids', lot.trees.map((tree) => tree.id));
    };

    const deselectAllTrees = () => {
        setData('tree_ids', []);
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('add_growth_update')} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {t('add_growth_update', 'Add Growth Update')}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {t('growth_update_description', 'Record growth milestones and health status for your trees')}
                            </p>
                            <div className="mt-2 text-sm text-gray-500">
                                <span className="font-medium">Lot:</span> {lot.name}
                                {lot.rack && (
                                    <>
                                        {' | '}
                                        <span className="font-medium">Rack:</span> {lot.rack.name}
                                    </>
                                )}
                                {lot.rack?.warehouse && (
                                    <>
                                        {' | '}
                                        <span className="font-medium">Warehouse:</span> {lot.rack.warehouse.name}
                                    </>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Tree Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('select_trees', 'Select Trees')} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={selectAllTrees}
                                        className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200"
                                    >
                                        {t('select_all')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={deselectAllTrees}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                    >
                                        {t('deselect_all')}
                                    </button>
                                    <span className="text-sm text-gray-600 self-center ml-auto">
                                        {data.tree_ids.length} / {lot.trees.length} {t('trees_selected')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                    {lot.trees.map((tree) => (
                                        <label
                                            key={tree.id}
                                            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                                data.tree_ids.includes(tree.id)
                                                    ? 'bg-emerald-50 border-2 border-emerald-500'
                                                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.tree_ids.includes(tree.id)}
                                                onChange={() => toggleTreeSelection(tree.id)}
                                                className="mr-2 rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-gray-900">{tree.identifier}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.tree_ids && <p className="mt-1 text-sm text-red-600">{errors.tree_ids}</p>}
                            </div>

                            {/* Milestone Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('milestone_type', 'Milestone Type')} <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {milestoneTypes.map((type) => (
                                        <label
                                            key={type.value}
                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                                data.milestone_type === type.value
                                                    ? `bg-${type.color}-50 border-2 border-${type.color}-500 shadow-sm`
                                                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="milestone_type"
                                                value={type.value}
                                                checked={data.milestone_type === type.value}
                                                onChange={(e) => setData('milestone_type', e.target.value as GrowthMilestoneType)}
                                                className="sr-only"
                                            />
                                            <div className="flex flex-col items-center w-full">
                                                <span className="text-2xl mb-1">{type.icon}</span>
                                                <span className="text-xs font-medium text-gray-900 text-center">{type.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.milestone_type && <p className="mt-1 text-sm text-red-600">{errors.milestone_type}</p>}
                            </div>

                            {/* Health Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('health_status', 'Health Status')} <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {healthStatuses.map((status) => (
                                        <label
                                            key={status.value}
                                            className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all ${
                                                data.health_status === status.value
                                                    ? `bg-${status.color}-50 border-2 border-${status.color}-500 shadow-sm`
                                                    : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="health_status"
                                                value={status.value}
                                                checked={data.health_status === status.value}
                                                onChange={(e) => setData('health_status', e.target.value as TreeHealthStatus)}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl mb-1">{status.icon}</span>
                                            <span className="text-xs font-medium text-gray-900 text-center">{status.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.health_status && <p className="mt-1 text-sm text-red-600">{errors.health_status}</p>}
                            </div>

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    {t('title', 'Title')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder={t('title_placeholder', 'e.g., First flowering of the season')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    {t('description', 'Description')}
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder={t('description_placeholder', 'Add detailed notes about this growth milestone...')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Photos */}
                            <div>
                                <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('photos', 'Photos')}
                                </label>
                                <input
                                    type="file"
                                    id="photos"
                                    multiple
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                                {errors.photos && <p className="mt-1 text-sm text-red-600">{errors.photos}</p>}
                                
                                {selectedPhotoPreviews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {selectedPhotoPreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Measurements Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Height */}
                                <div>
                                    <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700">
                                        {t('height_cm', 'Height (cm)')}
                                    </label>
                                    <input
                                        type="number"
                                        id="height_cm"
                                        value={data.height_cm}
                                        onChange={(e) => setData('height_cm', e.target.value)}
                                        step="0.1"
                                        min="0"
                                        placeholder="0.0"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.height_cm && <p className="mt-1 text-sm text-red-600">{errors.height_cm}</p>}
                                </div>

                                {/* Trunk Diameter */}
                                <div>
                                    <label htmlFor="trunk_diameter_cm" className="block text-sm font-medium text-gray-700">
                                        {t('trunk_diameter_cm', 'Trunk Diameter (cm)')}
                                    </label>
                                    <input
                                        type="number"
                                        id="trunk_diameter_cm"
                                        value={data.trunk_diameter_cm}
                                        onChange={(e) => setData('trunk_diameter_cm', e.target.value)}
                                        step="0.1"
                                        min="0"
                                        placeholder="0.0"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.trunk_diameter_cm && <p className="mt-1 text-sm text-red-600">{errors.trunk_diameter_cm}</p>}
                                </div>

                                {/* Fruit Count */}
                                <div>
                                    <label htmlFor="fruit_count" className="block text-sm font-medium text-gray-700">
                                        {t('fruit_count', 'Fruit Count')}
                                    </label>
                                    <input
                                        type="number"
                                        id="fruit_count"
                                        value={data.fruit_count}
                                        onChange={(e) => setData('fruit_count', e.target.value)}
                                        min="0"
                                        placeholder="0"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                    {errors.fruit_count && <p className="mt-1 text-sm text-red-600">{errors.fruit_count}</p>}
                                </div>
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('visibility', 'Visibility')}
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="public"
                                            checked={data.visibility === 'public'}
                                            onChange={(e) => setData('visibility', e.target.value as 'public' | 'private')}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700">{t('public', 'Public')} - {t('visible_to_investors')}</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="private"
                                            checked={data.visibility === 'private'}
                                            onChange={(e) => setData('visibility', e.target.value as 'public' | 'private')}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700">{t('private', 'Private')} - {t('internal_only')}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? t('saving...') : t('save_update', 'Save Update')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
