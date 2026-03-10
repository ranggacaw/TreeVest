import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, AgrotourismEvent } from '@/types';
import AgrotourismEventCard from '@/Components/AgrotourismEventCard';

interface PaginatedEvents {
    data: AgrotourismEvent[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props extends PageProps {
    events: PaginatedEvents;
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
            </div>
            <h3 className="mb-1 text-base font-semibold text-gray-900">No agrotourism events yet</h3>
            <p className="mb-6 max-w-xs text-sm text-gray-500">
                Create your first event to invite investors to visit your farm.
            </p>
            <Link
                href={route('farm-owner.agrotourism.create')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create First Event
            </Link>
        </div>
    );
}

export default function Index({ events, flash }: Props) {
    const goToPage = (page: number) => {
        router.get(route('farm-owner.agrotourism.index'), { page }, { preserveState: true });
    };

    return (
        <AppLayout title="Agrotourism Events">
            <Head title="Agrotourism Events" />

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Agrotourism Events</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage farm visit events and track investor registrations.
                        </p>
                    </div>
                    <Link
                        href={route('farm-owner.agrotourism.create')}
                        className="inline-flex items-center gap-2 self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:self-auto"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Event
                    </Link>
                </div>

                {/* Flash message */}
                {flash?.success && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {events.total > 0 && events.from != null && events.to != null && (
                    <p className="mb-4 text-sm text-gray-500">
                        Showing {events.from}–{events.to} of {events.total} events
                    </p>
                )}

                {/* Event list */}
                {events.data.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {events.data.map((event) => (
                            <AgrotourismEventCard
                                key={event.id}
                                event={event}
                                showFarm
                                showActions
                                editRoute={!event.cancelled_at ? route('farm-owner.agrotourism.edit', event.id) : undefined}
                                cancelRoute={!event.cancelled_at ? route('farm-owner.agrotourism.cancel', event.id) : undefined}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {events.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-1">
                        <button
                            disabled={events.current_page === 1}
                            onClick={() => goToPage(events.current_page - 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </button>

                        {Array.from({ length: events.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${page === events.current_page
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={events.current_page === events.last_page}
                            onClick={() => goToPage(events.current_page + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
