# Treevest Investment Platform - Demo Data Summary

## Overview
Your Treevest application has been fully populated with demo data and is ready for client demonstration. All core features are functional with realistic test data.

---

## ✅ Data Populated Successfully

### Users & Authentication
- **Admin User**: `admin@treevest.com` / `admin123`
- **Investor Users**: 
  - `investor@treevest.com` / `investor123`
  - `john.investor@example.com` / `password`
- **Farm Owner Users**:
  - `farmowner@treevest.com` / `farm123`
  - `ahmad@farm.example.com` (Durian & Mango Farm)
  - `sarah@farm.example.com` (Grape & Citrus Farm)
  - `jane.farmer@example.com` / `password`
- **Total**: 5+ users with various roles

### KYC Data
- All users have KYC verification records
- Verified users have KYC documents (passport, national ID, etc.)
- Mix of verified, pending, and rejected KYC statuses for demo purposes

### Farms (4 Active Farms)
1. **Musang King Durian Orchard** (Bogor, West Java)
   - 25.5 hectares, 1200 trees capacity
   - GAP Certification
   - Growing Musang King & Black Thorn varieties

2. **Tropical Mango Paradise** (Cirebon, West Java)
   - 18.0 hectares, 800 trees capacity
   - Organic Certification
   - Growing Alphonso & Nam Doc Mai varieties

3. **Royal Grape Vineyard** (Semarang, Central Java)
   - 8.5 hectares, 500 trees capacity
   - Controlled greenhouse environment
   - Growing Shine Muscat grapes
   - Status: Pending Approval

4. **Citrus Grove Estate** (Kintamani, Bali)
   - 12.0 hectares, 600 trees capacity
   - HACCP Certification
   - Growing Valencia oranges
   - Highland tropical climate

### Fruit Crops & Trees
- **Total Trees**: 110+ investable trees
- **Fruit Types**: Durian, Mango, Grapes, Citrus, Melon
- **Varieties**: Musang King, Black Thorn, Alphonso, Nam Doc Mai, Shine Muscat, Valencia Orange
- **Tree Prices**: Rp 500,000 - Rp 2,500,000 per tree
- **ROI Projections**: 9% - 22%
- **Risk Ratings**: Low, Medium
- **Status**: Productive and Growing trees

### Investments
- **Active Investments**: 8+ investments across users
- **Investment Status**: Active
- **Purchase History**: Various dates over past 6 months
- **Currency**: IDR

### Harvest Data
- **Total Harvests**: 110+ harvest records
- **Statuses**: Scheduled, In Progress, Completed, Failed
- **Quality Grades**: A, B, C
- **Yield Ranges**: 12kg - 250kg per harvest
- **Harvest Schedules**: Annual, Bi-annual based on fruit type

### Payouts
- **Total Payouts**: 40+ payout records
- **Statuses**: Pending, Processing, Completed, Failed
- **Payout Methods**: Bank transfer, Digital wallet, Reinvest
- **Currency**: IDR

### Transactions
- **Total Records**: 50+ transactions
- **Types**: Investment purchase, Top-up, Payout
- **Statuses**: Completed, Failed
- **Payment Methods**: Card, Bank account

### Weather Data
- **Records**: 30 days per farm = 120+ records
- **Conditions**: Sunny, Cloudy, Rain, Storm, etc.
- **Data Points**: Temperature, humidity, wind speed, rainfall
- **Alerts**: Weather-triggered alerts

### Health Monitoring
- **Health Updates**: 200+ updates across all crops
- **Types**: Routine, Pest, Disease, Damage, Weather Impact
- **Severity**: Low, Medium, High, Critical
- **Photos**: Sample photo paths included

### Health Alerts
- **Total Alerts**: 200+ alerts
- **Types**: Weather, Pest, Disease, Manual
- **Statuses**: Resolved and unresolved
- **Severity Mix**: Low (40%), Medium (30%), High (20%), Critical (10%)

### Market Prices
- **Total Records**: 60 days per fruit type = 360+ records
- **Price Ranges** (per kg in IDR):
  - Durian: Rp 40,000 - Rp 60,000
  - Mango: Rp 12,000 - Rp 25,000
  - Grapes: Rp 25,000 - Rp 45,000
  - Melon: Rp 8,000 - Rp 15,000
  - Citrus: Rp 3,000 - Rp 8,000

### Payment Methods
- **Multiple Methods per User**: 1-3 methods each
- **Types**: Card (Visa, Mastercard, Amex), Bank Account
- **Status**: Active with default methods marked

### Notifications
- **Notification Templates**: 15+ templates across types
- **Delivery Channels**: Email, SMS, Database
- **Notification Preferences**: Configured per user
- **Status Mix**: Delivered, Sent, Failed

### Generated Reports
- **Total Records**: 40+ reports
- **Types**: Profit & Loss, Tax Summary
- **Statuses**: Pending, Generating, Completed, Failed
- **File Paths**: Generated report paths included

### Education Content
- **Articles**: 11 articles
  - 5 Education articles (How investing works, ROI, risk factors, etc.)
  - 6 Encyclopedia articles (Durian, Mango, Grapes, Melon, Citrus, Others)
- **Categories**: 11 categories (Getting Started, Risk Management, Harvest Cycles, Market Analysis, Investment Strategies, plus fruit categories)
- **Tags**: 15 tags for filtering

### Legal Documents
- **Document Types**: Terms of Service, Privacy Policy, Risk Disclaimer
- **User Acceptances**: All users have accepted legal documents

### Notification Preferences
- **All Users**: Have notification preferences configured
- **Channels**: Email, SMS, Database push notifications

---

## 🚀 Accessing the Application

### Development Server
To start the application:
```bash
cd C:\laragon\www\treevest
php artisan serve
```

Access at: `http://localhost:8000`

### Quick Start Commands

**Seed data (already done):**
```bash
php artisan db:seed
```

**Fresh install with data:**
```bash
php artisan migrate:fresh --seed
```

**Run development server:**
```bash
composer dev
```

---

## 📊 Demo Scenarios

### For Admin Demo
1. Login as: `admin@treevest.com` / `admin123`
2. View Dashboard: `/admin/dashboard`
3. Manage Farms: `/admin/farms` - Approve pending farms
4. Manage Articles: `/admin/articles` - Edit content
5. Review KYC: `/admin/kyc` - Approve/reject verifications
6. Monitor Harvests: `/admin/harvests` - Track harvest progress
7. Market Prices: `/admin/market-prices` - Update prices

### For Investor Demo
1. Login as: `investor@treevest.com` / `investor123`
2. Browse Investments: `/investments`
3. View Portfolio: Investment history and current trees
4. View Payouts: `/investments/payouts` - Payout history
5. Generate Reports: `/investments/reports` - P&L and tax reports
6. Health Feed: `/investments/health-feed` - Tree health updates

### For Farm Owner Demo
1. Login as: `farmowner@treevest.com` / `farm123`
2. Manage Health Updates: `/farm-owner/health-updates`
3. Manage Harvests: `/farm-owner/harvests` - Schedule and track harvests

### Education & Encyclopedia
1. Education Center: `/education` - Learning resources
2. Fruit Encyclopedia: `/encyclopedia` - Detailed fruit information
3. Search: `/search` - Search all content

---

## 📈 Key Statistics

| Metric | Count |
|--------|-------|
| Users | 5+ |
| Farms | 4 |
| Fruit Types | 6 |
| Fruit Crops | 6 |
| Trees | 110+ |
| Investments | 8+ |
| Harvests | 110+ |
| Payouts | 40+ |
| Transactions | 50+ |
| Weather Records | 120+ |
| Health Updates | 200+ |
| Health Alerts | 200+ |
| Market Prices | 360+ |
| Articles | 11 |
| Categories | 11 |
| Tags | 15 |
| Generated Reports | 40+ |
| Payment Methods | 10+ |
| KYC Verifications | 5+ |
| KYC Documents | 10+ |

---

## 💡 Demo Tips

### 1. Show Investment Journey
- Browse marketplace → Select tree → View details → See investment in portfolio
- Demonstrates end-to-end investment flow

### 2. Show Returns Calculation
- View completed harvest → See actual yield → View corresponding payout
- Demonstrates how harvests generate returns

### 3. Show Monitoring Dashboard
- View health updates → Check weather data → See alerts
- Demonstrates farm monitoring capabilities

### 4. Show Reporting
- Generate P&L report → Generate tax summary
- Demonstrates financial reporting features

### 5. Show Approval Workflow
- Login as admin → Go to farms → Approve pending farm
- Demonstrates farm approval process

---

## 🎯 Key Features Demonstrated

✅ **User Management** - Multiple user roles (Admin, Investor, Farm Owner)  
✅ **KYC Verification** - Document upload and verification workflow  
✅ **Farm Management** - Farm profiles with images and certifications  
✅ **Fruit Investment** - Tree marketplace with ROI projections  
✅ **Investment Tracking** - Portfolio management and history  
✅ **Health Monitoring** - Health updates and alerts  
✅ **Weather Data** - Real-time weather monitoring  
✅ **Harvest Management** - Scheduling, tracking, and quality grading  
✅ **Payout System** - Automated payout calculation and distribution  
✅ **Market Prices** - Daily price tracking for all fruit types  
✅ **Financial Reporting** - P&L statements and tax summaries  
✅ **Education Content** - Articles and encyclopedia  
✅ **Notification System** - Multi-channel notifications  
✅ **Payment Processing** - Multiple payment methods  
✅ **Transaction History** - Complete audit trail  

---

## 📝 Notes

- All data is realistic but simulated for demo purposes
- Email addresses and passwords are as listed above
- Images referenced in the database are placeholder paths
- The application uses Indonesian Rupiah (IDR) as the default currency
- All dates are in realistic ranges (past 6 months to future 2 months)

---

## 🔧 Technical Details

**Database**: MySQL 8.x  
**Backend**: Laravel 12.x (PHP 8.2+)  
**Frontend**: React 18 + Inertia.js  
**Styling**: Tailwind CSS 3.x  
**Authentication**: Laravel Breeze (Social + Phone + 2FA)  
**2FA**: PragmaRX Google2FA  
**SMS**: Twilio SDK  
**Payments**: Stripe PHP SDK  

---

## 📞 Support

For questions or issues with the demo:
1. Check the logs: `php artisan pail`
2. Run tests: `composer test`
3. Clear cache: `php artisan optimize:clear`

---

**Generated**: 2026-03-04  
**Database**: treevest  
**Seeders Run**: All seeders completed successfully
