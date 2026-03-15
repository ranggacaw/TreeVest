export type Role = "investor" | "farm_owner" | "admin";
export type KycStatus = "pending" | "submitted" | "verified" | "rejected";
export type KycDocumentType =
    | "passport"
    | "national_id"
    | "drivers_license"
    | "proof_of_address";
export type FarmStatus =
    | "pending_approval"
    | "active"
    | "suspended"
    | "deactivated";
export type InvestmentStatus =
    | "pending_payment"
    | "active"
    | "listed"
    | "matured"
    | "sold"
    | "cancelled";
export type HarvestStatus =
    | "scheduled"
    | "in_progress"
    | "completed"
    | "failed";
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";
export type QualityGrade = "A" | "B" | "C";
export type PayoutMethod = "bank_transfer" | "digital_wallet";
export type ReportType = "profit_loss" | "tax_summary";
export type GeneratedReportStatus =
    | "pending"
    | "generating"
    | "completed"
    | "failed";
export type ListingStatus = "active" | "sold" | "cancelled";
export type LotStatus =
    | "active"
    | "in_progress"
    | "harvest"
    | "selling"
    | "completed"
    | "cancelled";

export interface Warehouse {
    id: number;
    farm_id: number;
    name: string;
    description: string | null;
    created_at?: string;
    updated_at?: string;
    racks?: Rack[];
    farm?: Farm;
}

export interface Rack {
    id: number;
    warehouse_id: number;
    name: string;
    description: string | null;
    label?: string;
    created_at?: string;
    updated_at?: string;
    lots?: Lot[];
    warehouse?: Warehouse;
}

export interface Lot {
    id: number;
    rack_id: number;
    fruit_crop_id?: number;
    name: string;
    status: LotStatus;
    total_trees: number;
    base_price_per_tree_idr?: number;
    current_price_per_tree_idr: number;
    monthly_increase_rate: number;
    cycle_months: number;
    last_investment_month?: number;
    cycle_started_at?: string;
    created_at?: string;
    updated_at?: string;
    rack?: Rack;
    fruit_crop?: FruitCrop;
    investments_count?: number;
}

export interface PaginatedLots {
    data: Lot[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}


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
    agrotourism_events?: AgrotourismEvent[];
    fruit_crops?: Array<{
        id: number;
        variant: string;
        description?: string;
        harvest_cycle: string;
        fruit_type: {
            id: number;
            name: string;
        };
        trees?: Array<{
            id: number;
            identifier: string;
            tree_identifier: string;
            price_idr: number;
            expected_roi_percent: number;
            min_investment_idr: number;
            max_investment_idr: number;
        }>;
    }>;
}

export interface LocaleMetadata {
    code: string;
    name: string;
    native_name: string;
    flag: string;
    dir: "ltr" | "rtl";
}

export interface LocalePageProps {
    locale: string;
    locales: {
        current: LocaleMetadata;
        supported: Record<string, LocaleMetadata>;
    };
    availableLocales: Record<string, LocaleMetadata>; // Legacy support
    isRtl: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T &
    LocalePageProps & {
        auth: {
            user: User | null;
        };
        flash?: {
            success?: string;
            error?: string;
        };
        /** Globally shared: count of unread notifications for the authenticated user */
        unread_notifications_count: number;
    };

export interface Tree {
    id: number;
    identifier: string;
    price_idr: number;
    price_formatted: string;
    expected_roi: number;
    expected_roi_formatted: string;
    risk_rating: string;
    min_investment_idr: number;
    max_investment_idr: number;
    min_investment_formatted: string;
    max_investment_formatted: string;
    age_years?: number;
    productive_lifespan_years?: number;
    fruit_crop: {
        variant: string;
        fruit_type: string;
        harvest_cycle?: string;
    };
    farm: {
        name: string;
        location?: string;
    };
}

export interface Investment {
    id: number;
    quantity: number;
    amount_idr: number;
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
        expected_roi_percent?: number;
        risk_rating?: string;
        fruit_type?: {
            id: number;
            name: string;
        };
        fruit_crop?: {
            variant: string;
            farm?: {
                name: string;
            };
        };
    };
    transaction?: {
        id: number;
        status: string;
        stripe_payment_intent_id?: string;
    };
    investor?: User;
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

export interface PortfolioSummary {
    total_value_idr: number;
    tree_count: number;
    total_invested_idr: number;
    average_roi_percent: number;
    total_payouts_idr: number;
    tree_count_by_status: Record<string, number>;
}

export interface DiversificationData {
    category: string;
    value_idr: number;
    count: number;
}

export interface HarvestEvent {
    id: number;
    harvest_date: string;
    estimated_yield_kg: number;
    tree_id: number;
    tree_identifier: string;
    fruit_type: string;
    variant: string;
    farm_name: string;
    status: string;
}

export interface PerformanceInvestment {
    investment_id: number;
    tree_identifier: string;
    amount_idr: number;
    projected_return_idr: number;
    actual_return_idr: number;
    difference_idr: number;
}

export interface PerformanceMetrics {
    projected_returns_idr: number;
    actual_returns_idr: number;
    difference_idr: number;
    percentage_gain_loss: number;
    investments: PerformanceInvestment[];
}

export interface PortfolioInvestment {
    id: number;
    amount_idr: number;
    purchase_date: string;
    current_value_idr: number;
    projected_return_idr: number;
    actual_return_idr: number;
    status: string;
    tree: {
        id: number;
        identifier: string;
        status: string;
        risk_rating: string;
        expected_roi_percent: number;
        fruit_type: string;
        variant: string;
        farm_name: string;
    };
    next_harvest?: string;
}

export interface PaginatedInvestments {
    data: PortfolioInvestment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface InvestmentWithDetails {
    id: number;
    amount_idr: number;
    purchase_date: string;
    status: string;
    current_value_idr: number;
    projected_return_idr: number;
    actual_return_idr: number;
    tree: {
        id: number;
        identifier: string;
        status: string;
        age_years: number;
        productive_lifespan_years: number;
        expected_roi_percent: number;
        risk_rating: string;
        fruit_type: string;
        variant: string;
        harvest_cycle: string;
    };
    farm?: {
        id: number;
        name: string;
        city: string;
        state: string;
        image_url?: string;
    };
    harvests: Array<{
        id: number;
        harvest_date: string;
        estimated_yield_kg: number;
        actual_yield_kg: number | null;
        quality_grade?: string;
        notes?: string;
    }>;
}

export interface Harvest {
    id: number;
    tree_id: number;
    fruit_crop_id: number;
    scheduled_date: string;
    status: HarvestStatus;
    estimated_yield_kg: number | null;
    actual_yield_kg: number | null;
    quality_grade: QualityGrade | null;
    market_price_id: number | null;
    platform_fee_rate: number;
    notes: string | null;
    confirmed_by: number | null;
    confirmed_at: string | null;
    completed_at: string | null;
    failed_at: string | null;
    reminders_sent: string[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    tree?: {
        id: number;
        tree_identifier: string;
        price_idr: number;
        expected_roi_percent: number;
        risk_rating: string;
    };
    fruit_crop?: {
        id: number;
        variant: string;
        fruit_type_id: number;
    };
    market_price?: MarketPrice;
    confirmed_by_user?: User;
    payouts?: Payout[];
}

export interface FruitCropRelation {
    id: number;
    variant: string;
    fruit_type_id: number;
    fruit_type: {
        id: number;
        name: string;
    };
    farm: {
        id: number;
        name: string;
        owner?: {
            id: number;
            name: string;
        };
    };
}

export interface HarvestWithRelations extends Harvest {
    tree: {
        id: number;
        tree_identifier: string;
        price_idr: number;
        expected_roi_percent: number;
        risk_rating: string;
        fruit_crop?: {
            farm?: {
                name: string;
                owner?: { name: string };
            };
        };
    };
    fruit_crop: FruitCropRelation;
}

export interface PaginatedHarvests {
    data: HarvestWithRelations[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface MarketPrice {
    id: number;
    fruit_type_id: number;
    price_per_kg_idr: number;
    currency: string;
    effective_date: string;
    created_by: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    fruit_type?: {
        id: number;
        name: string;
        slug: string;
    };
    created_by_user?: User;
}

export interface Payout {
    id: number;
    investment_id: number;
    harvest_id: number;
    investor_id: number;
    gross_amount_idr: number;
    platform_fee_idr: number;
    net_amount_idr: number;
    currency: string;
    status: PayoutStatus;
    payout_method: PayoutMethod | null;
    transaction_id: number | null;
    notes: string | null;
    processing_started_at: string | null;
    completed_at: string | null;
    failed_at: string | null;
    failed_reason: string | null;
    created_at: string;
    updated_at: string;
    gross_amount_formatted: string;
    platform_fee_formatted: string;
    net_amount_formatted: string;
    investment?: {
        id: number;
        amount_idr: number;
        formatted_amount: string;
        purchase_date: string;
        tree: {
            id: number;
            tree_identifier: string;
        };
    };
    harvest?: HarvestWithRelations;
    investor?: User;
    transaction?: {
        id: number;
        status: string;
        stripe_payment_intent_id?: string;
    };
}

export interface ProfitLossRow {
    investmentId: number;
    treeIdentifier: string;
    fruitType: string;
    variant: string;
    farmName: string;
    amountInvestedIdr: number;
    totalPayoutsIdr: number;
    netIdr: number;
    actualRoiPercent: number;
    status: string;
    purchaseDate: string;
}

export interface ProfitLossSummary {
    totalInvestedIdr: number;
    totalPayoutsIdr: number;
    netIdr: number;
    overallRoiPercent: number;
}

export interface PerformanceDataPoint {
    month: string;
    investedIdr: number;
    payoutsIdr: number;
    cumulativeIdr: number;
}

export interface GeneratedReport {
    id: number;
    user_id: number;
    report_type: ReportType;
    parameters: Record<string, unknown>;
    status: GeneratedReportStatus;
    file_path: string | null;
    failure_reason: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface TaxSummaryPayoutRow {
    payoutId: number;
    date: string;
    farmName: string;
    grossAmountIdr: number;
    platformFeeIdr: number;
    netAmountIdr: number;
}

export interface TaxSummaryInvestmentRow {
    investmentId: number;
    date: string;
    farmName: string;
    amountIdr: number;
}

export interface TaxSummaryData {
    year: number;
    income: {
        rows: TaxSummaryPayoutRow[];
        totalIdr: number;
    };
    investments: {
        rows: TaxSummaryInvestmentRow[];
        totalIdr: number;
    };
    summary: {
        totalIncomeIdr: number;
        totalInvestedIdr: number;
        netIdr: number;
    };
}
export interface MarketListing {
    id: number;
    investment_id: number;
    seller_id: number;
    ask_price_idr: number;
    formatted_ask_price: string;
    currency: string;
    platform_fee_rate: number;
    platform_fee_idr: number;
    formatted_platform_fee: string;
    net_proceeds_idr: number;
    formatted_net_proceeds: string;
    status: ListingStatus;
    buyer_id: number | null;
    purchased_at: string | null;
    cancelled_at: string | null;
    expires_at: string | null;
    notes: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    investment: {
        id: number;
        amount_idr: number;
        purchase_date: string;
        tree: {
            id: number;
            identifier: string;
            price_idr: number;
            price_formatted: string;
            expected_roi_percent: number;
            risk_rating: string;
            age_years: number;
            fruit_type: FruitType;
            fruit_crop: {
                variant: string;
                farm: {
                    name: string;
                    city?: string;
                };
            };
        };
    };
    seller: User;
    buyer?: User;
}

export interface FruitType {
    id: number;
    name: string;
    slug: string;
}

export interface FruitCrop {
    id: number;
    farm_id: number;
    fruit_type_id: number;
    variant: string;
    description: string | null;
    harvest_cycle: string;
    planted_date: string | null;
    created_at?: string;
    updated_at?: string;
    fruit_type?: FruitType;
    farm?: Farm;
}

export interface InvestmentTransfer {
    id: number;
    investment_id: number;
    listing_id: number;
    from_user_id: number;
    to_user_id: number;
    transfer_price_idr: number;
    formatted_transfer_price: string;
    platform_fee_idr: number;
    formatted_platform_fee: string;
    transaction_id: number | null;
    transferred_at: string;
    created_at: string;
    updated_at: string;
    investment?: {
        id: number;
        tree: {
            identifier: string;
        };
    };
    listing?: {
        id: number;
        ask_price_idr: number;
        formatted_ask_price: string;
    };
    fromUser?: User;
    toUser?: User;
    transaction?: {
        id: number;
        status: string;
    };
}

export interface AdminDashboardProps {
    metrics: {
        total_users: number;
        kyc_verified: number;
        active_investments: number;
        investment_volume_idr: number;
        pending_kyc: number;
        pending_farms: number;
        completed_harvests: number;
        total_payouts_idr: number;
    };
    recentActivity: Array<{
        type: string;
        description: string;
        actor_name: string;
        created_at: string;
    }>;
    date_from?: string;
    date_to?: string;
}

export interface FarmOwnerDashboardProps {
    metrics: {
        total_farms: number;
        active_farms: number;
        total_trees: number;
        total_investors: number;
        total_earnings_idr: number;
    };
    farms: Array<{
        id: number;
        name: string;
        status: FarmStatus;
    }>;
    upcoming_harvests: Array<{
        id: number;
        harvest_date: string;
        farm_name: string;
        fruit_type: string;
        status: string;
    }>;
    recent_health_updates: Array<{
        id: number;
        date: string;
        farm_name: string;
        severity: string;
        description: string;
    }>;
}

export interface InvestorDashboardProps {
    metrics: {
        total_invested_idr: number;
        active_trees: number;
        total_payouts_idr: number;
        portfolio_roi_percent: number;
        total_investments_count: number;
    };
    kyc_status: string;
    upcoming_harvests: Array<{
        id: number;
        harvest_date: string;
        farm_name: string;
        fruit_type: string;
        estimated_yield_kg: number;
    }>;
    recent_payouts: Array<{
        id: number;
        date: string;
        amount_idr: number;
        farm_name: string;
        status: string;
    }>;
    recent_investments: Array<{
        id: number;
        date: string;
        amount_idr: number;
        farm_name: string;
        status: string;
    }>;
}

// ─── Agrotourism ─────────────────────────────────────────────────────────────

export type AgrotourismEventType = "online" | "offline" | "hybrid";
export type AgrotourismRegistrationStatus =
    | "pending"
    | "confirmed"
    | "cancelled";

export interface AgrotourismEvent {
    id: number;
    farm_id: number;
    title: string;
    description: string | null;
    event_date: string;
    event_type: AgrotourismEventType;
    max_capacity: number | null;
    location_notes: string | null;
    is_registration_open: boolean;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    // Relations (loaded conditionally)
    farm?: Farm;
    registrations?: AgrotourismRegistration[];
    // Computed / withCount
    confirmed_registrations_count?: number;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
    wishlist_id: number;
    id: number;
    identifier: string;
    price_idr: number;
    expected_roi_percent: number;
    risk_rating: string;
    status: string;
    fruit_crop: {
        variant: string;
        fruit_type: string;
        harvest_cycle: string | null;
    };
    farm: {
        id: number;
        name: string;
    };
    added_at: string;
}

// ─── Portfolio Dashboard (redesigned) ────────────────────────────────────────

export interface PortfolioSummaryHeader {
    total_invested_idr: number;
    current_value_idr: number;
    gain_loss_idr: number;
    gain_loss_percent: number;
    total_payouts_idr: number;
    pending_payouts_idr: number;
    total_trees?: number;
}

export interface HoldingWithSparkline {
    id: number;
    quantity: number;
    amount_idr: number;
    purchase_date: string;
    status: string;
    actual_return_idr: number;
    projected_return_idr: number;
    gain_loss_idr: number;
    gain_loss_percent: number;
    sparkline: number[];
    tree: {
        id: number;
        identifier: string;
        status: string;
        risk_rating: string;
        expected_roi_percent: number;
        fruit_type: string;
        variant: string;
        farm_name: string;
    } | null;
}

export interface PaginatedHoldings {
    data: HoldingWithSparkline[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PortfolioTransaction {
    id: number;
    type: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
    completed_at: string | null;
}

export interface PaginatedTransactions {
    data: PortfolioTransaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// ─── Agrotourism ─────────────────────────────────────────────────────────────

export interface AgrotourismRegistration {
    id: number;
    event_id: number;
    user_id: number;
    registration_type: AgrotourismEventType;
    status: AgrotourismRegistrationStatus;
    confirmed_at: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    // Relations (loaded conditionally)
    event?: AgrotourismEvent;
    investor?: User;
}

// Growth Timeline Types
export type GrowthMilestoneType =
    | "planting"
    | "first_leaves"
    | "flowering"
    | "fruit_set"
    | "fruit_growth"
    | "pre_harvest"
    | "harvest"
    | "post_harvest"
    | "pruning"
    | "fertilization"
    | "pest_control";

export type TreeHealthStatus =
    | "excellent"
    | "good"
    | "fair"
    | "poor"
    | "critical";

export interface TreeGrowthTimeline {
    id: number;
    tree_id: number;
    lot_id: number;
    milestone_type: GrowthMilestoneType;
    milestone_type_label: string;
    milestone_type_icon: string;
    milestone_type_color: string;
    health_status: TreeHealthStatus;
    health_status_label: string;
    health_status_icon: string;
    health_status_color: string;
    title: string;
    description?: string;
    photos: string[];
    height_cm?: number;
    trunk_diameter_cm?: number;
    fruit_count?: number;
    recorded_at: string;
    visibility: "public" | "private";
    author_id: number;
    created_at: string;
    updated_at: string;
    // Relations (loaded conditionally)
    tree?: Tree;
    author?: User;
}

// Location Hierarchy Types
export interface LocationHierarchyData {
    farm: {
        id: number;
        name: string;
        city?: string;
        state?: string;
        country?: string;
    };
    warehouse: {
        id: number;
        name: string;
        description?: string;
    };
    rack: {
        id: number;
        name: string;
        description?: string;
    };
    lot: {
        id: number;
        name: string;
        status: LotStatus;
        total_trees: number;
    };
    tree: {
        id: number;
        identifier: string;
        latitude?: number;
        longitude?: number;
        qr_code?: string;
    };
    fruit_crop: {
        id: number;
        variant: string;
        fruit_type: {
            id: number;
            name: string;
        };
    };
}
