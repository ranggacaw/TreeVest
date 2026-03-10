import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, AgrotourismEvent, AgrotourismRegistration } from '@/types';

interface EventWithRegistrations extends AgrotourismEvent {
    registrations: AgrotourismRegistration[];
}

interface Props extends PageProps {
    event: EventWithRegistrations;
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        confirmed: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}

function EventTypeBadge({ type }: { type: string }) {
    const styles: Record<string, string> = {
        online: 'bg-blue-100 text-blue-700',
        offline: 'bg-emerald-100 text-emerald-700',
        hybrid: 'bg-purple-100 text-purple-700',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[type] ?? 'bg-gray-100 text-gray-700'}`}>
            {type}
        </span>
    );
}

export default function Show({ event, flash }: Props) {
    const isCancelled = !!event.cancelled_at;
    const eventDate = new Date(event.event_date);
    const confirmed = event.registrations?.filter((r) => r.status === 'confirmed') ?? [];
    const pending = event.registrations?.filter((r) => r.status === 'pending') ?? [];

    return (
        <AppLayout title={event.title}>
            <Head title={event.title} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back */}
                <div className="mb-6">
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

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* Event details card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                {isCancelled ? (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                        Cancelled
                                    </span>
                                ) : (
                                    <>
                                        <EventTypeBadge type={event.event_type} />
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${event.is_registration_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {event.is_registration_open ? 'Registrations Open' : 'Registrations Closed'}
                                        </span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                            {event.farm && (
                                <p className="mt-1 text-sm text-gray-500">{event.farm.name}</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        {!isCancelled && (
                            <div className="flex shrink-0 gap-2">
                                <Link
                                    href={route('farm-owner.agrotourism.edit', event.id)}
                                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    Edit
                                </Link>
                                {event.is_registration_open && (
                                    <Link
                                        href={route('farm-owner.agrotourism.close-registrations', event.id)}
                                        method="post"
                                        as="button"
                                        className="inline-flex items-center rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-medium text-amber-700 shadow-sm hover:bg-amber-50"
                                    >
                                        Close Registrations
                                    </Link>
                                )}
                                <Link
                                    href={route('farm-owner.agrotourism.cancel', event.id)}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
                                >
                                    Cancel Event
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Meta grid */}
                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-gray-100 pt-5">
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-500">
                                {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Capacity</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {event.max_capacity != null ? (
                                    <>{confirmed.length} / {event.max_capacity}</>
                                ) : (
                                    <>{confirmed.length} registered (unlimited)</>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Confirmed</p>
                            <p className="mt-1 text-sm font-semibold text-emerald-700">{confirmed.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pending</p>
                            <p className="mt-1 text-sm font-semibold text-amber-600">{pending.length}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="mt-5 border-t border-gray-100 pt-5">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Description</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.description}</p>
                        </div>
                    )}

                    {/* Location notes */}
                    {event.location_notes && (
                        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                            <p className="text-xs font-medium text-amber-700 mb-1">Location / Meeting Notes</p>
                            <p className="text-sm text-amber-800">{event.location_notes}</p>
                        </div>
                    )}
                </div>

                {/* Registrations table */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrations ({event.registrations?.length ?? 0})</h2>

                    {(!event.registrations || event.registrations.length === 0) ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
                            No registrations yet.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Investor</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {event.registrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3 text-sm text-gray-900">
                                                {reg.investor?.name ?? `Investor #${reg.user_id}`}
                                                {reg.investor?.email && (
                                                    <span className="ml-1 text-xs text-gray-400">({reg.investor.email})</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-sm capitalize text-gray-600">{reg.registration_type}</td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={reg.status} />
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-500">
                                                {new Date(reg.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
