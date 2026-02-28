export type Role = 'investor' | 'farm_owner' | 'admin';
export type KycStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type KycDocumentType = 'passport' | 'national_id' | 'drivers_license' | 'proof_of_address';

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
    kyc_status?: KycStatus;
    kyc_verified_at?: string;
    kyc_expires_at?: string;
}

export interface KycDocument {
    id: number;
    kyc_verification_id: number;
    document_type: KycDocumentType;
    original_filename: string;
    file_size: number;
    uploaded_at: string;
}

export interface KycVerification {
    id: number;
    user_id: number;
    jurisdiction_code: string;
    status: KycStatus;
    submitted_at?: string;
    verified_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
    verified_by_admin_id?: number;
    expires_at?: string;
    provider: string;
    provider_reference_id?: string;
    has_required_documents?: boolean;
    documents?: KycDocument[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
};
