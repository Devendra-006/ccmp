# CCMP — Improvement Plan

**Project:** Cloud-Based Student Management System (`Devendra-006/ccmp`)
**Reviewed:** commit `039f295` (latest `main`) + 5 UI screenshots (Admin, Teacher, Student, Parent, Accountant)
**Method:** read the backend (`server/`), frontend (`src/`), schema, Docker/CI files and docs; every finding below points to a file so you can verify it.

**Priority key:** 🔴 P0 = fix before anyone else uses it · 🟠 P1 = fix next · 🟡 P2 = polish / nice to have
**Effort key:** S = under half a day · M = 1–2 days · L = 3+ days

---

## 0. Executive Summary

The project has a solid skeleton: a real PostgreSQL schema, JWT + bcrypt auth, Razorpay and Resend integrations, Docker, CI, a cron job, and a separate portal component for each of the five roles. The gaps are in three places:

1. **Security (🔴):** anyone can register as `super_admin`, any logged-in user can mark any fee as paid without paying, and student/teacher personal data is readable without logging in.
2. **The UI is only partly connected to the backend (🔴):** payments, marks, and several student tabs never reach the database; failed saves are silently faked as successes; and the "logged-in user" is not actually who the screens show.
3. **Dashboards (🟠):** each role has its own portal, but Admin has no real dashboard, the Parent and Accountant sidebars don't navigate anywhere, and the same student appears with different data on different tabs.

**Dashboard question, short answer:** yes, give every role its own dashboard, but keep **one app, one design system and one login**, split by role-based routes. Do **not** build five separate apps. Details in section 3.

---

## 1. Security & Authentication

| # | Priority | Effort | Finding | Where | Fix |
|---|---|---|---|---|---|
| 1.1 | 🔴 | S | **Open registration allows any role.** `POST /auth/register` has no auth and accepts `role: "super_admin"`, so anyone can create an admin account and get a token. | `server/routes/auth.js:76-131` | Make register public for nothing, or restrict to `student` only. Only an admin can create other roles (admin-only `POST /users`). |
| 1.2 | 🔴 | S | **Any logged-in user can mark any fee PAID for free.** `POST /fees/pay-sandbox` only needs `authenticate`, has no ownership check and no "sandbox only" guard. | `server/routes/fees.js:263-318` | Remove it in production (`if (NODE_ENV==='production') 404`) or gate behind `ENABLE_SANDBOX_PAYMENTS=true`. Check the due belongs to the caller (or their ward). |
| 1.3 | 🔴 | M | **Razorpay verify is incomplete.** It checks the HMAC but never checks that the `order_id` was created for *this* `dueId`, never checks the due isn't already PAID, never compares the paid amount, and hard-codes payment mode `'upi'`. A cheap order can be used to settle an expensive due. | `server/routes/fees.js:194-260` | Store `razorpay_order_id` on `fee_dues` when the order is created; on verify, require it to match, require `status='PENDING'`, fetch the payment from Razorpay and compare amount + status, and wrap the update + insert in one DB transaction. Add a Razorpay webhook as the source of truth. |
| 1.4 | 🔴 | M | **Personal data is readable without logging in.** `GET /students` (name, email, phone, address, blood group), `/teachers` (email, phone), `/attendance`, `/exams`, `/fees/dues?studentId=` and `/results/:id` use `optionalAuth` or no auth at all. | `students.js:10`, `academic.js:220`, `attendance.js:8`, `fees.js:65` | Use `authenticate` everywhere except health/login. Return only the rows the caller may see (see 1.5). |
| 1.5 | 🔴 | M | **No row-level authorization (IDOR).** Any authenticated user can read `GET /students/:id` or `GET /fees/receipt/:receiptNo` for anyone. Parents and teachers have no scoping rules. | `students.js:137`, `fees.js:321` | Central `canAccessStudent(user, studentId)` helper: student → self; parent → linked wards; teacher → students in their classes; admin/accountant → all. Apply to every `:studentId` route. |
| 1.6 | 🔴 | S | **Hard-coded JWT fallback secret** in source. If `JWT_SECRET` is missing in production, anyone can forge tokens. | `server/middleware/auth.js:4` | Fail startup if `JWT_SECRET` is unset or shorter than 32 chars. Never ship a default. |
| 1.7 | 🔴 | S | **Predictable default credentials.** Seed admin is `admin@campus.edu / Admin@123`; new students get `Student@123`, teachers `Teacher@123`; the login modal has a "fill admin credentials" shortcut; the temp password is emailed in plain text. | `initDb.js:27`, `students.js:75`, `academic.js:260`, `LoginModal.jsx` (`fillAdminCredentials`), `mailer.js` | Generate a random one-time password per user, set `must_change_password=true`, send a set-password link instead. Read the first admin password from an env var. Remove the autofill button outside demo mode. |
| 1.8 | 🟠 | M | **Token handling:** 7-day JWT in `localStorage`, no refresh, no revocation, logout is client-side only. | `auth.js:76`, `LoginModal.jsx`, `App.jsx:153` | Short access token (15 min) + refresh token in an `httpOnly`, `Secure`, `SameSite` cookie; a `token_version` column to revoke on password change/logout. |
| 1.9 | 🟠 | M | **No password lifecycle:** no reset, no change, no email verification, no password rules, no account lockout beyond IP rate limiting. | `routes/auth.js` | Add forgot/reset (Resend is already integrated), change-password, minimum strength check, per-account lockout. |
| 1.10 | 🟠 | S | **Rate limiter is behind a proxy without `trust proxy`.** Behind nginx/Render all users share the proxy's IP, so 30 login attempts per 15 min is *global*, and audit-log IPs are wrong. | `server/index.js:34-51`, `Dockerfile.frontend` nginx config | `app.set('trust proxy', 1)` and pass `X-Forwarded-For` / `X-Real-IP` in nginx. |
| 1.11 | 🟠 | S | **Database TLS is disabled in effect:** `ssl: { rejectUnauthorized: false }` is always on. It also breaks the local Docker Postgres, which has no SSL. | `server/db/postgres.js:10-12` | `ssl` only when `DATABASE_SSL=true`; in production supply the CA and keep `rejectUnauthorized: true`. |
| 1.12 | 🟠 | S | **Errors leak internals:** most routes return `err.message` (SQL errors, constraint names) to the client; the global handler does too. | all routes, `index.js:91-94` | Log the detail server-side, return a generic message + request id. |
| 1.13 | 🟠 | M | **No input validation.** Bodies are read raw (`parseInt`, no type/length/range checks); marks are not checked against `max_marks`; attendance `status` and `period` aren't validated before the DB. | all `routes/*.js` | Add `zod` (or `joi`) schemas per route; reject `NaN`, negative marks, marks > max, invalid dates. |
| 1.14 | 🟠 | S | **Email HTML injection:** `studentName`, `feeHead` are interpolated into HTML emails unescaped. | `server/services/mailer.js` | Escape all interpolated values. |
| 1.15 | 🟠 | S | **Secrets/personal data in the repo:** a personal email is the default sandbox recipient in code; `CREDENTIALS_NEEDED.md` shows a partial Resend key prefix and a Razorpay order id; `docker-compose.yml` hard-codes DB password and JWT secret. | `mailer.js:7`, `CREDENTIALS_NEEDED.md`, `docker-compose.yml:12,41` | Move all to `.env`; rotate the Resend key shown (even a prefix is worth rotating); delete or sanitize `CREDENTIALS_NEEDED.md`. |
| 1.16 | 🟡 | S | **Weak hardening headers/CORS:** `crossOriginResourcePolicy: false`; no CSP; `origin: true` in non-production. | `index.js:22-29` | Enable a CSP, restrict CORS origins in every environment. |
| 1.17 | 🟡 | M | **Audit log is mostly empty.** `logAuditEvent` is called only for department creation and the cron job, yet the README and UI describe a full "immutable audit trail" ("100% Audited"). Nothing in the DB prevents updates or deletes of the log. | `academic.js:46`, `cronAttendanceAlert.js:60`, `schema.sql` (audit_logs) | Log every write: payments, marks, publish, enrolment, role/user changes, fee waivers. Revoke `UPDATE/DELETE` on `audit_logs` for the app DB user. |

---

## 2. Backend, API & Database

### 2.1 Missing / incomplete API features

| # | Priority | Effort | Finding | Fix |
|---|---|---|---|---|
| 2.1.1 | 🔴 | M | **No parent ↔ student link.** There is no guardians table; parents have no profile, so the Parent portal cannot know *which* ward to show. | Add `guardians` and `student_guardians(student_id, guardian_id, relation)`; return linked wards from `/auth/me`; scope all parent queries to them. |
| 2.1.2 | 🔴 | M | **Timetable and enrolments tables exist but have no routes.** The student timetable is therefore fake data. Teachers can't be assigned to subjects/classes either, so a teacher sees *every* student. | Add routes for `timetable_slots`, `enrolments`, and a `teacher_subjects` (or class-teacher) mapping. Teacher rosters come from this mapping. |
| 2.1.3 | 🟠 | M | **No update/delete API for anything** (departments, subjects, students, fee heads, notices). The Admin UI has edit/delete icons, and the "Delete Record" confirmation only shows a "Removed …" toast and closes (`AdminPortal.jsx` ~line 823); nothing is deleted. | Add `PUT`/`DELETE` (soft-delete using the existing `deleted_at` columns) with audit entries, and make the UI call them. |
| 2.1.4 | 🟠 | M | **No pagination, sorting or filtering limits.** `GET /students` etc. return the whole table. | `?page=&limit=` with a max, plus total count; index the filter columns. |
| 2.1.5 | 🟠 | M | **Assignments, assignment submissions, and file uploads have no backend** (the Assignments tab is mock). | New tables + Supabase Storage uploads (the credentials doc already plans Storage). |
| 2.1.6 | 🟡 | M | Notice `audience` is stored but never filters who sees a notice (`department`/`class`/`teachers`/`students`). | Filter `GET /notices` by the caller's role/department/class; add read/unread per user. |
| 2.1.7 | 🟡 | S | No `GET /me/dashboard`-style endpoints; the frontend assembles dashboards from 8+ separate calls. | One aggregated endpoint per role (see section 3). |

### 2.2 Correctness bugs

| # | Priority | Effort | Finding | Where | Fix |
|---|---|---|---|---|---|
| 2.2.1 | 🟠 | S | **SGPA is computed per exam row, not per subject.** If a subject has internal + mid + end exams, its credits are counted 3×, `weightage` is ignored, and results from all semesters are mixed. | `exams.js:182-189` | Combine exams per subject using `weightage`, then credit-weight the subject grade points; filter by semester; add a CGPA across semesters. |
| 2.2.2 | 🟠 | S | **Attendance % is calculated differently in three places**: summary route counts `late` as present; the in-memory store counts only `present`; the frontend falls back to fixed `97% / 29 of 30`. | `attendance.js:112`, `store.js:149`, `App.jsx:60,107-110` | One shared rule in one service (e.g. late = 0.5 or configurable), used by API, cron and UI. Never default to made-up numbers. |
| 2.2.3 | 🟠 | S | **Receipt numbers use `Math.random()`** against a UNIQUE column; collisions will eventually throw a 500 *after* the fee was already flagged PAID (the two queries are not in a transaction). | `fees.js:224-233, 284-292` | Use a Postgres `SEQUENCE` (`RCP-2026-000123`) and put status update + payment insert in one transaction. |
| 2.2.4 | 🟠 | M | **Attendance and marks save one row per query in a loop**, no transaction. A failure mid-way leaves half a class saved. | `attendance.js:66-78`, `exams.js:119-132` | One transaction with a single multi-row `INSERT … ON CONFLICT` (e.g. `unnest` arrays). |
| 2.2.5 | 🟠 | S | **Marks can be changed after results are published**, and any teacher can write marks for any exam. | `exams.js:107` | Block edits when `is_published`, unless an admin opens a "re-evaluation"; verify the teacher is assigned to the subject. |
| 2.2.6 | 🟡 | S | **Fines are stored (`fine_in_paise`) but never used.** Overdue dues stay `PENDING`; there's no overdue status, late fine job or partial payment although the schema allows `PARTIAL`/`WAIVED`. | `schema.sql`, `fees.js` | Add computed `OVERDUE`, a daily fine job, `WAIVED` endpoint (accountant + audit), partial payments. |
| 2.2.7 | 🟡 | S | `server/db/store.js` (in-memory datastore) is **dead code** and conflicts with the Postgres logic (different grade scale, plaintext `password123`). | `server/db/store.js` | Delete it. |

### 2.3 Database & migrations

| # | Priority | Effort | Finding | Fix |
|---|---|---|---|---|
| 2.3.1 | 🟠 | M | **Schema drift:** `schema.sql` forbids the role `admin`, but code uses it; `initDb.js` drops and re-adds the constraint on every start. The schema is a single re-run file, not versioned migrations. | Fix the CHECK in `schema.sql`; adopt a migration tool (`node-pg-migrate`, Drizzle, Prisma Migrate, or Flyway) with numbered migrations; stop running DDL on app startup. |
| 2.3.2 | 🟠 | S | Missing indexes for real queries: `fee_dues(status)`, `payments(due_id)`, `enrolments(student_id)`, `timetable_slots(teacher_id, class_id)`, `notices(created_at)`, `audit_logs(created_at, entity)`. | Add them. |
| 2.3.3 | 🟡 | S | `students.section`, `batch`, `gender` etc. are free text; `attendance.period` is a string (`'01'`). | Enums / lookup tables; a `periods` table with start/end times (also fixes the "Period 1 (09:00-10:00)" labels). |
| 2.3.4 | 🟡 | M | No row-level security, no read-only DB role for reporting, no backup/restore test documented. | Use Supabase RLS as defense-in-depth; document backups and a restore drill (a good viva point). |

---

## 3. Dashboards — should each role get a separate one?

### Recommendation

**Yes — each role should land on its own dedicated dashboard — but inside one app with one login and one design system.** Do not build five separate front-ends.

**Why role-specific dashboards:** the five roles have different goals, data scope and risk. A student asks "am I safe on attendance, what's due?"; a teacher asks "which class is next, who hasn't been marked?"; an accountant asks "what's overdue today?"; an admin asks "is the institution healthy?".

**Why not five separate apps:** shared auth, shared components, shared API client and one deployment are cheaper to build and test. Role separation comes from routes + permissions, not from separate codebases. Only split into separate apps later if different teams or very different release cycles appear.

### What exists today vs. what each role should see

| Role | Today | Problem | Recommended landing dashboard |
|---|---|---|---|
| **Admin** | Lands on a *form page* ("Curriculums & Subjects"). There is no overview. Header badge "PostgreSQL 17 Database Active" and sidebar "Healthy" are static text. | An admin sees forms before seeing the state of the institution. | **Admin Overview:** counts (students, teachers, departments, subjects), this-month fee collection vs target, students below 75% attendance, unpublished exam results, recent audit events, live API/DB health from `/api/v1/health`, quick actions (enrol student, post notice). Move "Cloud Health & Docker" to a "System" page for demos. |
| **Teacher** | Lands directly on the attendance register. No overview. | No "today's classes", no pending work. | **Teacher Overview:** today's timetable with "mark attendance" buttons, classes not yet marked today, marks entry pending, low-attendance students in *my* classes, my notices. |
| **Student** | Good dashboard (attendance, SGPA, courses, fees, notices). | Several numbers are hard-coded (see 4); other tabs use different mock data. | **Keep, make it data-driven:** today's schedule, attendance by subject with "classes you can still miss", next exam, dues with due-date/overdue, assignments due soon, notices. |
| **Parent** | One long page; sidebar items (Attendance, Grades, Fees, Notices) don't navigate (the portal doesn't receive `activeTab`). Ward selector state exists but is unused. | Can't choose among multiple children; can't open sections. | **Parent Overview with ward switcher:** per-ward cards (attendance, SGPA, dues), alerts ("attendance below 75%", "fee overdue"), pay-now, notices. Sections become real routes. |
| **Accountant** | One page; sidebar links (`dues`, `structures`) don't drive the internal tabs. Ledger shows only *one* student (see 4.2). | Not usable as a finance dashboard. | **Finance Overview:** invoiced / collected / outstanding / **overdue**, collection trend chart, defaulter list, payments today, reconciliation status, waivers pending, export CSV. |

### How to implement

1. **Add a router** (React Router or TanStack Router) with role-prefixed routes: `/admin/overview`, `/teacher/overview`, `/student/overview`, `/parent/overview`, `/accountant/overview`, plus nested routes for each sidebar item. This also fixes back button, refresh, bookmarks, and the unused `NotFoundPage.jsx`.
2. **Route guard** component: reads the role from the authenticated user (not from a UI toggle) and redirects to that role's home; blocks other roles' routes.
3. **Code-split per role** with `React.lazy`, so a student never downloads admin code.
4. **One layout shell** (sidebar + navbar) that takes a nav config per role — you already did this; keep it.
5. **One aggregated endpoint per role** (`GET /dashboard/student`, `/teacher`, `/parent`, `/accountant`, `/admin`) so each dashboard loads in one request and the backend decides what the caller may see.
6. **Shared widgets** (`StatCard`, `DataTable`, `StatusBadge`, `EmptyState`, `Money`) so all dashboards look consistent.

### The demo role switcher

The "🎭 Demo: Admin / Teacher / Student / Parent / Accountant" bar lets *anyone* flip to the Admin UI without logging in, and the displayed user name/email are hard-coded per role (`Navbar.jsx:30-48`). Fine for a viva demo — but:

- show it **only** when `VITE_DEMO_MODE=true`;
- when it's off, role comes only from the logged-in user;
- better demo: one-click "Login as demo teacher/parent/…" buttons that perform a *real* login with seeded accounts, so the demo exercises the real permissions.

---

## 4. Frontend Working & Data Flow

### 4.1 Things that look like they work but don't persist (🔴)

| # | Finding | Where | Fix |
|---|---|---|---|
| 4.1.1 | **Fee payment never reaches the backend.** The payment modal just runs two `setTimeout`s; `apiPaySandbox`, `apiCreateRazorpayOrder` and `apiVerifyRazorpayPayment` are never called. The "receipt" is created client-side with a random number. Refresh the page and the fee is PENDING again. | `SandboxPaymentModal.jsx:21-30`, `App.jsx:397-408` | Real flow: `create-razorpay-order` → open Razorpay Checkout (load `checkout.js`) → `verify-razorpay-payment` → refetch dues → show the server's receipt number. Keep a clearly labelled "Test mode" banner. |
| 4.1.2 | **Teacher marks are never saved.** `handleRecordMarks` only `console.log`s. Unfilled marks silently default to **40**. | `App.jsx:230-232`, `TeacherPortal.jsx:118` | Create the exam (`POST /exams`) then `POST /exams/:id/marks`; no default marks — blank = not entered; validate ≤ max marks; add a Publish button for admin. |
| 4.1.3 | **Failed saves are shown as successes.** In every admin handler the `catch` block adds a fake local row (`id: dept-${Date.now()}`), and attendance appends records even when the API errors. With the demo switcher a user without a token sees "saved" for data that was rejected with 401. | `App.jsx:166-228` | Remove the fallbacks; show the real error toast; only update state from the server response. |
| 4.1.4 | **"Already recorded" is tracked only in browser memory** (`markedSessions`), so it resets on refresh, and the `alert()` blocks legitimate corrections even though the backend supports edits (UPSERT). | `TeacherPortal.jsx:77-90` | Load existing attendance for subject+date+period from the API; if present, open it in "edit" mode with a visible "last updated by/at". |

### 4.2 Wrong identity and wrong scope (🔴)

| # | Finding | Where | Fix |
|---|---|---|---|
| 4.2.1 | **The student shown isn't the logged-in user.** `currentStudent` = the student named "Alex Rivera" or the first in the list, for Student *and* Parent roles. A different student who logs in sees Alex's data. | `App.jsx:94, 235` | Student → `user.profile`. Parent → selected linked ward. Never search by name. |
| 4.2.2 | **The Accountant sees only one student's ledger.** `fetchAllData` loads dues for a single student only; the accountant screen (2 rows, "Alex Rivera" twice) is therefore not a real ledger. The totals ("Total Invoiced ₹77,500") are one person's. | `App.jsx:93-104`, screenshot 5 | `GET /fees/dues` should return all dues for accountant/admin (paginated, with totals computed server-side). |
| 4.2.3 | **Fallback values in the UI are fake data:** `97%`, `29 of 30`, `9.00`, "Class Rank: #1 in CSE-A", `₹12,500`, "Alex Rivera". If the API is slow or fails, the UI shows invented numbers. | `App.jsx:60,107-110,335-340`, `ParentPortal.jsx:26-35,84,92`, `Sidebar.jsx:234` | Show skeleton loaders and "no data yet" empty states instead. (`isLoading` exists in `App.jsx` but is never used.) |
| 4.2.4 | **Student tabs use a different fake student** from the dashboard. Attendance, Timetable, Exams, Assignments, Notices, Fees and the Report Card read `src/data/mockData.js` ("Alex **Morgan** Rivera", Semester **5**, roll `23CS42`, CGPA 8.84) while the Overview shows live "Semester **4**, roll `22CS001`, SGPA 9.00". | `AttendanceModule.jsx`, `TimetableModule.jsx`, `ExamsModule.jsx`, `AssignmentsModule.jsx`, `NoticeBoardModule.jsx`, `FeesModule.jsx`, `ReportCardModal.jsx`, `FeeReceiptModal.jsx`, `NotificationsDrawer.jsx` | Replace each with API data (or keep mock data strictly behind `VITE_DEMO_MODE`). Delete `mockData.js` from production builds. |
| 4.2.5 | **Dead sidebar items** for Parent and Accountant (their portals don't receive `activeTab`). | `App.jsx:298-319`, `Sidebar.jsx` | Router-based sections (see section 3). |
| 4.2.6 | **Notification badge = total notices**, not unread. "3 New" never goes away. | `App.jsx:262`, `Sidebar.jsx` | Per-user read state (`notice_reads`) and real unread count. |

### 4.3 Architecture & code quality

| # | Priority | Effort | Finding | Fix |
|---|---|---|---|---|
| 4.3.1 | 🟠 | M | `App.jsx` is a 430-line "god component" with ~12 `useState`s and heavy prop drilling; no router. | Split into providers (`AuthContext`, `DataContext`), a router and per-role route files. |
| 4.3.2 | 🟠 | M | Manual `fetch` + `useEffect` data loading; no caching, retries, or per-request loading/error state. | Adopt **TanStack Query** (cache, refetch after mutations, error/loading states for free). |
| 4.3.3 | 🟠 | S | Money handled inconsistently: `amount`, `amountInPaise`, `totalAmount`, `dueAmount` all appear in the UI. | One `formatMoney(paise)` helper and one field name (`amountInPaise`) end to end. |
| 4.3.4 | 🟠 | M | **~760 inline `style={{…}}` blocks** mixed with `App.css`; colors repeated (`#0f172a`, `#64748b`…) everywhere. | Move to CSS variables/tokens + a small component library (or Tailwind/CSS modules). One theme file, one place to change colors/spacing. |
| 4.3.5 | 🟡 | M | No TypeScript, no PropTypes, no error boundary, `alert()` used for validation. | Gradually adopt TypeScript; add an `ErrorBoundary`; replace `alert()` with inline form errors/toasts. |
| 4.3.6 | 🟡 | S | Unused code: `NotFoundPage.jsx` (never routed), `apiPaySandbox`/`apiEnterMarks` imports in `App.jsx`, `selectedWard` state, `src/assets/*` template images, `supabaseClient.js` if unused. | Remove or wire up. |

---

## 5. UI / UX — based on your 5 screenshots

### Across all screens

| # | Priority | Finding | Improvement |
|---|---|---|---|
| 5.1 | 🟠 | **Two navigations for the same thing (Admin).** The sidebar lists "1. Curriculums & Subjects … 5. Cloud Health & Docker" *and* a tab bar repeats the same five items right under the header. | Keep only the sidebar; use the page area for content. Drop the "1." numbering in labels. |
| 5.2 | 🟠 | **Demo switcher in the header** takes prime space and looks like a real feature. | Move into a small "Demo mode" menu (or hide it unless `VITE_DEMO_MODE`). |
| 5.3 | 🟠 | **Static status badges** present as live: "PostgreSQL 17 Database Active", "Healthy", "100% Audited", "Eligible", "Live Financial Ledger". | Drive them from real data (`/health`, real audit coverage) or remove. |
| 5.4 | 🟠 | **Dates/currency formats are inconsistent**: `17-10-2026` (teacher), `17 Oct` (notices), `15/5/2026` (accountant), `15 May 2026` (parent). | One `formatDate()` (e.g. `17 Oct 2026`) using `en-IN` locale throughout. |
| 5.5 | 🟠 | **Accessibility:** only 2 `aria-` attributes in the whole codebase; status conveyed by color alone (green/red pills); `index.html` title is just "Student Portal"; icon-only buttons lack labels; no visible focus states checked. | Add labels/`aria-live` for toasts, text + icon with color for status, focus rings, proper `<title>` per page; test with keyboard and Lighthouse. |
| 5.6 | 🟠 | **Responsive:** only two `@media` rules in `App.css` (1024px and 900px). A hamburger menu does appear below 900px, but dense tables and multi-column forms aren't adapted for phones. | Check every screen at 375px: tables scroll or collapse into cards, forms go single-column. Parents and students will mostly use phones. |
| 5.7 | 🟡 | No dark mode, no loading skeletons, no empty states, no confirmation toasts consistency. | Skeletons for cards/tables, friendly empty states with a call to action, one toast system. |
| 5.8 | 🟡 | Sidebar footer is empty for most roles; Accountant has a one-off "Bursar System" card. | Use the footer consistently (profile, help, version, logout). |

### Screenshot 1 — Admin ("Institution Setup & Master Management")

- Lands on forms, not a dashboard → add an **Admin Overview** (section 3).
- "Existing Departments (3)" are shown as pills only → show a table with edit/delete, counts of subjects/students per department.
- **Course form:** "Credits (1–6)" is a free number input pre-filled with `4` → use a stepper/select; "Semester Term" and "Course Type" fine, but add **Programme** (the code silently uses `programmes[0]` — `AdminPortal.jsx` `handleCreateSub`, so every subject goes to the first programme).
- Add inline validation (duplicate code check as you type), and disable "Save" until valid.
- "Curriculum Courses & Subjects (10 of 10)": add filters (department, semester, type), sorting, pagination, and an export.

### Screenshot 2 — Teacher ("Faculty Classroom & Gradebook Portal")

- **Layout looks clipped on the left** ("aily Attendance Register", "ampus Circulars", "arks & Gradebook Entry" cut off). If this isn't just a screenshot crop, the page has horizontal overflow — fix the container/sidebar width.
- The roster shows **all students with everyone preselected "Present"** and the counter says "Turnout: 100%". Defaulting to present invites careless saves → start unmarked (or require "Mark all present" as an explicit action), and block save until reviewed.
- The selected subject is `AI401: Machine Learning Foundations` but the rows are `22CS0xx` students → rosters should come from the subject's class/enrolments (backend gap 2.1.2).
- The roster is sorted by roll number **descending** (020 → 017…) → sort ascending, add search and keyboard shortcuts (P / A / L, arrow keys), sticky header with live tally.
- Add: "Period 1 (09:00–10:00)" should be derived from the timetable; show "already marked – last edited by/at"; undo after save; a confirm summary (you already have a modal — good).
- **Marks tab:** show a spreadsheet-style grid with validation against max marks, "save draft" vs "submit for publish".

### Screenshot 3 — Student (Alex Rivera)

- Good structure. But: "Class Rank: Top 5%" here vs "**#1 in CSE-A**" in the Parent view → compute rank server-side or remove it.
- Subject avatars show **"AI4" / "CS4"** (truncated 3 chars of the code) → use initials of the subject name or an icon.
- Notice text says mid-terms "commence from **March 25th**" while the notice is dated **17 Oct** → seed/demo data contradiction; also the date lacks a year.
- Overall attendance "97% — 29 of 30 sessions" is the **fallback value** (see 4.2.3); confirm it comes from the API.
- Add per-subject attendance bars with "you can miss N more classes", next class, next exam countdown, and "Fees & Payments ₹12.5k Due" should show *overdue* state if past the due date.
- Buttons "Attendance Simulator" and "View Marksheet" are good — keep, but the Marksheet currently renders mock data (4.2.4).

### Screenshot 4 — Parent ("Ward Academic & Financial Monitor")

- **All four subjects show identical `42.5 / 50 — Grade A+`.** It looks like placeholder data; use realistic seeded marks so the demo is credible.
- Fee card shows **"Due Date: 15 May 2026"** with badge "Due Soon", but the date is already past (today is Oct 2026) → show **Overdue** with days late and any fine.
- "Active Ward: Alex Rivera / AR" is static; add a **ward switcher** for parents with 2+ children.
- Sidebar items (Ward Attendance, Grades & Marksheets, Fee Dues, School Notices) do nothing (4.2.5).
- "Pay Online" should open real Razorpay Checkout (4.1.1); "Recent Cleared Payments" should link to the receipt PDF.
- Add parent-specific features: low-attendance alert preferences (email/SMS), message the class teacher, leave application.

### Screenshot 5 — Accountant ("Fee Management & Accounts Ledger")

- Only **2 rows, both Alex Rivera** → real ledger needs all students (4.2.2). Add pagination, date range, class/programme filters, CSV/Excel export.
- Status filter has ALL/PENDING/PAID → add **OVERDUE, PARTIAL, WAIVED**.
- "Total Invoiced (Sem 4) ₹77,500 · 100% Audited" is a static claim → remove or compute real audit coverage.
- Add: collection-trend chart, defaulter list, per-student statement, record offline payment (cash/cheque/UPI with reference), issue waiver with reason (audited), reconcile with Razorpay settlements, send reminder email.
- "Define Fee Head" should allow targeting a programme/semester/all and bulk-generating dues for a class.

---

## 6. Cloud, DevOps & Infrastructure

| # | Priority | Effort | Finding | Fix |
|---|---|---|---|---|
| 6.1 | 🔴 | S | **Docker Compose DB connection will fail**: Postgres in compose has no SSL but `postgres.js` forces SSL (1.11). | Env-driven SSL flag; test `docker compose up` from a clean clone. |
| 6.2 | 🟠 | S | `docker-compose.yml` hard-codes secrets, publishes DB port 5432 and API port 5000 to the host, uses the obsolete `version:` key; API has `NODE_ENV=production` while mounting `schema.sql` as init (so `initDb` also changes the schema). | Use `env_file`/Docker secrets; don't publish the DB port; remove `version`; make migrations the only schema path. |
| 6.3 | 🟠 | S | **Nginx config** is generated by an `echo` chain; no gzip, no security headers, no cache headers for hashed assets, no forwarded-IP headers. | Ship a real `nginx.conf` file (gzip, `Cache-Control` for `/assets`, `X-Forwarded-For`, CSP, HSTS in production). |
| 6.4 | 🟠 | M | **CI is thin:** lint + one DB-level script + build. It never starts the API, runs no HTTP tests, no frontend tests, no `npm audit`, no image scan, no deploy step. The "e2e" file is really a DB smoke test and, if run against the cloud `DATABASE_URL` locally, writes to your real database. | Add Vitest (unit), Supertest (API: auth, RBAC, payments, attendance), Playwright (login → role dashboards). Use a dedicated test DB. Add `npm audit`, Dependabot, Trivy/Grype image scan, and a CD job (Render/Vercel/EC2) with a smoke test on `/api/v1/health`. |
| 6.5 | 🟠 | S | Cron attendance alert runs via GitHub Actions at 00:00 UTC (05:30 IST) and uses a different attendance rule (2.2.2); it emails every shortfall *every day* (no de-duplication). | Share the attendance service; store `last_alerted_at` and email at most weekly / on threshold crossing; also notify parents. |
| 6.6 | 🟡 | M | **Serverless "receipt generator" doesn't generate a PDF** and isn't called by the API; its "digitalSignature" is a base64 string, and the status says `VERIFIED_LEGAL_RECEIPT`. README presents it as PDF generation. | Either implement it (render PDF → Supabase Storage → signed URL stored on the payment) or describe it honestly as a stub. Don't label unsigned data as "legal". |
| 6.7 | 🟡 | S | README overclaims: "TLS 1.3", "PgBouncer pool", "immutable audit log", "Kubernetes probes", "PDF generation". | Align the docs with what's implemented; add a "Known limitations" section (examiners and recruiters trust honesty). |
| 6.8 | 🟡 | M | No structured logging, request ids, metrics, or error tracking. | `pino` + request-id middleware; Sentry for frontend/backend; expose Prometheus-style metrics if you want the observability story. |

---

## 7. Testing & Quality

| # | Priority | Effort | Improvement |
|---|---|---|---|
| 7.1 | 🟠 | M | **API tests (Supertest):** register is blocked for admin roles; student cannot read another student; parent sees only linked wards; teacher cannot write marks for an unassigned subject; payment verify rejects mismatched order/amount/duplicate; attendance upsert is idempotent. |
| 7.2 | 🟠 | M | **Unit tests:** grade calculation, SGPA/CGPA, attendance %, "classes you can still miss", money formatting. |
| 7.3 | 🟡 | M | **UI tests (Playwright):** each role logs in and lands on its own dashboard; sidebar navigation works; pay-fee flow in Razorpay test mode. |
| 7.4 | 🟡 | S | Add `npm run test`, coverage threshold, and a PR template + branch protection on `main`. |

---

## 8. Feature Gaps (add after the fixes above)

**Student:** assignment submission with file upload, leave requests, course feedback, downloadable PDF marksheet/receipts, profile edit, password change.
**Teacher:** class analytics (attendance heatmap, grade distribution), assignment creation/grading, bulk marks import (CSV), message students/parents.
**Parent:** multi-ward, notification preferences, teacher meeting requests.
**Accountant:** reports (daily collection, defaulters), refunds, scholarship/waiver workflows, GST-style receipt numbering.
**Admin:** user management (create/deactivate/reset password), bulk import students (CSV), academic calendar, programme and class management UI, audit-log viewer with filters, role/permission management.
**Platform:** in-app notifications + email/SMS preferences, i18n (English/Hindi/Marathi), PWA/offline for attendance, dark mode.

---

## 9. Suggested Roadmap

| Phase | Goal | Contents | Est. effort |
|---|---|---|---|
| **0 — Security hotfix** | Make it safe to deploy | 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1 | 2–4 days |
| **1 — Make it real** | UI shows only real, persisted data | 4.1.x, 4.2.x, 2.1.1, 2.1.2, 2.2.x; remove mock/fallback data (or gate behind demo mode) | 1–2 weeks |
| **2 — Role dashboards** | Separate dashboards in one app | Router + guards + lazy loading, aggregated dashboard endpoints, Admin/Teacher overviews, Parent ward switcher, Accountant overview (section 3) | 1–2 weeks |
| **3 — UX polish** | Consistent, accessible, mobile-ready | Section 5, design tokens, TanStack Query, skeletons/empty states | 1 week |
| **4 — Quality & DevOps** | Trust the pipeline | Migrations, tests (section 7), CI/CD upgrades, logging, docs cleanup | 1 week |
| **5 — Features** | Differentiators | Section 8, starting with assignments, PDF receipts and notifications | ongoing |

**If you only have a few days before a demo/viva:** do 1.1, 1.2, 1.6, 1.7 (security basics), 4.1.1 (real payment flow), 4.2.1 (correct student identity), 4.2.2 (accountant sees all dues), the Parent/Accountant sidebar navigation (4.2.5), realistic seed marks, and hide the demo switcher behind a flag. Those give the biggest visible and defensible improvement.

---

## 10. What's already good (keep it)

- Money stored as integer **paise**; parameterized SQL everywhere (no string-built queries found); bcrypt hashing; Helmet and rate limiting; UPSERT for attendance and marks; unique constraints that prevent timetable clashes; sensible indexes; soft-delete columns.
- Clean separation of `routes/`, `middleware/`, `services/`, `scripts/`; health endpoint with DB ping; non-root backend container; multi-stage frontend image; CI with a Postgres service; scheduled cron workflow.
- A consistent card/badge visual language and a unified layout shell across roles; a useful "Attendance Simulator" idea.
- The README, architecture diagram and PRD give the project a strong narrative; tightening the docs to match reality will make it stronger.
