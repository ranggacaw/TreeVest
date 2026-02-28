import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Session {
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current?: boolean;
}

interface SessionCardProps {
    session: Session;
    onRevoke?: (sessionId: string) => void;
    showRevoke?: boolean;
}

export default function SessionCard({ session, onRevoke, showRevoke = true }: SessionCardProps) {
    const parseUserAgent = (userAgent: string) => {
        if (!userAgent) return 'Unknown Device';

        let browser = 'Unknown Browser';
        let os = 'Unknown OS';

        if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
        } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browser = 'Chrome';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'Safari';
        } else if (userAgent.includes('Edg')) {
            browser = 'Edge';
        } else if (userAgent.includes('Opera')) {
            browser = 'Opera';
        }

        if (userAgent.includes('Windows')) {
            os = 'Windows';
        } else if (userAgent.includes('Mac')) {
            os = 'MacOS';
        } else if (userAgent.includes('Linux')) {
            os = 'Linux';
        } else if (userAgent.includes('Android')) {
            os = 'Android';
        } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            os = 'iOS';
        }

        if (userAgent.includes('Mobile')) {
            browser += ' Mobile';
        }

        return `${browser} on ${os}`;
    };

    const parseIpAddress = (ip: string) => {
        if (!ip) return 'Unknown Location';
        return ip;
    };

    const isMobile = (userAgent: string) => {
        return /Mobile|Android|iPhone|iPad/i.test(userAgent);
    };

    const timeAgo = (() => {
        const now = new Date();
        const last = new Date(session.last_activity);
        const seconds = Math.floor((now.getTime() - last.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return last.toLocaleDateString();
    })();

    return (
        <div className={`rounded-lg border p-4 ${session.is_current ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${session.is_current ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        {isMobile(session.user_agent) ? (
                            <svg className={`h-5 w-5 ${session.is_current ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        ) : (
                            <svg className={`h-5 w-5 ${session.is_current ? 'text-indigo-600' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{parseUserAgent(session.user_agent)}</h4>
                            {session.is_current && (
                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                                    Current Session
                                </span>
                            )}
                        </div>
                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <span>{parseIpAddress(session.ip_address)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span>Last active {timeAgo}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {showRevoke && !session.is_current && onRevoke && (
                    <DangerButton
                        onClick={() => onRevoke(session.id)}
                        className="ml-4"
                    >
                        Revoke
                    </DangerButton>
                )}
            </div>
        </div>
    );
}
