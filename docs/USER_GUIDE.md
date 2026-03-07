# Treevest — User Guide

> **Platform:** Fruit Crops Investment Platform
> **Currency:** Indonesian Rupiah (IDR)
> **Version:** 1.0 — March 2026

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Getting Started](#2-getting-started)
3. [Authentication & Account Setup](#3-authentication--account-setup)
4. [Investor Guide](#4-investor-guide)
5. [Farm Owner Guide](#5-farm-owner-guide)
6. [Admin Guide](#6-admin-guide)
7. [Shared Features (All Roles)](#7-shared-features-all-roles)
8. [Investment Flow Diagram](#8-investment-flow-diagram)
9. [Demo Credentials](#9-demo-credentials)

---

## 1. Platform Overview

Treevest is an AgriTech investment platform that lets individuals invest in real fruit trees on partner farms across Indonesia. Instead of buying stocks or shares, users purchase a financial stake in individual fruit-bearing trees — earning returns tied to actual agricultural harvest cycles.

### User Roles

| Role | Who They Are | What They Do |
|------|-------------|--------------|
| **Investor** | Individual users | Browse marketplace, buy tree investments, monitor portfolio, receive payouts |
| **Farm Owner** | Agricultural partners | Create farm profiles, list crops and trees, manage harvests, post health updates |
| **Admin** | Platform managers | Approve farms and KYC, manage users, oversee platform operations |

### The Investment Flow (Confirmed Appropriate)

The diagram you provided matches the platform exactly:

```
Investor Browses       Selects Farm       Purchases Tree       Monitors Growth
  Marketplace      -->   & Crop Type  -->  Investment      -->   & Health
       |                                        |                    |
       v                                        v                    v
  Farm Discovery         Risk & ROI         Payment via          Portfolio
  (Map + Filters)        Disclosure         Stripe/Local         Dashboard
                                                |                    |
                                                v                    v
                                           Portfolio             Harvest &
                                           Updated               Returns
                                                                     |
                                                                     v
                                                                  Payout
                                                             (Bank/Wallet/
                                                              Reinvest)
```

Every step in this diagram is implemented in the platform. The flow is accurate.

---

## 2. Getting Started

### Starting the Application

```bash
# Navigate to the project directory
cd C:\laragon\www\treevest

# Start all services (Laravel server + Vite + Queue worker + Log viewer)
composer dev
```

Then open your browser and go to: **`http://localhost:8000`**

### First-Time Setup (Fresh Install)

```bash
# Run migrations and seed demo data
php artisan migrate:fresh --seed
```

### Useful Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | Start all services concurrently |
| `php artisan serve` | Start Laravel server only |
| `php artisan pail` | View live application logs |
| `php artisan optimize:clear` | Clear all cache |
| `composer test` | Run test suite |

---

## 3. Authentication & Account Setup

### 3.1 Registration Options

Users can create an account through three methods:

**Email Registration** — `/register`
- Fill in name, email, password
- Verify email via confirmation link

**Phone Registration** — `/phone/register`
- Enter phone number
- Receive 6-digit OTP via SMS (valid 10 minutes)
- Verify OTP to activate account

**Social Login (OAuth)** — on the login page
- Supported providers: **Google**, **Facebook**, **Apple**
- One-click registration and login
- Can link/unlink providers later in profile settings

### 3.2 Email & Password Login

1. Go to `/login`
2. Enter email and password
3. If 2FA is enabled, you will be redirected to `/two-factor/challenge`

### 3.3 Two-Factor Authentication (2FA)

Go to `/profile/2fa` to manage 2FA. Two modes are available:

- **TOTP App** — Use Google Authenticator or similar apps
- **SMS OTP** — Receive a code via text message

**Setup steps:**
1. Profile → Two-Factor Auth
2. Click **Enable 2FA**
3. Scan the QR code with your authenticator app (or choose SMS)
4. Enter the verification code to confirm
5. Save your **8 recovery codes** in a safe place

Recovery codes can be regenerated from the same page if lost.

### 3.4 KYC Verification (Investors Only)

KYC (Know Your Customer) is **mandatory** before making any investment.

**Steps:**
1. Go to `/profile/kyc`
2. Click **Upload Documents**
3. Upload a government-issued ID (passport, national ID, etc.)
4. Click **Submit for Review**
5. Wait for Admin approval (you will receive a notification)

**KYC Statuses:**

| Status | Meaning |
|--------|---------|
| `pending` | Not yet submitted |
| `submitted` | Under admin review |
| `verified` | Approved — can invest |
| `rejected` | Rejected — resubmit with valid documents |

KYC verification expires after 2 years and must be renewed.

### 3.5 Profile Management

All users can manage their profile at `/profile`:

- **Update name, email, avatar** — `/profile`
- **Change password** — `/profile` → Password section
- **Manage sessions** — `/profile/sessions` (revoke devices)
- **Language preference** — Toggle between English (`en`) and Bahasa Indonesia (`id`)
- **Link/unlink OAuth providers** — `/profile/account-settings`
- **Account deactivation / deletion** — `/profile/account-settings`
- **GDPR data export** — Request a download of all your personal data

---

## 4. Investor Guide

> **Login:** `investor@treevest.com` / `investor123`
> **Dashboard:** `/investor/dashboard`

### 4.1 Investor Dashboard

The dashboard at `/investor/dashboard` shows:

| Metric | Description |
|--------|-------------|
| Total Portfolio Value | Sum of all active investments |
| Active Investments | Number of trees currently invested in |
| Total Returns | Total payouts received |
| Pending Payouts | Payouts awaiting processing |
| Upcoming Harvests | Next scheduled harvest dates |

The dashboard also shows **Recent Payouts** and **Recent Investments** for a quick overview.

### 4.2 Browsing the Marketplace

**Farm Marketplace** — `/farms`

- View all approved farms with images, location, and crop information
- Filter by fruit type, risk rating, ROI range, location
- Use the map view to discover nearby farms (geolocation)
- Click any farm to see its full profile including certifications, climate data, and available trees

**Farm Detail Page** — `/farms/{farm}`

Each farm profile shows:
- Farm images gallery
- Location and climate information
- Certifications (GAP, Organic, HACCP, etc.)
- Available fruit crops and tree varieties
- Historical performance data
- Individual trees available for investment

**Tree Detail** — From the farm page, click any tree to see:
- Price per tree (in IDR)
- Expected ROI percentage
- Risk rating (Low / Medium / High)
- Tree age and productive lifespan
- Historical yield data
- Min/max investment limits

### 4.3 Making an Investment

> Requires: KYC verified status

1. Browse the marketplace and select a farm → `/farms`
2. Choose a fruit crop and select a tree
3. Click **Invest in This Tree** → `/investments/create/{tree}`
4. Configure your investment:
   - Enter the investment amount (within min/max limits)
   - Review risk disclosure and terms
5. Choose your payment method (saved card, bank account, or add new)
6. Click **Confirm Investment**
7. Payment is processed via Stripe
8. You are redirected to the **Confirmation Page** → `/investments/{investment}/confirmation`
9. Your portfolio is automatically updated

**Payment Methods** — `/payment-methods`

Before investing, you can save payment methods:
- Credit/Debit card (Visa, Mastercard, Amex)
- Bank account
- Set a default payment method for faster checkout

### 4.4 Portfolio Management

**Investments List** — `/investments`

- View all your investments (active, pending, cancelled)
- Filter and sort by farm, crop type, status, date
- Click any investment for full details

**Investment Detail** — `/investments/{investment}`

Each investment shows:
- Tree information and current status
- Investment amount and purchase date
- Payout history linked to this tree
- Health updates for this tree's crop
- Option to **Top-Up** the investment

**Portfolio Dashboard** — `/portfolio`

A visual overview of your entire investment portfolio:
- Breakdown by farm and crop type
- Total value and growth indicators
- Diversification charts
- Projected vs actual returns

### 4.5 Health Feed & Monitoring

**Health Feed** — `/investments/health-feed`

Stay informed about the health of your trees:
- Health updates posted by farm owners
- Severity levels: Low, Medium, High, Critical
- Update types: Routine check, Pest alert, Disease, Weather damage, Growth milestone
- Photo galleries showing tree/crop conditions

**Health Alerts** — `/investments/health-alerts`

Automated and manual alerts for issues affecting your farms:
- Weather-triggered alerts (storms, drought, excess rain)
- Pest and disease outbreaks
- Filter by severity and resolution status

### 4.6 Secondary Market

**Browse Listings** — `/secondary-market`

Buy investments listed for sale by other investors:
- Browse all active listings
- See ask price vs original investment value
- Purchase directly with your saved payment method

**Selling Your Investment** — `/secondary-market/create`

1. Go to **Secondary Market → List for Sale**
2. Select which investment to sell
3. Set your asking price
4. Pay the platform fee (displayed before confirmation)
5. Your listing goes live immediately
6. When sold, ownership transfers and you receive the proceeds

You can cancel an active listing at any time.

### 4.7 Payouts

**Payout History** — `/investor/payouts`

- View all payouts linked to your investments
- Each payout is tied to a completed harvest
- Filter by status, date range, payout method

**Payout Detail** — `/investor/payouts/{payout}`

- Harvest date and actual yield (kg)
- Quality grade (A / B / C)
- Market price applied (IDR per kg)
- Gross profit and platform fee
- Net payout amount
- Payout method used

**Payout Methods** (set during investment or updated in profile):
- Bank transfer
- Digital wallet
- Reinvest (automatically purchases more tree investments)

### 4.8 Financial Reports

**P&L Reports** — `/reports`

- View your Profit & Loss statement with customizable date range
- Charts for investment performance over time
- Filter by farm, crop type, date

**Export Options:**
- **PDF** — Request generation (async, you will be notified when ready) → `/reports/pdf`
- **CSV** — Immediate download → `/reports/csv`
- **Download generated report** → `/reports/download/{report}`

**Tax Summary** — `/reports/tax/{year}`

- Annual summary of all income (payouts) and investment activity
- Suitable for tax reporting purposes
- Also exportable as PDF or CSV

### 4.9 Education Center

**Education Articles** — `/education`

Articles covering:
- How tree investment works
- Understanding ROI projections
- Risk factors and mitigation
- Reading harvest and yield reports
- Investment strategies

**Fruit Encyclopedia** — `/encyclopedia`

Detailed entries for each fruit type:
- Durian (Musang King, D24, Black Thorn, Red Prawn)
- Mango (Alphonso, Nam Doc Mai, Carabao, Kent)
- Grapes (Thompson Seedless, Shine Muscat)
- Melon, Citrus, and more

---

## 5. Farm Owner Guide

> **Login:** `farmowner@treevest.com` / `farm123`
> **Dashboard:** `/farm-owner/dashboard`

### 5.1 Farm Owner Dashboard

The dashboard at `/farm-owner/dashboard` shows:

| Metric | Description |
|--------|-------------|
| Total Farms | Number of your farms on the platform |
| Active Trees | Total investable trees across your farms |
| Upcoming Harvests | Harvests scheduled in the near future |
| Recent Health Updates | Latest health updates you've posted |
| Investor Count | Number of investors in your trees |

### 5.2 Creating a Farm Listing

1. Go to **My Farms → Create Farm** → `/farms/manage/create`
2. Fill in farm details:
   - Farm name, description
   - Location (address, city, state, country, coordinates)
   - Size in hectares and maximum tree capacity
   - Soil type and climate description
   - Historical performance data
3. Upload farm images (drag and drop, multiple images supported)
4. Add certifications (GAP, Organic, HACCP, etc.) with expiry dates
5. Submit for admin approval

**Farm Statuses:**

| Status | Meaning |
|--------|---------|
| `pending_approval` | Submitted, awaiting admin review |
| `active` | Approved and listed on marketplace |
| `suspended` | Temporarily removed by admin |
| `deactivated` | Permanently removed |

You will receive a notification when your farm is approved or rejected (with reason).

### 5.3 Managing Farms

**My Farms** — `/farms/manage`

- View all your farms and their statuses
- Click any farm to see the full management view
- Edit farm details, add/remove images, update certifications

**Edit Farm** — `/farms/manage/{farm}/edit`

- Update any farm information
- Add new gallery images
- Delete specific images
- Update certification documents

### 5.4 Adding Fruit Crops

Once a farm is approved, add the crops grown on it:

1. Go to **My Farms → Manage → Crops** tab
2. Click **Add Fruit Crop**
3. Select the fruit type (Durian, Mango, Grapes, etc.)
4. Enter the specific variety (e.g., Musang King)
5. Set the harvest cycle (annual / bi-annual / seasonal)
6. Enter the planting date

### 5.5 Listing Trees for Investment

For each crop, list individual trees as investable units:

1. Go to **Farm → Crop → Trees → Add Tree**
2. Set the tree details:
   - Tree identifier (unique code)
   - Price per tree (IDR)
   - Expected ROI percentage
   - Tree age (years)
   - Productive lifespan (years)
   - Risk rating (Low / Medium / High)
   - Minimum and maximum investment limits
3. Trees become visible to investors on the marketplace once the farm is active

**Tree Statuses:**

| Status | Meaning |
|--------|---------|
| `seedling` | New tree, not yet investable |
| `growing` | Young tree, investable but lower yield |
| `productive` | Prime yield stage, fully investable |
| `declining` | Aging, reduced yield projection |
| `retired` | No longer producing, investment closed |

### 5.6 Posting Health Updates

Keep investors informed about crop conditions:

**Create Health Update** — `/farm-owner/health-updates/create`

1. Select the fruit crop
2. Choose the update type:
   - **Routine** — Regular checkup, all normal
   - **Pest Alert** — Pest detected on the crop
   - **Disease** — Disease outbreak
   - **Damage** — Physical damage (weather, accident)
   - **Weather Impact** — Weather affecting crop health
3. Set severity: **Low / Medium / High / Critical**
4. Write a title and detailed description
5. Upload photos (drag and drop, multiple supported)
6. Set visibility: public (investors can see) or internal

**Manage Updates** — `/farm-owner/health-updates`

- View, edit, or delete health updates
- Investors see these on their health feed

### 5.7 Managing Harvests

The harvest lifecycle has 5 stages: **Scheduled → In Progress → Yield Recorded → Confirmed → Completed (or Failed)**

**Schedule a Harvest** — `/farm-owner/harvests/create`

1. Select the tree/crop
2. Set the scheduled harvest date
3. Enter estimated yield (kg)
4. Submit — investors are notified

**Harvest Lifecycle Actions** — `/farm-owner/harvests/{harvest}`

| Action | When to Use |
|--------|------------|
| **Start Harvest** | When harvest begins |
| **Record Yield** | After picking — enter actual yield kg, quality grade (A/B/C), and notes |
| **Confirm Harvest** | Verify all data is correct — triggers profit calculation and payout creation |
| **Mark as Failed** | If harvest could not be completed (with reason) |

> Once a harvest is **Confirmed**, the system automatically:
> 1. Calculates profit based on actual yield × current market price
> 2. Deducts platform fees
> 3. Creates individual payouts for each investor proportional to their investment
> 4. Sends notifications to all affected investors

**Harvest History** — `/farm-owner/harvests`

- View all past and upcoming harvests
- Filter by status, date, crop
- Click any harvest to see full detail including payout breakdown

---

## 6. Admin Guide

> **Login:** `admin@treevest.com` / `admin123`
> **Dashboard:** `/admin/dashboard`

### 6.1 Admin Dashboard

The dashboard at `/admin/dashboard` shows platform-wide KPIs:

| Metric | Description |
|--------|-------------|
| Total Users | All registered users by role |
| Total Farms | Active farms on the platform |
| Total Investments | All investment records |
| Total Payouts | Payouts distributed (value in IDR) |
| Pending KYC | KYC submissions awaiting review |
| Pending Farms | Farm applications awaiting approval |

**Date Range Filter** — Filter all metrics by custom date range (top of dashboard).

**Recent Activity Feed** — Shows the latest significant platform events (new users, new investments, completed harvests, KYC submissions).

### 6.2 User Management

**User List** — `/admin/users`

- View all registered users across all roles
- Filter by role (admin, investor, farm_owner), status, KYC status
- Search by name or email
- Click any user to see their full profile

**User Actions** — `/admin/users/{user}`

| Action | Description |
|--------|-------------|
| **Update Role** | Change user role (investor ↔ farm_owner ↔ admin) |
| **Suspend User** | Temporarily block access with a reason |
| **Reactivate User** | Restore access for a suspended user |
| **View KYC** | See the user's KYC verification status and documents |
| **View Investments** | See the user's investment history |
| **View Audit Logs** | See all actions this user has taken |

### 6.3 KYC Review

**KYC Queue** — `/admin/kyc`

- View all KYC submissions across all users
- Filter by status (submitted, verified, rejected)
- Shows submission date and jurisdiction

**Review a KYC Submission** — `/admin/kyc/{verification}`

1. Preview uploaded identity documents (`/admin/kyc/documents/{document}/preview`)
2. Verify document authenticity
3. Choose an action:
   - **Approve** — Marks KYC as `verified`, user can now invest
   - **Reject** — Marks KYC as `rejected` with a rejection reason (user is notified)

### 6.4 Farm Approval

**Farm Applications** — `/admin/farms`

- View all farms with their approval status
- Filter by status (pending, active, suspended)

**Review a Farm** — `/admin/farms/{farm}`

- View full farm details: location, images, certifications, crops, trees
- Check farm owner's KYC status

**Farm Actions:**

| Action | Description |
|--------|-------------|
| **Approve** | Farm goes live on the marketplace |
| **Reject** | Farm rejected with a reason (farm owner notified) |
| **Suspend** | Temporarily remove from marketplace |
| **Reinstate** | Restore a suspended farm |

### 6.5 Harvest Monitoring

**All Harvests** — `/admin/harvests`

Platform-wide view of all harvest records:
- Filter by status, farm, date range
- View harvests in progress that may need attention

**Harvest Detail** — `/admin/harvests/{harvest}`

- Full harvest information including yield, quality grade
- Investor payout breakdown
- Associated market price used for calculation

### 6.6 Market Price Management

**Market Prices** — `/admin/market-prices`

Manage daily market prices for each fruit type (IDR per kg). These prices are used for harvest profit calculations.

- View price history and trends
- Add new price entries — `/admin/market-prices/create`
- Edit existing prices — `/admin/market-prices/{id}/edit`
- Prices are recorded per fruit type per date

> Market prices directly affect investor payouts. Set prices carefully before confirming harvests.

### 6.7 Content Management

**Article CMS** — `/admin/articles`

Create and manage educational articles and encyclopedia entries:

1. **Create Article** → `/admin/articles/create`
   - Title, slug (auto-generated from title)
   - Rich text editor (TipTap) with image upload support
   - Excerpt and featured image
   - Assign categories and tags
   - SEO fields: meta title, meta description, meta keywords
2. **Publish / Unpublish** — Control article visibility on the public site
3. **Edit / Delete** existing articles

**Fruit Types** — `/admin/fruit-types`

Manage the master list of fruit types available on the platform (Durian, Mango, Grapes, Melon, Citrus, etc.).

### 6.8 Investment Oversight

**All Investments** — `/admin/investments`

Read-only view of every investment on the platform:
- Filter by status, investor, farm, date range
- View investment amount, tree details, payment status

**Investment Detail** — `/admin/investments/{investment}`

- Full investment record including transaction history
- Linked payouts and harvests
- Payment method used

### 6.9 Notification Templates

**Templates** — `/admin/notification-templates`

Admin-configurable message templates for all system notifications:

- Create templates with placeholders for dynamic content (e.g., `{investor_name}`, `{harvest_date}`)
- Set the delivery channel: Email, SMS, Push, Database
- Enable or disable templates
- Templates cover events: harvest scheduled, payout created, KYC approved/rejected, health alert, etc.

### 6.10 Audit Logs

**Audit Trail** — `/admin/audit-logs`

Immutable log of all significant platform actions:
- User authentication events (login, logout, failed attempts)
- Financial transactions
- Administrative actions (approvals, rejections, role changes)
- KYC submissions and decisions
- Account changes

Filter by event type, user, date range. Each entry includes IP address, user agent, and full event data.

### 6.11 Secondary Market Oversight

**Market Listings** — `/admin/market-listings`

Monitor all secondary market activity:
- View active and cancelled listings
- Remove inappropriate or policy-violating listings
- See transfer history for investments

### 6.12 Translation Management

**Translation Manager** — `/admin/translations`

Manage the platform's bilingual content (English / Bahasa Indonesia):

- **Review Queue** — `/admin/translations/queue` — Approve or reject submitted translations
- **Batch Approve** — Approve multiple translations at once
- **Generate AI Draft** — Request an AI-generated translation draft for content
- **Edit Translation** — Manually edit translations for any article or encyclopedia entry
- All content (articles, encyclopedia entries) can be translated separately for each locale

---

## 7. Shared Features (All Roles)

### 7.1 Notifications

**Notification Center** — `/notifications`

- View all notifications (harvest updates, payout alerts, KYC decisions, health alerts)
- Mark individual or all notifications as read
- Delete notifications
- Click any notification to see the full context

**Notification Preferences** — `/settings/notifications`

Control which notifications you receive and via which channel:
- Channels: **Email**, **SMS**, **Push (web)**, **In-app (database)**
- Toggle each notification type per channel independently

### 7.2 Language Switching

Switch between **English** and **Bahasa Indonesia** from any page:
- Use the language switcher in the navigation bar
- Your preference is saved to your account and persists across sessions
- Guest users are detected by browser language settings

### 7.3 Legal Documents

| Page | URL |
|------|-----|
| Privacy Policy | `/legal/privacy` |
| Terms of Service | `/legal/terms` |
| Risk Disclosure | `/legal/risk` |

Users must accept these documents during onboarding. Acceptance is recorded with timestamp and IP address.

### 7.4 Active Sessions

**Sessions** — `/profile/sessions`

- View all active login sessions (browser, device, IP, last active)
- Revoke any individual session (useful if you see an unfamiliar device)
- Revoke all other sessions with a single click

---

## 8. Investment Flow Diagram

Below is the full end-to-end flow across all three roles:

```
[FARM OWNER]                    [ADMIN]                     [INVESTOR]
     |                             |                              |
1. Create farm listing         2. Review & approve           3. Browse marketplace
   /farms/manage/create           /admin/farms                  /farms
     |                             |                              |
     v                             v                              v
   Add fruit crops              Farm goes live               Select farm & tree
   /farm-owner crops tab           |                         /farms/{farm}
     |                             |                              |
     v                             |                              v
   List trees for sale             |                         Configure investment
   /farm-owner/trees               |                         /investments/create/{tree}
     |                             |                              |
     |                             |                              v
     |                             |                         Pay via Stripe
     |                             |                         /investments (POST)
     |                             |                              |
     |                             |                              v
     |                             |                         Confirmation
     |                             |                         /investments/{id}/confirmation
     |                             |                              |
     v                             |                              v
4. Post health updates             |                         Monitor portfolio
   /farm-owner/health-updates      |                         /portfolio
     |                             |                              |
     v                             |                              v
5. Schedule harvest                |                         View health feed
   /farm-owner/harvests/create     |                         /investments/health-feed
     |                             |                              |
     v                             v                              |
6. Record yield &              Monitor harvests              7. Receive payout
   confirm harvest             /admin/harvests                   /investor/payouts
   /farm-owner/harvests/{id}       |                              |
     |                         Update market prices               v
     |                         /admin/market-prices          View P&L report
     |                             |                         /reports
     v                             v                              |
  [System auto-calculates profit & creates payouts]               v
                                                            Tax summary
                                                            /reports/tax/{year}
```

---

## 9. Demo Credentials

Use these accounts to explore each role in the demo environment (`http://localhost:8000`):

### Admin

| Field | Value |
|-------|-------|
| Email | `admin@treevest.com` |
| Password | `admin123` |
| Access | Full platform management |

### Farm Owner

| Field | Value |
|-------|-------|
| Email | `farmowner@treevest.com` |
| Password | `farm123` |
| Access | Farm management, health updates, harvests |

### Investor

| Field | Value |
|-------|-------|
| Email | `investor@treevest.com` |
| Password | `investor123` |
| Access | Marketplace, investments, portfolio, payouts, reports |

### Additional Demo Users

| Email | Password | Role |
|-------|----------|------|
| `john.investor@example.com` | `password` | Investor |
| `jane.farmer@example.com` | `password` | Farm Owner |

> All demo users have pre-verified KYC status so you can test the full investment flow immediately.

### Pre-loaded Demo Data

| Data | Count |
|------|-------|
| Active Farms | 4 (Bogor, Cirebon, Semarang, Bali) |
| Investable Trees | 110+ (Durian, Mango, Grapes, Citrus, Melon) |
| Active Investments | 8+ |
| Completed Harvests | 110+ |
| Payouts | 40+ |
| Health Updates | 200+ |
| Market Price Records | 360+ |
| Education Articles | 11 |

---

## Appendix: Key URLs at a Glance

### Public (No Login Required)

| URL | Page |
|-----|------|
| `/` | Landing page |
| `/farms` | Farm marketplace |
| `/education` | Education center |
| `/encyclopedia` | Fruit encyclopedia |
| `/legal/privacy` | Privacy policy |
| `/legal/terms` | Terms of service |
| `/legal/risk` | Risk disclosure |

### Investor

| URL | Page |
|-----|------|
| `/investor/dashboard` | Dashboard |
| `/farms` | Browse marketplace |
| `/investments` | My investments |
| `/portfolio` | Portfolio overview |
| `/investments/health-feed` | Health feed |
| `/investor/payouts` | Payout history |
| `/reports` | Financial reports |
| `/reports/tax` | Tax summary |
| `/secondary-market` | Secondary market |
| `/payment-methods` | Saved payment methods |

### Farm Owner

| URL | Page |
|-----|------|
| `/farm-owner/dashboard` | Dashboard |
| `/farms/manage` | My farms |
| `/farms/manage/create` | Create farm |
| `/farm-owner/health-updates` | Health updates |
| `/farm-owner/health-updates/create` | Post health update |
| `/farm-owner/harvests` | Harvests |
| `/farm-owner/harvests/create` | Schedule harvest |

### Admin

| URL | Page |
|-----|------|
| `/admin/dashboard` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/kyc` | KYC review queue |
| `/admin/farms` | Farm approval queue |
| `/admin/harvests` | Harvest monitoring |
| `/admin/market-prices` | Market price management |
| `/admin/articles` | Content CMS |
| `/admin/investments` | Investment oversight |
| `/admin/audit-logs` | Audit trail |
| `/admin/market-listings` | Secondary market oversight |
| `/admin/notification-templates` | Notification templates |
| `/admin/translations` | Translation management |

### Profile & Account (All Roles)

| URL | Page |
|-----|------|
| `/profile` | Edit profile |
| `/profile/2fa` | Two-factor auth |
| `/profile/kyc` | KYC verification |
| `/profile/sessions` | Active sessions |
| `/settings/notifications` | Notification preferences |
| `/notifications` | Notification center |
