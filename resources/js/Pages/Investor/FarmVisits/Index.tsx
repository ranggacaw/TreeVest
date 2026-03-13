import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts';
import { FormEventHandler } from 'react';

interface AgrotourismRegistration {
    id: number;
    status: string;
    participants_count: number;
    confirmed_at: string | null;
    rejection_reason: string | null;
    event: {
        id: number;
        title: string;
        event_date: string;
        event_type: string;
        farm: { name: string };
    };
}

interface Props {
    registrations: AgrotourismRegistration[];
}

export default function Index({ registrations }: Props) {
    const { delete: destroy, processing } = useForm();

    const cancel = (registration: AgrotourismRegistration) => {
        if (!confirm('Cancel your registration for this event?')) return;
        destroy(route('investor.agrotourism.registrations.cancel', registration.id));
    };

    return (
        <AppLayout>
            <Head title="My Farm Visits" />
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Upcoming Farm Visits</h1>
                    <Link
                        href={route('investor.agrotourism.index')}
                        className="text-sm text-green-600 hover:underline"
                    >
                        Browse Events →
                    </Link>
                </div>

                {registrations.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <p className="text-gray-500 text-sm">No upcoming farm visits.</p>
                        <Link href={route('investor.agrotourism.index')} className="text-green-600 text-sm hover:underline mt-2 inline-block">
                            Find events to attend
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {registrations.map((reg) => (
                            <div key={reg.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{reg.event.title}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{reg.event.farm.name}</p>
                                        <p className="text-xs text-gray-500">{reg.event.event_date}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                reg.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                reg.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {reg.status}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {reg.participants_count} participant{reg.participants_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {reg.rejection_reason && (
                                            <p className="text-xs text-red-500 mt-1">Reason: {reg.rejection_reason}</p>
                                        )}
                                    </div>
                                    {reg.status !== 'cancelled' && (
                                        <button
                                            onClick={() => cancel(reg)}
                                            disabled={processing}
                                            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
