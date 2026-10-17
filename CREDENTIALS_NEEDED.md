# Required Credentials & API Keys Setup Guide
**Project:** Cloud-Based Student Management System (CSMS / CCMP)  
**Target:** Fill in the values below so we can wire up the real live databases, authentication, payments, storage, and notification systems.

---

## 🎯 The Recommended Unified Stack
To make setup as fast and easy as possible, we have selected the most cohesive and developer-friendly stack:
1. **Supabase** — Handles **3 services in 1 place**:
   - Primary PostgreSQL Database
   - Role-Based Authentication & Session Management
   - Document & PDF Storage (Fee receipts, report cards, profile images)
2. **Razorpay or Stripe** — For Fee Payments (Tuition, exams, fines).
3. **Resend** — For transactional emails (Receipts, low attendance alerts, credentials).
4. **Upstash Redis (Optional but Recommended)** — For API rate-limiting & session security.

---

## 📋 Credentials Checklist (By Service)

### 1. Supabase (Database + Auth + File Storage - ✅ CONFIGURED & VERIFIED)
> Status: **Connected & Migrated**  
> Direct PostgreSQL 17.11: Verified & all 17 tables created  
> Auth & Service Role API: Verified active

| Field Name | Where to find in Supabase Dashboard | Description |
|---|---|---|
| `DATABASE_URL` | **Settings** ➔ **Database** ➔ Connection string (NodeJS / URI tab) | Direct PostgreSQL connection string (looks like `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`) |
| `SUPABASE_URL` | **Settings** ➔ **API** ➔ Project URL | The base API URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | **Settings** ➔ **API** ➔ Project API keys (`anon` / `public`) | Public key for frontend auth & storage queries |
| `SUPABASE_SERVICE_ROLE_KEY` | **Settings** ➔ **API** ➔ Project API keys (`service_role` / `secret`) | Super-admin backend secret key for creating users and bypassing RLS |

*(Alternative: If you prefer **Neon PostgreSQL** instead of Supabase for the database, just provide your Neon `DATABASE_URL` from [https://neon.tech](https://neon.tech)).*

---

### 2. Payment Gateway (Razorpay - ✅ CONFIGURED & VERIFIED)
> Status: **Active in Test Mode**  
> Test Order API: Verified (`order_Tp3GnGu2dqMy1X`)

| Field Name | Status |
|---|---|
| `RAZORPAY_KEY_ID` | ✅ Configured (`rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | ✅ Configured |

#### Option B: Stripe (Recommended for USD / International Cards)
> 🔗 **Sign up / Log in:** [https://dashboard.stripe.com](https://dashboard.stripe.com)  
> Enable **"Test mode"** toggle at top right.

Go to **Developers** ➔ **API keys**:

| Field Name | Description |
|---|---|
| `STRIPE_PUBLISHABLE_KEY` | Starts with `pk_test_...` |
| `STRIPE_SECRET_KEY` | Starts with `sk_test_...` |

---

### 3. Transactional Email (Resend - ✅ CONFIGURED & VERIFIED)
> Status: **Active & Operational**  
> Sender Sandbox: `Campus Management <onboarding@resend.dev>`  
> Email templates integrated: Fee receipts, Attendance alerts, Onboarding credentials

| Field Name | Status |
|---|---|
| `RESEND_API_KEY` | ✅ Configured (`re_ZQjCTjtx_...`) |
| `EMAIL_FROM` | `Campus Management <onboarding@resend.dev>` |

---

### 4. Cache & Rate Limiting (✅ BUILT-IN & 100% FREE - NO REDIS NEEDED)
> Status: **Configured with native `express-rate-limit`**  
> We have implemented high-performance in-memory rate limiting inside the Express server.
> - **General API Protection:** 300 requests / 15 minutes per IP
> - **Brute-Force Auth Protection:** 30 login attempts / 15 minutes per IP
> - **Cost:** **$0.00 / Free forever** (Zero external Redis signups or credit cards required!)

---

## 📝 Fill-in-the-Blank Submission Form

You can copy this block, fill in the values, and share it with me (or paste it into your `.env` file):

```env
# ========================================================
# 1. DATABASE & AUTHENTICATION (Supabase)
# ========================================================
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Local JWT Secret (Used for internal signing backup)
JWT_SECRET=campus_portal_super_secure_jwt_secret_key_2026

# ========================================================
# 2. PAYMENT GATEWAY (Razorpay or Stripe)
# ========================================================
# If Razorpay:
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# OR If Stripe:
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# ========================================================
# 3. TRANSACTIONAL EMAIL (Resend)
# ========================================================
RESEND_API_KEY=
EMAIL_FROM=Campus Management <onboarding@resend.dev>

# ========================================================
# 4. CACHE & SECURITY (Upstash Redis - Optional)
# ========================================================
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## ⚡ What is the Minimum to Start Right Now?
If you want to start step-by-step without getting everything at once, we only need:
1. **`DATABASE_URL`** (from Supabase or Neon)
2. **`SUPABASE_URL`** & **`SUPABASE_ANON_KEY`**

With just those two, we can immediately:
- Migrate all database tables from our [schema.sql](file:///c:/Users/Devendra/projects/CCMP/server/db/schema.sql) to live Postgres.
- Turn on live authentication with dedicated dashboards for **Admin**, **Teacher**, and **Student**.
- Wire up real CRUD operations for departments, subjects, students, marks, and attendance.
