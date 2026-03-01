export type Role = 'investor' | 'farm_owner' | 'admin';
export type KycStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type KycDocumentType = 'passport' | 'national_id' | 'drivers_license' | 'proof_of_address';
export type FarmStatus = 'pending_approval' | 'active' | 'suspended' | 'deactivated';
export type InvestmentStatus = 'pending_payment' | 'active' | 'matured' | 'sold' | 'cancelled';

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

export interface FarmImage {
    id: number;
    farm_id: number;
    file_path: string;
    original_filename?: string;
    mime_type?: string;
    file_size?: number;
    caption?: string;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface FarmCertification {
    id: number;
    farm_id: number;
    name: string;
    issuer?: string;
    certificate_number?: string;
    issued_date?: string;
    expiry_date?: string;
    file_path?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Farm {
    id: number;
    owner_id: number;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    size_hectares?: number;
    capacity_trees?: number;
    status: FarmStatus;
    soil_type?: string;
    climate?: string;
    historical_performance?: string;
    virtual_tour_url?: string;
    rejection_reason?: string;
    approved_at?: string;
    approved_by?: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    images?: FarmImage[];
    certifications?: FarmCertification[];
    owner?: User;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
};

export interface Tree {
    id: number;
    identifier: string;
    price_cents: number;
    price_formatted: string;
    expected_roi: number;
    expected_roi_formatted: string;
    risk_rating: string;
    min_investment_cents: number;
    max_investment_cents: number;
    min_investment_formatted: string;
    max_investment_formatted: string;
    fruit_crop: {
        variant: string;
        fruit_type: string;
    };
    farm: {
        name: string;
        location?: string;
    };
}

export interface Investment {
    id: number;
    amount_cents: number;
    formatted_amount: string;
    status: InvestmentStatus;
    status_label?: string;
    purchase_date: string;
    created_at?: string;
    tree: {
        id: number;
        identifier: string;
        price_formatted?: string;
        expected_roi?: number;
    };
    transaction?: {
        id: number;
        status: string;
        stripe_payment_intent_id?: string;
    };
}

export interface InvestmentDetail extends Investment {
    tree: Tree & {
        fruit_crop: {
            variant: string;
            fruit_type: string;
        };
        farm: {
            name: string;
            location?: string;
        };
    };
    transaction?: {
        id: number;
        client_secret?: string;
    };
}

export interface PaymentMethod {
    id: number;
    type: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
}
