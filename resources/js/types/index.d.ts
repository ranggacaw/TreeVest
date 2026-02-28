export type Role = 'investor' | 'farm_owner' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    email_verified_at?: string;
    phone?: string;
    phone_country_code?: string;
    phone_verified_at?: string;
    avatar_url?: string;
    two_factor_enabled_at?: string;
    last_login_at?: string;
    last_login_ip?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
};
