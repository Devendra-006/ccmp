# Production Services, Databases & Infrastructure Blueprint
**Project:** Cloud-Based Student Management System (CSMS / CCMP)  
**Document Purpose:** Comprehensive breakdown of all required databases, cloud services, authentication infrastructure, and third-party APIs needed for a production-grade, multi-role deployment.

---

## 1. Role-Based Authentication & Identity Provider (RBAC)

### What it is & Purpose in the Project
The application requires a secure authentication system supporting distinct dashboard experiences and permission scopes for 5 primary user roles:
- **Super / Academic Admin:** Full system control, department & course creation, teacher/student onboarding, fee structure setups, system audits.
- **Teacher:** Attendance marking, gradebook entry, assignments upload, student progress tracking for assigned classes.
- **Student:** View personalized timetable, enrolled subjects, real-time attendance %, view exam marks & report cards, online fee payment.
- **Parent:** Monitor ward's academic performance, check attendance shortfall alerts, pay pending student fees directly.
- **Accountant:** Fee invoice generation, discount waivers, fee collection records, reconciliation and receipt downloads.

The service handles password hashing, secure token generation (JWT / refresh tokens), session lifecycle, email verification, password reset, and granular role enforcement across frontend routes and backend APIs.

### What is Needed From You (Keys & Credentials)
To set this up, you will provide:
- `JWT_SECRET` (A strong random string, e.g., 64-byte hex key)
- `JWT_EXPIRES_IN` (e.g., `24h` or `7d`)
- `REFRESH_TOKEN_SECRET` (For long-lived mobile/web session persistence)
*(If using a managed auth provider like Supabase Auth or Clerk, the keys listed under recommendations will replace these).*

### Dashboard & Security Flow
```
User Enters Credentials -> Auth Service Validates -> Issues Signed JWT with { role, userId, permissions }
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
Admin Dashboard            Teacher Dashboard          Student Dashboard
(Full CRUD & Config)       (Class & Grading Access)   (Personal Academics & Fees)
```

### Recommendation & Best Implementation Way
> **Recommendation:** **Dual-Option Hybrid (Supabase Auth OR Native PostgreSQL + JWT/Bcrypt)**
> - **Top Choice (Easiest & Most Integrated): `Supabase Auth`**
>   - **Why:** Supabase combines PostgreSQL database and built-in Authentication seamlessly with Row Level Security (RLS). You don't have to manage separate user tables or token sync bugs. It has pre-built password resets, magic links, and role claims.
>   - **What you'd need to provide:**
>     - `SUPABASE_URL` (From your Supabase project dashboard)
>     - `SUPABASE_ANON_KEY` (Public client key for frontend)
>     - `SUPABASE_SERVICE_ROLE_KEY` (Secret server key for backend admin operations)
> - **Alternative (Zero-Lockin Self-Hosted): `Express + PostgreSQL + bcrypt + jsonwebtoken`**
>   - **Why:** If you want total backend independence where everything lives in our Express `/server` folder without relying on third-party auth platforms. We already have the user table schema in `server/db/schema.sql` ready to connect.

---

## 2. Primary Relational Database (Core Academic & Institutional Engine)

### What it is & Purpose in the Project
The core persistence engine storing all enterprise relational models specified in the PRD:
1. **Users & Identities:** Credentials, roles, status, audit timestamps.
2. **Academic Structure:** Departments, Programmes (Degrees), Subjects (Credits, Semesters, Syllabus).
3. **Faculty & Staff:** Teacher profiles, employee codes, department associations, subject allocations.
4. **Students:** Enrolment numbers, roll numbers, personal profiles, batch, semester, section.
5. **Academics & Enrolments:** Classes, student-subject enrolments, timetable slots.
6. **Attendance Ledger:** Daily session tracking (Present, Absent, Late, Excused) with automated percentage computation.
7. **Exams & Grading:** Exam schedules, subject marks entry, grading scales, term-end report cards.
8. **Fee Management:** Fee structures (Tuition, Lab, Exam fees), student fee dues, payment logs, transaction hashes.
9. **Notices & Communication:** Broadcast notices tagged by target roles/departments.
10. **Audit Logs:** Immutable tracking of critical admin and financial actions.

### What is Needed From You (Keys & Credentials)
To connect the live database:
- `DATABASE_URL` (Standard PostgreSQL connection string, e.g., `postgres://username:password@host:5432/dbname?sslmode=require`)
- `DB_HOST` (e.g., `ep-cold-lake-12345.ap-southeast-1.neon.tech`)
- `DB_PORT` (Default: `5432`)
- `DB_NAME` (e.g., `csms_database`)
- `DB_USER` (e.g., `csms_admin`)
- `DB_PASSWORD` (Your secure database password)
- `DB_SSL` (`true` for cloud-hosted databases)

### Recommendation & Best Implementation Way
> **Recommendation:** **`Neon Serverless PostgreSQL` or `Supabase PostgreSQL`**
> - **Why Neon:**
>   - 100% standard PostgreSQL (runs our exact `server/db/schema.sql` instantly with zero modification).
>   - Free tier includes generous storage and compute.
>   - Serverless branching: creates instant staging branches for safe database testing without breaking production.
>   - Connection pooling built-in via PgBouncer (handles high concurrent student logins during exam results release).
> - **Why Supabase:**
>   - If you choose Supabase Auth (Point 1), your database is already included in the exact same platform.
>   - Includes a visual table editor, SQL query editor, and automated REST APIs.

---

## 3. Cloud Object / File Storage (Documents, Media & Assets)

### What it is & Purpose in the Project
The application handles various physical documents and media files that must not be stored in a relational database:
- **Student & Teacher Profile Pictures:** Displayed in headers, identity badges, and report cards.
- **Assignment Files & Submissions:** Teachers upload assignment problem PDFs; students upload completed assignments.
- **Official Report Cards:** Auto-generated student performance report card PDFs with university seal/stamp.
- **Fee Payment Receipts:** Downloadable official tax/fee receipts with transaction IDs and QR codes.
- **Department & Course Syllabus:** Downloadable curriculum files for students.

### What is Needed From You (Keys & Credentials)
Depending on provider:
- `STORAGE_BUCKET_NAME` (e.g., `csms-documents`)
- `STORAGE_REGION` (e.g., `ap-south-1` / `us-east-1`)
- `STORAGE_ACCESS_KEY` / `AWS_ACCESS_KEY_ID`
- `STORAGE_SECRET_KEY` / `AWS_SECRET_ACCESS_KEY`
- `STORAGE_PUBLIC_URL_PREFIX` (For serving media publicly or via signed URLs)

### Recommendation & Best Implementation Way
> **Recommendation:** **`Cloudinary` (for profile images/documents) OR `Supabase Storage` / `AWS S3` (for PDFs & receipts)**
> - **Best All-Rounder:** **`Supabase Storage`**
>   - **Why:** Integrated directly with user authentication so a student can only access their own report card/fee receipt via pre-signed private URLs. Zero AWS IAM configuration headaches.
> - **Best Free Alternative for Quick Setup:** **`Cloudinary`**
>   - **Why:** Free tier provides 25GB managed storage, instant image cropping, PDF transformations, and automatic CDN delivery. Requires just `CLOUDINARY_URL`.

---

## 4. In-Memory Cache & Session Store (Speed, Security & Real-Time)

### What it is & Purpose in the Project
A high-speed key-value cache layer used for:
- **Rate Limiting:** Protect `/api/v1/auth/login` and fee payment endpoints against brute-force attacks and DDoS.
- **Token Invalidation / Blacklist:** Immediate revocation of JWT tokens upon user logout or role change.
- **Dashboard Metric Caching:** Caching heavy aggregation queries (e.g., total fee collected, college-wide attendance averages) so the admin dashboard loads in < 50ms.
- **Live Notifications & Pub/Sub:** Real-time broadcast when emergency notices are published.

### What is Needed From You (Keys & Credentials)
- `UPSTASH_REDIS_REST_URL` (Redis endpoint URL)
- `UPSTASH_REDIS_REST_TOKEN` (Access authorization token)
*(Or standard Redis URL: `REDIS_URL=redis://default:password@host:port`)*

### Recommendation & Best Implementation Way
> **Recommendation:** **`Upstash Redis` (Serverless)**
> - **Why:**
>   - True serverless Redis with generous free tier (10,000 requests/day free).
>   - Works over HTTP REST API — no persistent connection pool to manage in serverless/Node.js environments.
>   - Easiest implementation with `@upstash/redis` or `@upstash/ratelimit`.

---

## 5. Payment Gateway (Tuition, Exam & Fine Collections)

### What it is & Purpose in the Project
Enables students and parents to securely pay fee installments online:
- Handles checkout modal / payment sheet on the frontend.
- Secure server-side signature verification (prevents fraud or tampering).
- Webhook listener to update the database status from `pending` to `paid` automatically.
- Generates official transaction reference IDs for fee receipts.

### What is Needed From You (Keys & Credentials)
- `PAYMENT_GATEWAY_KEY_ID` / `PUBLIC_KEY` (Frontend checkout modal)
- `PAYMENT_GATEWAY_KEY_SECRET` (Backend signature verification)
- `PAYMENT_GATEWAY_WEBHOOK_SECRET` (Verifying automated payment success webhooks)
- `CURRENCY` (e.g., `INR` or `USD`)

### Recommendation & Best Implementation Way
> **Recommendation:** **`Razorpay` (For India / INR) OR `Stripe` (For International / USD)**
> - **Why Razorpay (India):** Native support for UPI (Google Pay, PhonePe, Paytm), Netbanking across all Indian banks, Credit/Debit cards, and student EMI. The test sandbox mode allows testing all flows without needing real bank verification initially.
> - **Why Stripe (Global):** Easiest developer SDK, instant test mode keys, Apple Pay / Google Pay support, and top-tier documentation.

---

## 6. Transactional Email & Notifications Gateway

### What it is & Purpose in the Project
Automated system communication sent on key triggers:
- **Welcome / Account Creation:** Sends auto-generated login credentials to newly enrolled students and teachers.
- **Fee Receipt Email:** Attaches PDF receipts immediately upon successful fee payment.
- **Attendance Shortfall Warning:** Alerts parents if a student's attendance drops below 75%.
- **Exam Schedule & Notice Broadcast:** Sends urgent campus circulars directly to student inboxes.
- **Password Reset:** Secure one-time reset link delivery.

### What is Needed From You (Keys & Credentials)
- `EMAIL_SERVICE_API_KEY` (e.g., Resend API key: `re_123456789...`)
- `EMAIL_FROM_ADDRESS` (e.g., `notifications@yourcampus.edu` or `onboarding@resend.dev` for test mode)

### Recommendation & Best Implementation Way
> **Recommendation:** **`Resend` (by the creators of React Email)**
> - **Why:**
>   - The modern gold standard for developer-first email delivery.
>   - 3,000 emails/month free.
>   - Allows building gorgeous HTML emails using standard React components.
>   - 5-minute setup with 1 API key.

---

## Summary Matrix of Needed Services

| # | Service Domain | Recommended Provider | Backup / Alternative | What You Need To Provide |
|---|---|---|---|---|
| **1** | **Authentication & RBAC** | **Supabase Auth** or **Native JWT** | Clerk / Firebase Auth | Supabase URL & Anon Key (or JWT Secret) |
| **2** | **Relational Database** | **Neon PostgreSQL** or **Supabase Postgres** | AWS RDS PostgreSQL | Database Connection String (`DATABASE_URL`) |
| **3** | **Document & Asset Storage** | **Supabase Storage** | AWS S3 / Cloudinary | Bucket Name, Project URL & Key |
| **4** | **Cache & Rate Limiting** | **Upstash Redis** | Redis Cloud | Upstash REST URL & Token |
| **5** | **Payment Gateway** | **Razorpay** (INR) / **Stripe** (USD) | PayPal | Test Key ID & Secret Key |
| **6** | **Transactional Emails** | **Resend** | SendGrid / AWS SES | Resend API Key & From Email |

---

## Suggested `.env` Blueprint (All Keys In One Place)

Copy this template into your root `.env` or `server/.env` once you obtain the credentials:

```bash
# ========================================================
# CSMS / CCMP CLOUD ENVIRONMENT CONFIGURATION
# ========================================================

# SERVER RUNTIME
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# 1. DATABASE (PostgreSQL - Neon / Supabase / AWS RDS)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# 2. AUTHENTICATION & SECURITY
JWT_SECRET=super_secret_jwt_signing_key_at_least_32_characters_long
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=refresh_secret_jwt_key_different_from_access_token

# (Optional: If using Supabase for unified DB + Auth + Storage)
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# 3. FILE / CLOUD STORAGE (Supabase Storage / Cloudinary / AWS S3)
STORAGE_BUCKET_NAME=csms-student-documents
# If Cloudinary:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# 4. REDIS CACHE & RATE LIMITING (Upstash)
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_secret_token

# 5. PAYMENT GATEWAY (Razorpay or Stripe - Test mode initially)
# Razorpay:
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
# OR Stripe:
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx

# 6. TRANSACTIONAL EMAIL (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Campus Admin <onboarding@resend.dev>
```

---

## Suggested Next Steps & Implementation Order

1. **Step 1: Pick Database & Auth Strategy**
   - **Recommended Path:** Create a free project on **[Supabase](https://supabase.com)** or **[Neon](https://neon.tech)**.
   - Run our prepared schema: `server/db/schema.sql`.
2. **Step 2: Connect Express Backend to Database**
   - Replace the mock memory array in `server/db/store.js` with PostgreSQL connection queries (using `pg` / `postgres.js`).
3. **Step 3: Role-Based Route Guards on Frontend**
   - Implement protected routes in React so users cannot access Dashboards outside their assigned roles.
4. **Step 4: Attach Payment & Email Webhooks**
   - Add test sandbox keys for Razorpay/Stripe and verify fee receipt delivery via Resend.
