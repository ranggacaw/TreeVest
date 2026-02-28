import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface AccountSettingsProps {
    hasPendingInvestments?: boolean;
    hasPendingPayouts?: boolean;
}

export default function AccountSettings({
    hasPendingInvestments = false,
    hasPendingPayouts = false,
}: AccountSettingsProps) {
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [showDeletionRequest, setShowDeletionRequest] = useState(false);
    const [deletionReason, setDeletionReason] = useState('');

    const { post, processing } = useForm({
        reason: '',
    });

    const handleDeactivate = () => {
        post(route('profile.deactivate'), {
            onSuccess: () => {
                setShowDeactivateConfirm(false);
                window.location.href = route('login');
            },
        });
    };

    const handleDeletionRequest = () => {
        post(route('profile.delete-request'));
        setShowDeletionRequest(false);
        setDeletionReason('');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Account Settings
                </h2>
            }
        >
            <Head title="Account Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h3 className="text-lg font-medium text-gray-900">
                            Deactivate Account
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Deactivating your account will disable your access to the platform. Your
                            data will be retained for 30 days, during which you can reactivate your account
                            by contacting support.
                        </p>

                        {hasPendingInvestments && (
                            <div className="mt-4 rounded-md bg-yellow-50 p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> You have pending investments. Deactivating
                                    your account will not cancel these investments. Please ensure all
                                    investments are settled before deactivation.
                                </p>
                            </div>
                        )}

                        <div className="mt-6">
                            <DangerButton
                                onClick={() => setShowDeactivateConfirm(true)}
                                disabled={processing}
                            >
                                Deactivate Account
                            </DangerButton>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h3 className="text-lg font-medium text-gray-900">
                            Request Account Deletion
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Request permanent deletion of your account and all associated data. This action
                            will be reviewed by our team and may take up to 30 days to complete.
                        </p>

                        {hasPendingPayouts && (
                            <div className="mt-4 rounded-md bg-yellow-50 p-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Warning:</strong> You have pending payouts. You must receive
                                    all pending payouts before your account can be permanently deleted.
                                </p>
                            </div>
                        )}

                        <div className="mt-6">
                            <DangerButton
                                onClick={() => setShowDeletionRequest(true)}
                                disabled={processing || hasPendingPayouts}
                            >
                                Request Data Deletion
                            </DangerButton>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showDeactivateConfirm} onClose={() => setShowDeactivateConfirm(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Deactivate Account</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to deactivate your account? You will lose access to the
                        platform and will need to contact support to reactivate your account within 30
                        days.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <DangerButton onClick={handleDeactivate} disabled={processing}>
                            Deactivate
                        </DangerButton>
                        <button
                            type="button"
                            onClick={() => setShowDeactivateConfirm(false)}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={showDeletionRequest} onClose={() => setShowDeletionRequest(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Request Data Deletion</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Please provide a reason for your deletion request. This will be reviewed by our
                        team.
                    </p>

                    <div className="mt-4">
                        <label
                            htmlFor="reason"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Reason (Optional)
                        </label>
                        <textarea
                            id="reason"
                            value={deletionReason}
                            onChange={(e) => setDeletionReason(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Tell us why you're leaving..."
                        />
                    </div>

                    <div className="mt-6 flex gap-3">
                        <DangerButton
                            onClick={handleDeletionRequest}
                            disabled={processing || !deletionReason.trim()}
                        >
                            Submit Request
                        </DangerButton>
                        <button
                            type="button"
                            onClick={() => setShowDeletionRequest(false)}
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
