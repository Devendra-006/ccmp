# Cloud System Architecture & Technical Specifications
**Project:** Cloud-Based Student Management System (CSMS / CCMP)  
**Target:** Academic & Cloud Computing Evaluation

---

## 1. Cloud Architecture Diagram

```mermaid
graph TD
    Client["Client Layer (React + Vite SPA / PWA)<br/>CDN: Vercel / CloudFront"] 
    -->|HTTPS / TLS 1.3| Gateway["API Gateway / Reverse Proxy<br/>Nginx / Render"]
    
    Gateway -->|Rate Limited / Helmet Secured| Express["Backend Application Tier<br/>Node.js + Express (Docker Container)"]
    
    subgraph "Managed Cloud Data Tier"
        Express -->|PgBouncer / SSL| Postgres[("Primary Relational Database<br/>PostgreSQL 17 (Supabase / RDS)")]
        Express -->|In-Memory Buffer| MemCache["In-Memory Rate Limiter<br/>express-rate-limit"]
    end
    
    subgraph "External Cloud Services & SaaS"
        Express -->|Webhook / API| Razorpay["Payment Gateway API<br/>Razorpay (Test/Live Sandbox)"]
        Express -->|Transactional SMTP/API| Resend["Email Delivery Service<br/>Resend (React Email)"]
        Express -.->|Pre-Signed Uploads| Storage["Object Storage<br/>Supabase Storage / AWS S3"]
    end
    
    subgraph "Serverless & Automated Operations"
        Cron["Cloud Cron Scheduler<br/>GitHub Actions / EventBridge"] -->|Daily 00:00 UTC| Express
        Lambda["Serverless Worker (FaaS)<br/>AWS Lambda / Edge Function"] -.->|Event Trigger| Postgres
    end
```

---

## 2. Cloud Computing Service Model Mapping (IaaS vs PaaS vs SaaS vs FaaS)

| Cloud Model | Component in this Project | Provider / Technology | Architectural Rationale |
|---|---|---|---|
| **IaaS (Infrastructure as a Service)** | Compute Containers | Docker, AWS EC2 / Render Container runtime | Full control over Node.js execution runtime, ports, and OS dependencies with isolated Linux user. |
| **PaaS (Platform as a Service)** | Database Persistence Tier | Supabase PostgreSQL 17 / Neon | Managed database with automatic backups, high availability, connection pooling, and SSL termination. |
| **SaaS (Software as a Service)** | Payment Processing & Email | Razorpay (Fintech SaaS), Resend (Communication SaaS) | Offloads PCI-DSS compliance and email deliverability without running mail or card processing servers. |
| **FaaS (Function as a Service / Serverless)** | Receipt & Document Generator | AWS Lambda / Serverless Worker | Zero idle compute cost; autoscales on demand during semester fee deadlines. |

---

## 3. High Availability & Scalability Strategy

1. **Stateless API Tier:**
   The Express server maintains no in-memory session states. Sessions are verified via signed JSON Web Tokens (JWT). This allows running multiple container instances behind a round-robin load balancer without session stickiness issues.
2. **Connection Pooling:**
   Direct queries use PostgreSQL connection pooling with maximum pool ceilings and keep-alive recycling to prevent connection exhaustion during concurrent student traffic.
3. **Database Indexing:**
   High-cardinality search columns (`enrolment_no`, `roll_no`, `student_id`, `subject_id`, `date`) have B-Tree indexes configured in PostgreSQL.

---

## 4. Multi-Role Access Control Matrix (RBAC)

| Role | Admin Portal | Faculty Portal | Student Dashboard | Fee Payment | Gradebook |
|---|:---:|:---:|:---:|:---:|:---:|
| **Super / Academic Admin** | Full (CRUD) | View | View | Manage Dues | Audit |
| **Teacher / Faculty** | No Access | Full (Mark/Grade) | View Class | No Access | Read / Write |
| **Student** | No Access | No Access | Self Data Only | Pay & Receipts | View Only |
| **Parent** | No Access | No Access | Ward Data Only | Pay Ward Fees | View Only |
| **Accountant** | Financials | No Access | No Access | Full Reconciliation | No Access |
