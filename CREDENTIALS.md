# TreeVest - User Credentials

## Test User Accounts

The application has been seeded with test users for each role. You can log in with these credentials:

### 1. Administrator
- **Email:** admin@treevest.com
- **Password:** admin123
- **Role:** Admin
- **Access:** Full system access, can manage users, farms, investments, articles, and all platform features

### 2. Farm Owner
- **Email:** farmowner@treevest.com
- **Password:** farm123
- **Role:** Farm Owner
- **Access:** Can create and manage farms, list crops, report harvests, upload growth photos

### 3. Investor
- **Email:** investor@treevest.com
- **Password:** investor123
- **Role:** Investor
- **Access:** Can browse marketplace, purchase investments, track portfolio, view harvests, receive payouts

---

## Additional Demo Users

### 4. Investor - John
- **Email:** john.investor@example.com
- **Password:** password
- **Role:** Investor

### 5. Farm Owner - Jane
- **Email:** jane.farmer@example.com
- **Password:** password
- **Role:** Farm Owner

---

## Sample Data Summary

### Farms Created
1. **Musang King Durian Orchard** - Cameron Highlands, Pahang (Active)
2. **Tropical Mango Paradise** - Kuala Muda, Kedah (Active)
3. **Royal Grape Vineyard** - Seri Kembangan, Selangor (Pending Approval)
4. **Citrus Grove Estate** - Brinchang, Pahang (Active)

### Fruit Crops & Trees
- **Musang King Durian** - 20 productive trees (RM 1,500 - RM 2,500 each)
- **Black Thorn Durian** - 15 growing trees (RM 1,200 - RM 2,000 each)
- **Alphonso Mango** - 25 productive trees (RM 800 - RM 1,500 each)
- **Nam Doc Mai Mango** - 20 productive trees (RM 700 - RM 1,300 each)
- **Shine Muscat Grapes** - 30 productive trees (RM 500 - RM 1,000 each)
- **Valencia Orange** - 20 productive trees (RM 600 - RM 1,100 each)

**Total Trees:** 130 investable fruit trees across 6 different varieties

### Sample Investments
- The investor user (investor@treevest.com) has 5 active investments
- John Investor (john.investor@example.com) has 3 active investments

### Content
- Educational articles about fruit investment
- Encyclopedia entries for different fruit types
- Categories and tags for content organization
- Legal documents (Terms of Service, Privacy Policy, etc.)
- Notification templates for system communications

---

## KYC Status
All test users have been pre-verified with:
- **KYC Status:** Verified
- **KYC Verified Date:** Current date
- **KYC Expiry:** 2 years from now

This allows you to test the full investment flow without going through the KYC verification process.

---

## Getting Started

1. **Start the development server:**
   ```bash
   composer dev
   ```
   This runs the Laravel server, Vite, queue worker, and log viewer concurrently.

2. **Access the application:**
   - Open your browser and navigate to `http://localhost:8000`

3. **Log in with any of the credentials above**

4. **Test the features:**
   - **As Admin:** Manage farms, approve pending farms, manage articles, view all users
   - **As Farm Owner:** Create new farms, list crops, upload farm images and certifications
   - **As Investor:** Browse the marketplace, view tree details, make investments, track portfolio

---

## Database Information

- **Database Name:** treevest
- **Host:** 127.0.0.1
- **Port:** 3306
- **Connection:** MySQL via Laragon

All migrations have been run and seeders have populated the database with realistic sample data.
