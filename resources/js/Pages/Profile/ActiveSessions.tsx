import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SessionCard from '@/Components/Profile/SessionCard';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Session {
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current?: boolean;
}

interface ActiveSessionsProps {
    sessions: Session[];
}

export default function ActiveSessions({ sessions }: ActiveSessionsProps) {
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
    const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

    const { post, delete: destroy, processing } = useForm({});

    const handleRevokeSession = (sessionId: string) => {
        setSessionToRevoke(sessionId);
        setShowRevokeConfirm(true);
    };

    const confirmRevokeSession = () => {
        if (sessionToRevoke) {
            destroy(route('profile.sessions.destroy', sessionToRevoke), {
                onSuccess: () => {
                    setShowRevokeConfirm(false);
                    setSessionToRevoke(null);
                },
            });
        }
    };

    const handleRevokeAllSessions = () => {
        post(route('profile.sessions.revoke-all'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Active Sessions
                </h2>
            }
        >
            <Head title="Active Sessions" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                Manage Browser Sessions
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                If necessary, you may log out of all of your other browser sessions across
                                all of your devices. Some of your recent sessions are listed below;
                                however, this list is not exhaustive. If you feel your account has been
                                compromised, you should also update your password immediately.
                            </p>
                        </div>

                        <div className="mb-6 flex justify-end">
                            <PrimaryButton onClick={handleRevokeAllSessions} disabled={processing}>
                                Log Out Other Browser Sessions
                            </PrimaryButton>
                        </div>

                        <div className="space-y-4">
                            {sessions.map((session) => (
                                <SessionCard
                                    key={session.id}
                                    session={session}
                                    onRevoke={handleRevokeSession}
                                    showRevoke={!session.is_current}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showRevokeConfirm} onClose={() => setShowRevokeConfirm(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Revoke Session</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to revoke this session? This will log the user out from
                        that device.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <DangerButton onClick={confirmRevokeSession} disabled={processing}>
                            Revoke
                        </DangerButton>
                        <button
                            type="button"
                            onClick={() => setShowRevokeConfirm(false)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
