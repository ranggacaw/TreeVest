import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';

interface RecoveryCodeDisplayProps {
    recoveryCodes: string[];
    onClose: () => void;
    onConfirm: () => void;
}

export default function RecoveryCodeDisplay({ recoveryCodes, onClose, onConfirm }: RecoveryCodeDisplayProps) {
    const [copied, setCopied] = useState(false);

    const downloadCodes = () => {
        const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '2fa-recovery-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const printCodes = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head><title>Recovery Codes</title></head>
                <body style="font-family: monospace; font-size: 16px; padding: 20px;">
                    <h2>Two-Factor Authentication Recovery Codes</h2>
                    <p>Store these codes in a secure location. Each code can only be used once.</p>
                    <hr style="margin: 20px 0;">
                    ${recoveryCodes.map((code) => `<div style="margin: 5px 0;">${code}</div>`).join('')}
                    <hr style="margin: 20px 0;">
                    <p><strong>Important:</strong> Keep these codes safe. They will not be shown again.</p>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Modal show={true} onClose={onClose}>
            <div className="p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Recovery Codes Generated</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Store these codes in a secure location. You can use them to access your account if you
                        lose your authenticator app or phone.
                    </p>
                    <div className="mt-3 rounded-md bg-amber-50 p-3">
                        <p className="text-sm font-medium text-amber-800">
                            <svg className="inline h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <strong>Important:</strong> These codes will not be shown again. Save them now!
                        </p>
                    </div>
                </div>

                <div className="mb-6 rounded-md border border-gray-300 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                        {recoveryCodes.map((code, index) => (
                            <div key={index} className="flex items-center">
                                <span className="text-sm font-mono text-gray-800">{code}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <PrimaryButton onClick={downloadCodes} className="flex-1">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Download
                    </PrimaryButton>
                    <SecondaryButton onClick={copyCodes} className="flex-1">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                        {copied ? 'Copied!' : 'Copy'}
                    </SecondaryButton>
                    <SecondaryButton onClick={printCodes} className="flex-1">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                        </svg>
                        Print
                    </SecondaryButton>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        I Have Saved My Recovery Codes
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
