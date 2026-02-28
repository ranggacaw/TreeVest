import { User } from './index';

export interface AuthTypes {
    PhoneAuth: {
        phone: string;
        phone_country_code: string;
        code: string;
    };
    OAuth: {
        provider: 'google' | 'facebook' | 'apple';
        provider_user_id: string;
        access_token: string;
        refresh_token?: string;
        expires_at?: string;
    };
    TwoFactor: {
        type: 'totp' | 'sms';
        secret: string;
        enabled: boolean;
        recovery_codes: string[];
    };
    Session: {
        id: string;
        ip_address: string;
        user_agent: string;
        last_activity: string;
        is_current?: boolean;
    };
}

export interface PhoneRegisterProps {
    phone?: string;
}

export interface PhoneLoginProps {
    phone?: string;
}

export interface PhoneVerifyProps {
    phone?: string;
    isRegistration?: boolean;
}

export interface TwoFactorChallengeProps {
    user?: {
        id: number;
        two_factor_enabled_at?: string;
    };
}

export interface TwoFactorAuthenticationProps {
    enabled?: boolean;
    type?: 'totp' | 'sms' | null;
    qrCode?: string;
    recoveryCodes?: string[];
}

export interface ActiveSessionsProps {
    sessions: AuthTypes['Session'][];
}

export interface AccountSettingsProps {
    hasPendingInvestments?: boolean;
    hasPendingPayouts?: boolean;
}

export interface ProfileEditProps {
    user: User & {
        phone?: string;
        phone_country_code?: string;
        avatar_url?: string;
        two_factor_enabled_at?: string;
    };
}

declare module '@inertiajs/core' {
    interface PageProps {
        auth?: {
            user?: User & {
                phone?: string;
                phone_country_code?: string;
                avatar_url?: string;
                two_factor_enabled_at?: string;
            };
        };
    }
}
