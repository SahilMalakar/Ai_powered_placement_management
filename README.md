<div align="center">

<h1>🎓 TNP Placement Management System</h1>

<p><strong>A production-grade, AI-powered backend platform that automates end-to-end campus recruitment for engineering institutions.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-15%2B-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7%2B-DD0031?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Compose-0db7ed?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p>
  <img src="https://img.shields.io/badge/Tests-123%20Passed-brightgreen?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/Test%20Files-18%20Passed-brightgreen?style=for-the-badge" alt="Test Files" />
  <img src="https://img.shields.io/badge/License-ISC-orange?style=for-the-badge" alt="License" />
</p>

<br/>

<p>
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-ai--genai-integration">AI Integration</a> •
  <a href="#-testing">Testing</a> •
  <a href="#-deployment">Deployment</a>
</p>

</div>

---

## 📌 Overview

The **TNP (Training & Placement) Placement Management System** replaces manual placement operations with a fully automated, async-first backend platform. Built for engineering institutions serving 500–1,000 students, it handles the complete lifecycle — from student onboarding and document verification to AI-powered resume generation, ATS scoring, job applications, and bulk notifications.

> **Built by [Sahil Malakar](https://github.com/SahilMalakar)**

### The Problem It Solves

Traditional placement cells struggle with:
- Manual CGPA and eligibility verification
- Slow, error-prone resume screening
- No audit trail for applications
- Ad-hoc email blasts and notifications

This platform solves all of that with an **Automated Eligibility Engine**, **AI Resume Builder**, **Deterministic ATS Scorer**, and a fully **queue-driven async architecture** — so no operation ever blocks the request cycle.

---

## ✨ Features

### For Students
- 🔐 **JWT Auth** — Cookie-based auth with access + refresh token rotation and OTP password reset
- 👤 **Rich Profile System** — Branch, CGPA/SGPA, backlog status, projects, experience, skills, social links
- 📄 **Document Uploads** — Async Cloudinary sync for marksheets and certificates via BullMQ
- ✅ **OCR Verification** — AI-verified academic credentials (CGPA/SGPA cross-checked against uploaded marksheets)
- 🔍 **Job Discovery** — Browse and filter active job postings (no completed profile required)
- 📋 **Smart Applications** — Server-side eligibility enforcement (CGPA, branch, backlog, deadline, duplicates)
- 🤖 **AI Resume Builder** — 3-stage LLM pipeline (Audit → Role Identification → Generation) producing structured JSON + PDF
- ⚡ **Resume Optimizer** — LangGraph multi-node iterative loop with fabrication detection
- 📊 **ATS Scorer** — Deterministic, reproducible resume scoring with 6 sub-components and actionable feedback
- 🐙 **GitHub Importer** — Auto-import GitHub project READMEs directly into profile

### For Admins
- 💼 **Job Lifecycle Management** — DRAFT → ACTIVE → DEACTIVE with automated email blasts on activation
- 👥 **Student Management** — Paginated, filterable student list with full profile and verification status
- 📬 **Broadcast Notifications** — Branch-targeted email announcements via chunked BullMQ fan-out
- 📈 **Dashboard Analytics** — Redis-cached aggregated stats (students, jobs, applications, branch metrics)
- 📤 **Async CSV Exports** — Queue-driven data exports with Cloudinary delivery and audit logs
- 🏢 **Team Management** — Super Admin controls for admin accounts (create, role-swap, soft-delete, reactivate)

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────┐
                    │    Client (Student / Admin)  │
                    └──────────────┬───────────────┘
                                   │ HTTPS REST + JWT Cookies
                                   ▼
                    ┌─────────────────────────────────────┐
                    │          Express.js API              │
                    │  Auth → RBAC → Zod Validation →     │
                    │  Rate Limit → Controller → Service  │
                    │             → Repository            │
                    └──────────┬────────────────┬─────────┘
                               │                │
                  Sync reads   │                │  Async (enqueue)
                  & writes     ▼                ▼
              ┌──────────────────┐   ┌────────────────────────┐
              │   PostgreSQL     │   │         Redis           │
              │  (Prisma ORM)    │   │  • BullMQ Queues        │
              │  source of truth │   │  • Session Cache        │
              └────────┬─────────┘   │  • Rate Limit Keys      │
                       │             │  • Export Job Status    │
                       │             └───────────┬─────────────┘
                       │                         │
                       │                         ▼
                       │              ┌────────────────────────┐
                       │              │    Worker Processes     │
                       │              │  (separate containers)  │
                       │              │                         │
                       │              │  • verification.worker  │
                       │              │  • document.worker      │
                       │              │  • resume.worker        │
                       │              │  • optimizeResume.worker│
                       │              │  • ats.worker           │
                       │              │  • notification.worker  │
                       │              │  • export.worker        │
                       │              │  • githubScraper.worker │
                       │              └──────────┬─────────────┘
                       │                         │
                       │            ┌────────────┴─────────────┐
                       │            ▼                           ▼
                       │  ┌──────────────────┐    ┌─────────────────────┐
                       │  │  Gemini/LangChain│    │  Cloudinary Storage  │
                       │  │  (AI/LLM Calls)  │    │  (PDFs, Marksheets, │
                       │  └──────────────────┘    │   Exports, Resumes) │
                       │                           └─────────────────────┘
                       └──────────────────◄──────────────────────────────┘
                                  Workers write results back to PostgreSQL
```

### Design Principles

| Principle | Implementation |
|---|---|
| **Async-first** | All heavy operations (OCR, LLM, PDF, email, CSV) run in BullMQ workers — never in the request cycle |
| **Modular Monolith** | Single deployable API with clean `Controller → Service → Repository` separation per module |
| **Redis dual-purpose** | Serves as both BullMQ queue backend and caching layer (sessions, rate limits, snapshots) |
| **No DB-level cascades** | All cascade logic runs in Prisma `$transaction` blocks — full auditability and control |
| **Soft deletes everywhere** | `deletedAt` timestamps on all entities; hard deletes never occur in production |
| **Idempotent workers** | Every worker checks state before acting — safe to re-process without duplicating side effects |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 20+ LTS + TypeScript 5.x |
| **Framework** | Express.js 5.x |
| **ORM** | Prisma 7.x |
| **Database** | PostgreSQL 15+ |
| **Cache & Queue** | Redis 7+ (BullMQ) |
| **AI / LLM** | Google Gemini via LangChain + LangGraph |
| **PDF Generation** | `@react-pdf/renderer` (server-side React PDF) |
| **File Storage** | Cloudinary |
| **Email** | Nodemailer + Handlebars templates |
| **Auth** | JWT (HTTP-only cookies, access + refresh tokens) |
| **Validation** | Zod |
| **Testing** | Vitest + Supertest |
| **Containerization** | Docker + Docker Compose |
| **Package Manager** | pnpm |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20.x or higher
- **pnpm** → `npm install -g pnpm`
- **Docker & Docker Compose**

### 1. Clone & Install

```bash
git clone https://github.com/SahilMalakar/Ai_powered_placement_management.git
cd Ai_powered_placement_management/backend
pnpm install
```

### 2. Configure Environment

```bash
cp .env.examples .env
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables) below).

### 3. Start Infrastructure

```bash
# Starts PostgreSQL and Redis in Docker
docker-compose -f docker/docker-compose.dev.yml up -d
```

### 4. Run Database Migrations

```bash
pnpm run db:generate
cd src && pnpm dlx prisma db push
```

### 5. Start the Application

```bash
# Development (with hot reload)
pnpm run dev

# Production build
pnpm run build
pnpm run start
```

The API is available at `http://localhost:4000/api/v1`  
Swagger docs are available at `http://localhost:4000/api-docs`

---

## 🔑 Environment Variables

```dotenv
# Application
NODE_ENV=development
PORT=4000

# Authentication
JWT_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/placementcube?schema=public

# Redis
REDIS_URL=redis://:yourpassword@localhost:6379

# AI / LLM
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# File Storage (Cloudinary)
CLOUDINARY_KEY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email (SMTP via Nodemailer)
MAIL_USER=your_smtp_email@example.com
MAIL_PASS=your_smtp_app_password
```

---

## 📡 API Reference

**Base URL:** `/api/v1`

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register new student |
| `POST` | `/auth/login` | Public | Login & receive JWT cookies |
| `GET` | `/auth/me` | Any | Get current session (Redis-cached) |
| `POST` | `/auth/logout` | Any | Clear session and cookies |
| `PATCH` | `/auth/change-password` | Any | Update password |
| `POST` | `/auth/forget-password` | Public | Send OTP to registered email |
| `PATCH` | `/auth/reset-password` | Public | Reset password using OTP |
| `POST` | `/auth/refresh-token` | Refresh cookie | Rotate both tokens |

</details>

<details>
<summary><strong>👤 Student Profile</strong></summary>

| Method | Route | Description |
|---|---|---|
| `GET` | `/students/profile` | Get full profile |
| `POST` | `/students/profile` | Create profile |
| `PATCH` | `/students/profile` | Update core fields |
| `GET` | `/students/profile/academic` | Get academic records |
| `GET / POST` | `/students/profile/experience` | List / add work experience |
| `PATCH / DELETE` | `/students/profile/experience/:id` | Update / remove entry |
| `GET / POST` | `/students/profile/project` | List / add project |
| `PATCH / DELETE` | `/students/profile/project/:id` | Update / remove entry |
| `GET / POST` | `/students/profile/skill` | List / add skill |
| `PATCH / DELETE` | `/students/profile/skill/:id` | Update / remove entry |
| `GET / POST` | `/students/profile/socialLink` | List / add social link |
| `PATCH / DELETE` | `/students/profile/socialLink/:id` | Update / remove entry |
| `GET / POST` | `/students/profile/additionalDetail` | List / add additional detail |
| `PATCH / DELETE` | `/students/profile/additionalDetail/:id` | Update / remove entry |

</details>

<details>
<summary><strong>📄 Documents & Verification</strong></summary>

| Method | Route | Description |
|---|---|---|
| `GET` | `/students/document` | List uploaded documents |
| `POST` | `/students/document` | Upload document (async Cloudinary sync) |
| `DELETE` | `/students/document/:id` | Delete document + remove from Cloudinary |
| `POST` | `/students/verification` | Trigger OCR-based academic verification |

</details>

<details>
<summary><strong>💼 Jobs & Applications</strong></summary>

| Method | Route | Description |
|---|---|---|
| `GET` | `/students/application` | List student's applications |
| `POST` | `/students/application/:jobId/apply` | Apply (server-side eligibility enforced) |
| `GET` | `/students/announcements` | View branch-targeted announcements |

</details>

<details>
<summary><strong>🤖 Resume & ATS</strong></summary>

| Method | Route | Description |
|---|---|---|
| `POST` | `/students/resume` | Generate AI resume (enqueues to BullMQ) |
| `GET` | `/students/resume` | List all resumes (max 5) |
| `PATCH` | `/students/resume/:id` | Edit resume JSON |
| `POST` | `/students/optimizeResume` | Optimize resume via LangGraph pipeline |
| `POST` | `/students/ats` | Submit for ATS scoring (5/day limit) |
| `GET` | `/students/ats` | List all ATS results |
| `POST` | `/students/githubScraper` | Import GitHub project into profile |

</details>

<details>
<summary><strong>🛡️ Admin</strong></summary>

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST / GET` | `/admin/job` | Admin+ | Create / list job postings |
| `GET / DELETE` | `/admin/job/:id` | Admin+ | Get / soft-delete job |
| `POST` | `/admin/job/:id/activate` | Admin+ | Activate job + email blast |
| `POST` | `/admin/job/:id/deactivate` | Admin+ | Deactivate job |
| `GET` | `/admin/students` | Admin+ | List students (filtered, paginated) |
| `GET` | `/admin/students/:id` | Admin+ | Full student profile |
| `DELETE` | `/admin/students/:id` | Super Admin | Soft-delete student |
| `GET` | `/admin-apps/list` | Admin+ | List all applications |
| `POST` | `/admin-apps/application/status` | Admin+ | Bulk-update application statuses |
| `GET` | `/admin/dashboard/stats` | Admin+ | Aggregated stats (Redis-cached) |
| `POST / GET` | `/admin/messages` | Admin+ | Broadcast / list announcements |
| `POST` | `/admin/export` | Admin+ | Queue CSV export |
| `GET` | `/admin/export/:jobId/status` | Admin+ | Poll export status |
| `GET / DELETE` | `/admin/export/logs` | Admin+ | Export audit logs |
| `GET / POST` | `/admin/team` | Super Admin | List / create admins |
| `PATCH` | `/admin/team/:id/role` | Super Admin | Swap role |
| `DELETE / POST` | `/admin/team/:id` | Super Admin | Soft-delete / reactivate admin |

</details>

---

## 🤖 AI / GenAI Integration

All AI operations run exclusively through **BullMQ workers** — never synchronously in the request cycle. The system uses **Google Gemini via LangChain** for all active AI features.

### Resume Generation — 3-Stage Chain

```
Student Profile
      │
      ▼
┌──────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  Stage 1     │────▶│      Stage 2          │────▶│      Stage 3        │
│  AUDIT       │     │  ROLE IDENTIFICATION  │     │  GENERATION         │
│              │     │                      │     │                     │
│ Extracts     │     │ Picks ONE best-fit   │     │ Generates structured│
│ only         │     │ industry role based  │     │ resume JSON via     │
│ verifiable   │     │ on branch + facts    │     │ Zod schema + a      │
│ facts;       │     │ (e.g. "Backend       │     │ 3-tier content rule │
│ flags MISSING│     │  Engineer")          │     │ (Tier 3 = no        │
│ fields       │     │                      │     │  fabrication)       │
└──────────────┘     └──────────────────────┘     └─────────────────────┘
                                                            │
                                                            ▼
                                               Resume JSON stored in DB
                                               (PDF exported on demand)
```

### Resume Optimization — LangGraph Multi-Node Loop

A stateful graph that iteratively rewrites and validates the resume:

```
classifier → inventory → estimator → analyzer → optimizer
                                                     │
                                           fabricationDetector
                                                     │
                                                  critique ──► (loop if score below ceiling)
                                                     │
                                               jsonMapper → gapReporter → END
```

### ATS Scoring — Deterministic Engine

- **Temperature 0, topP/topK = 1** — same resume + JD always produces the same score
- **6 sub-components:** keyword (30pts), experience (25pts), projects (20pts), skills (10pts), format (10pts), additional details (5pts)
- **Rate limited:** 5 checks per student per day (Redis TTL key)
- **2 modes:** `JD_MATCHED` (vs. job description) and `GENERIC` (vs. domain keyword table)

### Anti-Hallucination Design

| Principle | Enforcement |
|---|---|
| Ground truth first | Dedicated audit stage extracts only facts present in input; flags `MISSING` fields |
| Tiered content rule | Tier 1 (explicit facts) → Tier 2 (domain-implied) → Tier 3 (fabricated — **prohibited**) |
| Missing metric handling | Inserts `[ADD YOUR ACTUAL NUMBER]` instead of inventing metrics |
| Independent fabrication audit | Separate `fabricationDetector` node diffs output against inventory |
| Strict output contracts | Every prompt forbids markdown fences and specifies exact JSON key structure |

---

## 🧪 Testing

### Run Tests

```bash
# Spin up isolated test infrastructure
docker-compose -f docker/docker-compose.test.yml up -d

# Run full test suite
pnpm run test
```

### Test Results

```
Test Files   18 passed (18)
Tests       123 passed (123)
Duration    13.60s
```

### Coverage

| Module | Test Cases | Status |
|---|---|---|
| Auth | 9 | ✅ All Pass |
| Student Profile | 5 | ✅ All Pass |
| Student Application | 5 | ✅ All Pass |
| Student Document | 5 | ✅ All Pass |
| Work Experience | 3 | ✅ All Pass |
| Projects | 3 | ✅ All Pass |
| Skills | 3 | ✅ All Pass |
| Social Links | 3 | ✅ All Pass |
| Additional Details | 3 | ✅ All Pass |
| Verification | 4 | ✅ All Pass |
| Announcements | 2 | ✅ All Pass |
| Admin Jobs | 4 | ✅ All Pass |
| Admin Job Applications | 3 | ✅ All Pass |
| Admin Students | 3 | ✅ All Pass |
| Admin Export | 4 | ✅ All Pass |
| Admin Dashboard | 1 | ✅ All Pass |
| Admin Notifications | 2 | ✅ All Pass |
| Admin Team | 5 | ✅ All Pass |
| **Total** | **123 cases** | **✅ All Pass** |

> Integration tests use Vitest + Supertest against Dockerized PostgreSQL (port 5433) and Redis (port 6380). Rate limiters are bypassed in `NODE_ENV=test`.

---

## 🐳 Deployment

### Docker Compose Environments

| File | Purpose |
|---|---|
| `docker/docker-compose.dev.yml` | Local development |
| `docker/docker-compose.test.yml` | Isolated integration testing |
| `docker/docker-compose.prod.yml` | Production deployment |

### CI/CD Pipeline (GitHub Actions)

```
Push to main
     │
     ├── Lint & Format check (ESLint + Prettier)
     ├── TypeScript compilation
     ├── Run integration test suite
     ├── Build & push Docker image to Docker Hub
     └── SSH → AWS EC2 → pull & restart containers
```

### Scale Targets

| Metric | Target |
|---|---|
| Total students | 500 – 1,000 |
| Concurrent users | 50 – 100 |
| Concurrent requests | 10 – 20 |
| Peak read QPS | ~0.5 (Redis-cached job search) |
| Peak write QPS | ~0.03 (application bursts) |

A single Dockerized deployment (API + workers + PostgreSQL + Redis) is sufficient for the target scale. No horizontal scaling or sharding required.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/                    # Signup, login, OTP, token refresh
│   │   ├── students/                # Profile, documents, verification,
│   │   │                            # applications, resume, ATS, GitHub
│   │   └── admin/                   # Job mgmt, student mgmt, exports,
│   │                                # team, dashboard, broadcasts
│   ├── shared/
│   │   ├── middlewares/             # Auth, RBAC, Zod validation, rate limit
│   │   ├── queues/                  # BullMQ producers (one per domain)
│   │   ├── workers/                 # BullMQ consumers (async processors)
│   │   └── utils/
│   │       ├── prompts/             # LLM prompt templates
│   │       └── templates/           # React PDF layout + HBS email templates
│   └── infra/                       # Cloudinary, LangChain, Redis, Nodemailer
├── tests/
│   └── integration/                 # 18 test files, 68 test cases
├── docker/                          # Dockerfiles + Compose configs
├── scripts/                         # Queue inspection + dev utilities
└── prisma/                          # Schema + 15 migrations
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch → `git checkout -b feature/YourFeature`
3. Commit your changes → `git commit -m 'Add YourFeature'`
4. Push to the branch → `git push origin feature/YourFeature`
5. Open a Pull Request

Please ensure all existing tests pass (`pnpm run test`) and new features include appropriate test coverage.

---

## 📄 License

Distributed under the **ISC License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">
  <p>Developed with ❤️ by <a href="https://github.com/SahilMalakar"><strong>Sahil Malakar</strong></a></p>
  <p>
    <a href="https://github.com/SahilMalakar/Ai_powered_placement_management/issues">Report Bug</a> •
    <a href="https://github.com/SahilMalakar/Ai_powered_placement_management/issues">Request Feature</a>
  </p>
</div>
