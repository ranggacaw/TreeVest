# Change: Implement Investment Purchase Flow

## Why
Enable the core business transaction of the platform: allowing verified investors to purchase fruit tree investments through a secure, compliant multi-step flow. This implements EPIC-006 and is the primary revenue-generating capability of Treevest.

Without this change, users can browse trees on the marketplace but cannot actually invest. This feature connects investors to agricultural assets and activates the investment lifecycle.

## What Changes
- Add Investment model and database schema to track individual tree investments
- Implement multi-step investment purchase wizard (Inertia/React pages):
  1. Tree selection and investment details review
  2. Investment amount input with min/max validation
  3. KYC verification gate (block if not verified)
  4. Risk disclosure acceptance
  5. Terms and conditions acceptance
  6. Payment method selection
  7. Purchase confirmation and receipt
- Add InvestmentService for business logic orchestration
- Add InvestmentController for HTTP handling
- Add investment purchase validation (FormRequest classes)
- Add investment status tracking (InvestmentStatus enum)
- Add investment-to-tree relationship management
- Add portfolio update logic upon successful payment
- Integrate with existing payment processing system (transactions)
- Add investment top-up capability (additional investment in already-owned tree)
- Add investment cancellation before payment confirmation
- Add audit trail integration for all investment events
- Add investment confirmation notification triggers

## Impact
**New Specs Created:**
- `investment-purchase` (new capability)

**Modified Specs:**
- None (self-contained new capability, depends on existing payment-processing, kyc-verification, and tree-marketplace)

**Affected Code:**
- `app/Models/Investment.php` — new model
- `app/Enums/InvestmentStatus.php` — new enum
- `app/Services/InvestmentService.php` — new service
- `app/Http/Controllers/InvestmentController.php` — new controller
- `app/Http/Requests/StoreInvestmentRequest.php` — new FormRequest
- `app/Http/Requests/UpdateInvestmentAmountRequest.php` — new FormRequest
- `database/migrations/*_create_investments_table.php` — new migration
- `resources/js/Pages/Investments/Purchase/` — new React pages
- `resources/js/Components/InvestmentPurchaseWizard.tsx` — new component
- `routes/web.php` — add investment purchase routes

**Dependencies:**
- Requires `payment-processing` spec (transaction handling)
- Requires `kyc-verification` spec (verification gate)
- Requires `tree-marketplace` spec (tree selection)
- Requires `notifications` spec (confirmation emails)
- Requires `audit-logging` spec (transaction audit trail)

**Breaking Changes:**
- None (net new feature)

**Data Migration:**
- New `investments` table created

**Risks:**
- Concurrent investment attempts on the same tree need atomic handling (database locks or optimistic locking)
- Investment-to-payment linkage must be atomic (DB transactions)
- KYC expiry during purchase flow needs graceful handling
- Investment top-up logic needs careful validation to prevent double-counting
