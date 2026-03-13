import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppShellLayout from '@/Layouts/AppShellLayout';
import AppTopBar from '@/Components/Portfolio/AppTopBar';
import BottomNav from '@/Components/Portfolio/BottomNav';
import { PageProps, AgrotourismEvent, AgrotourismRegistration } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import { IconCalendar, IconMapPin, IconCheck, IconX, IconInfoCircle } from '@/Components/Icons/AppIcons';

interface Props extends PageProps {
    events: {
        data: AgrotourismEvent[];
        links: any[];
    };
    myRegistrations: AgrotourismRegistration[];
}

export default function Index({ auth, events, myRegistrations, unread_notifications_count }: Props) {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppShellLayout>
            <Head title="Agrotourism Events" />
            
            <div className="relative w-full max-w-md bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: '88px' }}>
                    <AppTopBar 
                        notificationCount={unread_notifications_count} 
                    />

                    {/* My Registrations Section */}
                    {myRegistrations.length > 0 && (
                        <>
                            <div className="bg-white p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <IconCheck className="w-5 h-5 text-emerald-600" />
                                    My Registrations
                                </h2>
                                <div className="space-y-4">
                                    {myRegistrations.map((reg) => (
                                        <div key={reg.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold text-gray-900">{reg.event?.title}</div>
                                                    <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                            ${reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                                              reg.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {reg.status}
                                                        </span>
                                                        <span className="text-gray-300">|</span>
                                                        <span className="capitalize">{reg.registration_type}</span>
                                                    </div>
                                                </div>
                                                {reg.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancel(reg.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                        aria-label="Cancel registration"
                                                    >
                                                        <IconX className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-3 bg-gray-50" />
                        </>
                    )}

                    {/* Discover Events Section */}
                    <div className="bg-white p-6 min-h-[50vh]">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <IconCalendar className="w-5 h-5 text-emerald-600" />
                            Discover Events
                        </h3>

                        {events.data.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IconCalendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500">No open events available at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {events.data.map((event) => {
                                    const isRegistered = myRegistrations.some(
                                        r => r.event_id === event.id && r.status !== 'cancelled'
                                    );

                                    return (
                                        <div key={event.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wide">
                                                    {event.event_type}
                                                </div>
                                                <div className="text-sm font-medium text-gray-500">
                                                    {formatDate(event.event_date)}
                                                </div>
                                            </div>
                                            
                                            <h4 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h4>
                                            
                                            {event.farm?.name && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                                                    <IconMapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{event.farm.name}</span>
                                                </div>
                                            )}
                                            
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                                            
                                            <div className="pt-2">
                                                {isRegistered ? (
                                                    <div className="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-gray-500 text-center text-sm font-medium flex items-center justify-center gap-2">
                                                        <IconCheck className="w-4 h-4" />
                                                        Already Registered
                                                    </div>
                                                ) : (
                                                    <PrimaryButton 
                                                        onClick={() => openRegisterModal(event)} 
                                                        className="w-full justify-center rounded-xl py-3"
                                                    >
                                                        Register Now
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

                {/* Bottom Navigation */}
                <BottomNav />
            </div>

            {/* Registration Modal */}
            <Modal show={selectedEvent !== null} onClose={() => setSelectedEvent(null)}>
                <form onSubmit={handleRegister} className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Register for {selectedEvent?.title}
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-600 leading-relaxed">{selectedEvent?.description}</p>
                            {selectedEvent?.farm?.name && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 font-medium">
                                    <IconMapPin className="w-4 h-4" />
                                    {selectedEvent.farm.name}
                                </div>
                            )}
                        </div>

                        {(selectedEvent?.event_type === 'hybrid' || !selectedEvent) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Participation Type</label>
                                <select
                                    value={data.registration_type}
                                    onChange={e => setData('registration_type', e.target.value as any)}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2.5"
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline / In-person</option>
                                </select>
                            </div>
                        )}

                        {selectedEvent?.event_type !== 'hybrid' && (
                            <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-xl text-sm">
                                <IconInfoCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    This is a <strong>{selectedEvent?.event_type}</strong> only event.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex gap-3">
                        <SecondaryButton className="flex-1 justify-center py-2.5 rounded-xl" onClick={() => setSelectedEvent(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton className="flex-1 justify-center py-2.5 rounded-xl" disabled={processing}>
                            Confirm
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </AppShellLayout>
    );
}
