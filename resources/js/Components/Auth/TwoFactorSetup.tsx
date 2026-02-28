import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { useForm } from '@inertiajs/react';

interface TwoFactorSetupProps {
    qrCode?: string;
    recoveryCodes?: string[];
    onEnable: (type: 'totp' | 'sms') => void;
    onVerify: (code: string) => void;
}

export default function TwoFactorSetup({ qrCode, recoveryCodes, onEnable, onVerify }: TwoFactorSetupProps) {
    const [type, setType] = useState<'totp' | 'sms' | null>(null);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [code, setCode] = useState('');
    const [errors, setErrors] = useState<{ code?: string }>({});
    const [processing, setProcessing] = useState(false);

    const handleEnable = (selectedType: 'totp' | 'sms') => {
        setType(selectedType);
        onEnable(selectedType);
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(code);
    };

    const downloadRecoveryCodes = () => {
        const blob = new Blob([recoveryCodes?.join('\n') || ''], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recovery-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes?.join('\n') || '');
    };

    if (!type) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Choose 2FA Method</h3>
                    <p className="mt-1 text-sm text-gray-600">
                        Select your preferred two-factor authentication method.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => handleEnable('totp')}
                        className="flex items-start gap-4 rounded-lg border border-gray-300 p-4 text-left transition hover:border-indigo-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <div className="rounded-full bg-indigo-100 p-3">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Authenticator App</h4>
                            <p className="mt-1 text-sm text-gray-600">
                                Use an authenticator app like Google Authenticator or Authy to generate codes.
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleEnable('sms')}
                        className="flex items-start gap-4 rounded-lg border border-gray-300 p-4 text-left transition hover:border-indigo-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <div className="rounded-full bg-green-100 p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">SMS Code</h4>
                            <p className="mt-1 text-sm text-gray-600">
                                Receive a verification code via text message to your registered phone number.
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (qrCode && type === 'totp') {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Scan QR Code</h3>
                    <p className="mt-1 text-sm text-gray-600">
                        Scan this QR code with your authenticator app to link your account.
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="rounded-lg border border-gray-300 p-6 bg-white">
                        <QRCodeSVG value={qrCode} size={200} level="M" includeMargin={true} />
                    </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="code" value="Enter Verification Code" />
                        <TextInput
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="123456"
                            className="mt-1 block w-full text-center tracking-widest"
                            maxLength={6}
                            autoFocus
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="flex gap-3">
                        <PrimaryButton className="flex-1" disabled={processing}>
                            Verify & Enable
                        </PrimaryButton>
                        <SecondaryButton
                            type="button"
                            onClick={() => setType(null)}
                            disabled={processing}
                        >
                            Cancel
                        </SecondaryButton>
                    </div>
                </form>
            </div>
        );
    }

    if (recoveryCodes && recoveryCodes.length > 0) {
        return (
            <Modal show={true} onClose={() => setShowRecoveryCodes(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">Recovery Codes</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Store these codes in a secure location. You can use them to access your account if you lose
                        your authenticator app or phone.
                    </p>
                    <p className="mt-2 text-sm text-red-600 font-medium">
                        <strong>Important:</strong> These codes will not be shown again.
                    </p>

                    <div className="mt-4 rounded-md bg-gray-50 p-4">
                        <div className="grid grid-cols-2 gap-2">
                            {recoveryCodes.map((code, index) => (
                                <code key={index} className="text-sm text-gray-800">
                                    {code}
                                </code>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <PrimaryButton onClick={downloadRecoveryCodes}>
                            Download
                        </PrimaryButton>
                        <SecondaryButton onClick={copyRecoveryCodes}>
                            Copy to Clipboard
                        </SecondaryButton>
                        <SecondaryButton
                            onClick={() => {
                                downloadRecoveryCodes();
                                setShowRecoveryCodes(false);
                            }}
                        >
                            Done
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        );
    }

    return null;
}
