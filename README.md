# Havells Zella 1000W Immersion Rod E-Commerce Platform

A production-oriented, single-product e-commerce application with a customer-facing storefront, complete administrative dashboard, dynamic pricing engine, review moderation system, and YouPI-PG UPI payment integration.

---

## 🌟 1. Project Overview

- **Featured Product:** Havells Zella Immersion Rod 1000W (Electric Blue)
- **Verified Manufacturer Specs:**
  - **Wattage:** 1000 Watts (1 kW/hr consumption)
  - **Rated Voltage:** 230 V AC, 50 Hz, 1-Phase
  - **Heating Element:** Heavy-duty copper tube with Nickel plating for scale & corrosion resistance
  - **Temperature Dial:** Rotary control knob (Low, Medium, High)
  - **Safety Mechanism:** Automatic Thermal Cut-Off
  - **Dual Utility Flap:** Smart collapsible cover serving as a bucket hanger
  - **Heating Indicator:** Neon visual power/heating lamp
  - **Plug:** Heavy-duty 3-pin molded plug (ISI / BIS Certified)
  - **Manufacturer Warranty:** 2 Years Brand Warranty
- **Store Architecture:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma ORM
- **Database Support:** SQLite (zero-config local dev) or PostgreSQL / Supabase (single-string switch)
- **Payment Processing:** YouPI-PG direct UPI settlement integration + Cash on Delivery (COD)

---

## 🏗️ 2. Architecture & Modules

The codebase is organized into clean, maintainable modules:

```text
├── prisma/
│   ├── schema.prisma         # Relational database schema with 23 models & indexes
│   └── dev.db                # SQLite database (auto-generated)
├── scripts/
│   ├── seed.mjs              # Initial database seed (Admin, Product, Settings, FAQs, Demo Reviews)
│   └── test-flows.mjs        # Automated test suite (Auth, Orders, Webhook HMAC, Settlement Guard)
├── src/
│   ├── app/
│   │   ├── admin/            # Protected Admin Dashboard
│   │   │   ├── audit-logs/   # Tamper-evident admin activity log
│   │   │   ├── content/      # Website CMS (announcement bar, hero, FAQs, policies)
│   │   │   ├── coupons/      # Promo codes (percentage & fixed, limits, expiry)
│   │   │   ├── customers/    # Customer directory & order history
│   │   │   ├── inventory/    # Stock adjuster & fulfillment decrement logs
│   │   │   ├── login/        # Secure admin login
│   │   │   ├── orders/       # Order management, status updater & CSV export
│   │   │   ├── pricing/      # Dynamic pricing & auto-calculated discounts
│   │   │   ├── product/      # Product metadata, gallery & verified specs editor
│   │   │   ├── reviews/      # Review moderation panel (Pending/Approved/Rejected)
│   │   │   └── settings/payments/ # Gateway diagnostics & manual bank ledger queue
│   │   ├── api/              # Secure backend REST APIs
│   │   │   ├── admin/        # Admin-only endpoints (protected by JWT cookie)
│   │   │   ├── auth/         # Login, logout, session verification
│   │   │   ├── coupons/      # Real-time coupon validation
│   │   │   ├── orders/       # Order creation, order tracking & tax invoices
│   │   │   ├── payments/     # Payment initiation, customer UTR submission & webhooks
│   │   │   ├── pricing/      # Dynamic pricing API
│   │   │   ├── product/      # Product details & public review metrics
│   │   │   └── reviews/      # Customer review submission (PENDING by default)
│   │   ├── checkout/         # Multi-step checkout, verification & success pages
│   │   ├── policies/         # Legal & policy documents (Privacy, Terms, Shipping, Refund)
│   │   ├── track/            # Token-authenticated order delivery tracker
│   │   ├── layout.tsx        # Global HTML shell & SEO metadata
│   │   └── page.tsx          # Premium storefront landing page
│   ├── components/
│   │   └── storefront/       # Hero, Benefits, Details, Reviews, FAQs, Footer
│   └── lib/
│       ├── auth.ts           # JWT session token management & bcrypt password hashing
│       ├── pricing.ts        # Server-side pricing validator & coupon engine
│       ├── prisma.ts         # Singleton database client
│       ├── utils.ts          # Currency, phone, pincode, and sanitization utilities
│       └── youpi.ts          # YouPI-PG client, HMAC-SHA256 signature verification & diagnostics
```

---

## 💳 3. YouPI-PG Payment Gateway Integration

This application implements the official integration specification of [YouPI-PG](https://github.com/youpi-pg/YouPI-PG):

### A. Payment Session Creation
- **Endpoint:** `POST /api/v1/payments`
- **Headers:** `Content-Type: application/json`, `X-Merchant-Id`, `Idempotency-Key`
- **Request Body:**
  ```json
  {
    "orderId": "ORD-2026-1001",
    "amount": "1499.00",
    "currency": "INR",
    "returnUrl": "http://localhost:3000/checkout/verification?orderId=ORD-2026-1001&token=..."
  }
  ```
- **Lifecycle Statuses:**
  - `ACTIVE`: Session active awaiting customer transfer.
  - `OBSERVED_SUCCESS`: Bank notification observer detected incoming alert.
  - `RECONCILED`: Bank statement matched.
  - `MANUAL_REVIEW`: Flagged for review.
  - `FAILED`: Payment expired or rejected.

### B. Webhook Verification & Settlement Guard
1. **HMAC-SHA256 Signature Verification:** Verified against the raw request bytes using `YOUPI_WEBHOOK_SECRET` via `crypto.timingSafeEqual` to prevent timing attacks.
2. **Settlement Safety Constraint:** 
   > **Important Security Rule:** An observed bank alert (`OBSERVED_SUCCESS`) moves an order to `PAYMENT_VERIFICATION`—**never** directly to `PAID`.
3. **Manual Bank Ledger Reconciliation:** An authorized administrator inspects the merchant's netbanking records and confirms the 12-digit UTR in `/admin/settings/payments`. Only upon admin verification is the order marked `PAID` and moved to fulfillment.

---

## 🚀 4. Local Quick Start Guide

### Prerequisites
- Node.js `v18+` or `v20+` (verified on Node `v24.18.0`)
- npm `v9+` or `v10+`

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local variables:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="zella-ecom-secure-jwt-secret-key-production-ready-2026-auth-token-998"
ADMIN_SESSION_COOKIE="zella_admin_session_token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
YOUPI_API_URL="http://localhost:6100"
YOUPI_MERCHANT_ID="youpi_merchant_demo_01"
YOUPI_MERCHANT_API_KEY="yk_test_live_never_commit_actual_secrets"
YOUPI_WEBHOOK_SECRET="whsec_test_secret_for_hmac_sha256_validation"
INITIAL_ADMIN_EMAIL="admin@aquathermal.store"
INITIAL_ADMIN_PASSWORD="AdminSecurePassword2026!"
```

### Step 3: Run Database Migrations & Seed Data
```bash
npx prisma db push
node scripts/seed.mjs
```

### Step 4: Run the Automated Test Suite
```bash
node scripts/test-flows.mjs
```
*(All 23 assertions test auth, stock decrements, coupons, pricing rules, HMAC signatures, and settlement guard).*

### Step 5: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 5. Administrator Access

- **Admin Login URL:** `http://localhost:3000/admin/login`
- **Default Email:** `admin@aquathermal.store`
- **Default Password:** `AdminSecurePassword2026!`

*Note: Change the password immediately upon deploying to a production server.*

---

## 🧪 6. Testing Major User Flows

1. **Storefront & Product Details:**
   - Navigate to `/`.
   - Inspect pricing (₹1,499 vs ₹2,190 MRP, auto-computed 32% discount).
   - Test thumbnail photo switching.
   - Review verified manufacturer specs table and safety precautions.

2. **Customer Checkout:**
   - Click **Buy Now** or go to `/checkout`.
   - Enter Indian address with 6-digit PIN and 10-digit phone.
   - Enter promo code `WARMTH100` and click Apply (applies flat ₹100 discount).
   - Select payment method: **Instant UPI via YouPI-PG** or **Cash on Delivery**.
   - Click **Proceed to UPI Payment**.

3. **UPI Payment & Reference Submission:**
   - On `/checkout/verification`, view dynamic QR code and merchant UPI ID.
   - Enter any 12-digit sample reference (e.g. `432109876543`) and click Submit.
   - Status updates to `PAYMENT_VERIFICATION`.

4. **Admin Manual Payment Reconciliation:**
   - Log into `/admin` and navigate to `/admin/settings/payments`.
   - In the **Pending Bank Reconciliation Queue**, locate the transaction.
   - Click **✓ Verified in Bank**.
   - The order immediately transitions to `PAID` and `CONFIRMED`.

5. **Customer Review Submission & Moderation:**
   - On the homepage `/`, scroll to Customer Reviews and click **Write a Review**.
   - Submit a review (e.g., 5 stars, title, feedback).
   - The review is saved with status `PENDING` and does NOT appear on the public page.
   - Log into `/admin/reviews` and click **Approve & Publish**.
   - Refresh `/` to verify the new review is now live and the aggregate rating has updated.

6. **Order Tracking & Invoice Download:**
   - Visit `/track` and enter the Order Number and access token.
   - Click **Invoice** to generate and print the tax invoice.

---

## 🔒 7. Security & Compliance Checklist

- [x] **No Hardcoded Client Secrets:** All keys kept server-side; masked in admin UI.
- [x] **Webhook Replay Protection & Idempotency:** Deduplicates duplicate webhook hits using unique UTR and event hashes.
- [x] **Client Price Tampering Prevention:** Prices and coupon discounts are calculated server-side from database records.
- [x] **Strict Demo Review Isolation:** Development seed reviews are tagged `isDemoData: true` and excluded from public storefront APIs.
- [x] **Tamper-Evident Audit Trail:** Every admin action (pricing changes, status changes, reviews, inventory edits) is recorded in the `AuditLog` table.
- [x] **Brand Compliance:** Clearly disclaims independent reseller status without falsely implying Havells operation.
