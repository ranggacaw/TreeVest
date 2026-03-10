import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps } from '@/types';
import { FormEvent } from 'react';

interface Farm {
    id: number;
    name: string;
}

interface Props extends PageProps {
    farms: Farm[];
}

const EVENT_TYPES = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline (Farm Visit)' },
    { value: 'hybrid', label: 'Hybrid' },
];

function inputClass(error?: string) {
    return `w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;
}

export default function Create({ farms }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        farm_id: farms[0]?.id ? String(farms[0].id) : '',
        title: '',
        description: '',
        event_date: '',
        event_type: 'offline',
        max_capacity: '',
        location_notes: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('farm-owner.agrotourism.store'));
    };

    return (
        <AppLayout title="Create Agrotourism Event">
            <Head title="Create Agrotourism Event" />

            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Back button */}
                <div className="mb-8">
                    <Link
                        href={route('farm-owner.agrotourism.index')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Events
                    </Link>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create Agrotourism Event</h1>
                    <p className="mt-1 text-sm text-gray-500">Invite investors to visit your farm and learn about your operations.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                    {/* Farm */}
                    <div>
                        <label htmlFor="farm_id" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Farm <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="farm_id"
                            value={data.farm_id}
                            onChange={(e) => setData('farm_id', e.target.value)}
                            className={inputClass(errors.farm_id)}
                            required
                        >
                            <option value="">Select a farm…</option>
                            {farms.map((farm) => (
                                <option key={farm.id} value={farm.id}>{farm.name}</option>
                            ))}
                        </select>
                        {errors.farm_id && <p className="mt-1 text-sm text-red-600">{errors.farm_id}</p>}
                        {farms.length === 0 && (
                            <p className="mt-1 text-sm text-amber-600">No active farms found. Please create an active farm first.</p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Durian Harvest Day Visit"
                            className={inputClass(errors.title)}
                            required
                            maxLength={255}
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={5}
                            placeholder="Describe what investors can expect during this event…"
                            className={inputClass(errors.description)}
                            required
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    {/* Event date */}
                    <div>
                        <label htmlFor="event_date" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Event Date &amp; Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="event_date"
                            type="datetime-local"
                            value={data.event_date}
                            onChange={(e) => setData('event_date', e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className={inputClass(errors.event_date)}
                            required
                        />
                        {errors.event_date && <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>}
                    </div>

                    {/* Event type */}
                    <div>
                        <label htmlFor="event_type" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Event Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="event_type"
                            value={data.event_type}
                            onChange={(e) => setData('event_type', e.target.value)}
                            className={inputClass(errors.event_type)}
                            required
                        >
                            {EVENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        {errors.event_type && <p className="mt-1 text-sm text-red-600">{errors.event_type}</p>}
                    </div>

                    {/* Max capacity */}
                    <div>
                        <label htmlFor="max_capacity" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Max Capacity <span className="text-gray-400 font-normal">— optional (leave blank for unlimited)</span>
                        </label>
                        <input
                            id="max_capacity"
                            type="number"
                            min={1}
                            value={data.max_capacity}
                            onChange={(e) => setData('max_capacity', e.target.value)}
                            placeholder="e.g. 30"
                            className={inputClass(errors.max_capacity)}
                        />
                        {errors.max_capacity && <p className="mt-1 text-sm text-red-600">{errors.max_capacity}</p>}
                    </div>

                    {/* Location notes */}
                    <div>
                        <label htmlFor="location_notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                            Location / Meeting Notes <span className="text-gray-400 font-normal">— optional</span>
                        </label>
                        <textarea
                            id="location_notes"
                            value={data.location_notes}
                            onChange={(e) => setData('location_notes', e.target.value)}
                            rows={3}
                            placeholder="e.g. Meet at the main gate, bring sun protection…"
                            className={inputClass(errors.location_notes)}
                            maxLength={1000}
                        />
                        {errors.location_notes && <p className="mt-1 text-sm text-red-600">{errors.location_notes}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                        <Link
                            href={route('farm-owner.agrotourism.index')}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || farms.length === 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating…
                                </>
                            ) : (
                                'Create Event'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
