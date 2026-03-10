import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { PageProps, AgrotourismEvent, AgrotourismRegistration } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';

interface Props extends PageProps {
    events: {
        data: AgrotourismEvent[];
        links: any[];
    };
    myRegistrations: AgrotourismRegistration[];
}

export default function Index({ auth, events, myRegistrations }: Props) {
    const [selectedEvent, setSelectedEvent] = useState<AgrotourismEvent | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        registration_type: 'online'
    });

    const openRegisterModal = (event: AgrotourismEvent) => {
        setSelectedEvent(event);
        setData('registration_type', event.event_type === 'hybrid' ? 'online' : event.event_type as 'online' | 'offline');
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;

        post(route('investor.agrotourism.register', selectedEvent.id), {
            onSuccess: () => {
                setSelectedEvent(null);
                reset();
            }
        });
    };

    const handleCancel = (registrationId: number) => {
        if (confirm('Are you sure you want to cancel your registration?')) {
            router.delete(route('investor.agrotourism.registrations.cancel', registrationId));
        }
    };

    return (
        <AppLayout title="Agrotourism Events">
            <Head title="Agrotourism Events" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* My Registrations Section */}
                    {myRegistrations.length > 0 && (
                        <div className="mb-8 overflow-hidden bg-white px-4 py-5 shadow-sm sm:rounded-lg sm:px-6">
                            <h2 className="mb-4 text-lg font-bold text-gray-900">My Registrations</h2>
                            <div className="space-y-4">
                                {myRegistrations.map((reg) => (
                                    <div key={reg.id} className="flex items-center justify-between rounded border p-4">
                                        <div>
                                            <div className="font-semibold">{reg.event?.title}</div>
                                            <div className="text-sm text-gray-500">
                                                Status: {reg.status} | Type: {reg.registration_type}
                                            </div>
                                        </div>
                                        {reg.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleCancel(reg.id)}
                                                className="text-sm font-medium text-red-600 hover:text-red-900 flex items-center gap-1"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Discover Events Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex items-center justify-between">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Discover Events</h3>
                        </div>
                        <div className="p-6">
                            {events.data.length === 0 ? (
                                <p className="text-gray-500">No open events available at the moment.</p>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {events.data.map((event) => {
                                        const isRegistered = myRegistrations.some(
                                            r => r.event_id === event.id && r.status !== 'cancelled'
                                        );

                                        return (
                                            <div key={event.id} className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md flex flex-col h-full">
                                                <div className="flex-1">
                                                    <h4 className="text-base font-semibold">{event.title}</h4>
                                                    <p className="mt-1 text-sm text-gray-500">{event.farm?.name}</p>
                                                    <div className="mt-2 text-xs font-medium text-emerald-600">
                                                        {new Date(event.event_date).toLocaleDateString()}
                                                    </div>
                                                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                                                    <div className="mt-2 text-xs text-gray-400">
                                                        {event.event_type.toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="mt-4 border-t pt-4">
                                                    {isRegistered ? (
                                                        <span className="text-sm font-medium text-gray-500">Already Registered</span>
                                                    ) : (
                                                        <PrimaryButton onClick={() => openRegisterModal(event)} className="w-full justify-center">
                                                            Register
                                                        </PrimaryButton>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={selectedEvent !== null} onClose={() => setSelectedEvent(null)}>
                <form onSubmit={handleRegister} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Register for {selectedEvent?.title}
                    </h2>

                    <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-4">{selectedEvent?.description}</p>

                        {(selectedEvent?.event_type === 'hybrid' || !selectedEvent) && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700">Participation Type</label>
                                <select
                                    value={data.registration_type}
                                    onChange={e => setData('registration_type', e.target.value as any)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline / In-person</option>
                                </select>
                            </div>
                        )}

                        {selectedEvent?.event_type !== 'hybrid' && (
                            <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                This is a <strong>{selectedEvent?.event_type}</strong> only event.
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setSelectedEvent(null)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>Confirm Registration</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
