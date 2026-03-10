import React from 'react';
import { Link } from '@inertiajs/react';
import { AgrotourismEvent } from '@/types';

interface Props {
    event: AgrotourismEvent;
    registrationRoute?: string;
    showFarm?: boolean;
    showActions?: boolean;
    editRoute?: string;
    cancelRoute?: string;
}

function EventTypeBadge({ type }: { type: string }) {
    const styles: Record<string, string> = {
        online: 'bg-blue-100 text-blue-700',
        offline: 'bg-emerald-100 text-emerald-700',
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[type] ?? 'bg-gray-100 text-gray-700'}`}
        >
            {type}
        </span>
    );
}

function CancelledBadge() {
    return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
            Cancelled
        </span>
    );
}

function RegistrationBadge({ open }: { open: boolean }) {
    return open ? (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Open
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            Closed
        </span>
    );
}

export default function AgrotourismEventCard({
    event,
    registrationRoute,
    showFarm = false,
    showActions = false,
    editRoute,
    cancelRoute,
}: Props) {
    const isCancelled = !!event.cancelled_at;
    const eventDate = new Date(event.event_date);

    return (
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-900">{event.title}</h3>
                    {showFarm && event.farm && (
                        <p className="mt-0.5 text-xs text-gray-500">{event.farm.name}</p>
                    )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                    {isCancelled ? (
                        <CancelledBadge />
                    ) : (
                        <>
                            <EventTypeBadge type={event.event_type} />
                            <RegistrationBadge open={event.is_registration_open} />
                        </>
                    )}
                </div>
            </div>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>

                {event.max_capacity != null && (
                    <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {(event.confirmed_registrations_count ?? 0)} / {event.max_capacity} registered
                    </span>
                )}
            </div>

            {/* Description excerpt */}
            {event.description && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">{event.description}</p>
            )}

            {/* Location notes */}
            {event.location_notes && (
                <p className="mt-2 text-xs text-gray-400 italic">{event.location_notes}</p>
            )}

            {/* Actions */}
            {(registrationRoute || showActions) && (
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                    {registrationRoute && !isCancelled && event.is_registration_open && (
                        <Link
                            href={registrationRoute}
                            method="post"
                            as="button"
                            className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                        >
                            Register
                        </Link>
                    )}
                    {showActions && editRoute && !isCancelled && (
                        <Link
                            href={editRoute}
                            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Edit
                        </Link>
                    )}
                    {showActions && cancelRoute && !isCancelled && (
                        <Link
                            href={cancelRoute}
                            method="post"
                            as="button"
                            className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50"
                        >
                            Cancel
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
