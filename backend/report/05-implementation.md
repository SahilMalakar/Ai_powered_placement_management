# 5. Implementation

## Module: Auth

The Auth module handles user registration, login, logout, password updates, and token refresh. It relies on the Prisma `User` model, caches session data and OTP codes in Redis, and enqueues notification events to the BullMQ `notificationQueue`.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| POST   | /api/v1/auth/signup | Registers a new student and sets authentication cookies. | None |
| POST   | /api/v1/auth/login | Authenticates credentials and sets access and refresh cookies. | None |
| GET    | /api/v1/auth/me | Retrieves the active user session (with Redis caching). | Student / Admin / Super Admin |
| POST   | /api/v1/auth/logout | Logs the user out and clears the cookies/caches. | Student / Admin / Super Admin |
| PATCH  | /api/v1/auth/change-password | Allows users to change their account password. | Student / Admin / Super Admin |
| POST   | /api/v1/auth/forget-password | Generates an OTP, stores it in Redis, and queues a reset email. | None |
| PATCH  | /api/v1/auth/reset-password | Resets password after verifying the cached Redis OTP. | None |
| POST   | /api/v1/auth/refresh-token | Uses the refresh token cookie to rotate both tokens. | None (requires refresh cookie) |

## Module: Student Profile

Manages student academic profiles, contact details, and basic demographic data. It integrates with Prisma `StudentProfile` and `User` models, caches profile snapshots in Redis, and enforces locks during verification states.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/students/profile | Fetches the full profile details of the active student. | Student |
| GET    | /api/v1/students/profile/academic | Fetches verified academic records (CGPA, SGPA marksheets). | Student |
| POST   | /api/v1/students/profile | Creates a student profile and marks profile as completed. | Student |
| PATCH  | /api/v1/students/profile | Updates student profile details (except locked fields). | Student |

## Module: Student Application

Orchestrates the job application flow for students. It validates student eligibility against job postings (CGPA, branches, backlog allowance, and deadlines) and stores immutable snapshots of student profiles at application time using Prisma database transactions.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| POST   | /api/v1/students/application/:jobId/apply | Applies to a job posting after running eligibility checks. | Student |
| GET    | /api/v1/students/application | Lists all job applications submitted by the student. | Student |

## Module: Student Document

Manages student marksheets and certificate document uploads. It saves file data locally through Multer and enqueues jobs to the BullMQ `documentQueue` for background processing (Cloudinary upload and DB syncing).

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/students/document | Lists all marksheets and certificates for the student. | Student |
| POST   | /api/v1/students/document | Uploads a document (PDF/DOC) and queues background processing. | Student |
| DELETE | /api/v1/students/document/:id | Permanently deletes a document and triggers Cloudinary removal. | Student |

## Module: Profile Sub-Relations (Experience, Project, Skill, SocialLink, AdditionalDetail)

A collection of endpoints representing specialized nested sections of a student profile. These sub-relations support CRUD operations, validate schemas, invalidate profile caches, and lock modifications if verification is processing.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/students/profile/experience | Fetches work experience list. | Student |
| POST   | /api/v1/students/profile/experience | Adds a new work experience. | Student |
| PATCH  | /api/v1/students/profile/experience/:id | Updates a work experience item. | Student |
| DELETE | /api/v1/students/profile/experience/:id | Deletes a work experience item. | Student |
| GET    | /api/v1/students/profile/project | Fetches student projects. | Student |
| POST   | /api/v1/students/profile/project | Adds a new project. | Student |
| PATCH  | /api/v1/students/profile/project/:id | Updates a project item. | Student |
| DELETE | /api/v1/students/profile/project/:id | Deletes a project item. | Student |
| GET    | /api/v1/students/profile/skill | Fetches student skills. | Student |
| POST   | /api/v1/students/profile/skill | Adds a new skill category. | Student |
| PATCH  | /api/v1/students/profile/skill/:id | Updates a skill category item. | Student |
| DELETE | /api/v1/students/profile/skill/:id | Deletes a skill category item. | Student |
| GET    | /api/v1/students/profile/socialLink | Fetches student social links. | Student |
| POST   | /api/v1/students/profile/socialLink | Adds a new social link. | Student |
| PATCH  | /api/v1/students/profile/socialLink/:id | Updates a social link item. | Student |
| DELETE | /api/v1/students/profile/socialLink/:id | Deletes a social link item. | Student |
| GET    | /api/v1/students/profile/additionalDetail | Fetches student additional details. | Student |
| POST   | /api/v1/students/profile/additionalDetail | Adds a new additional detail item. | Student |
| PATCH  | /api/v1/students/profile/additionalDetail/:id | Updates an additional detail item. | Student |
| DELETE | /api/v1/students/profile/additionalDetail/:id | Deletes an additional detail item. | Student |

## Module: Student Verification

Enables students to submit their documents for verification. It validates marksheet presence, transitions profile status to `PROCESSING`, and dispatches jobs to `verificationQueue`.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| POST   | /api/v1/students/verification | Triggers student profile document verification. | Student |

## Module: Student Announcement

Allows students to fetch active and targeted broadcast notices posted by admins, filtered by student's branch and page/limit query parameters.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/students/announcements | Fetches announcements targeted to student's branch. | Student |

## Module: Admin Job Management

Orchestrates the job postings management flow. It enables administrators to create new placement job listings, toggle job status between active and inactive states, retrieve job lists or specific job details, and perform soft-deletions.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| POST   | /api/v1/admin/job | Creates a new job posting in DRAFT status. | Admin / Super Admin |
| GET    | /api/v1/admin/job | Retrieves a list of all job postings. | Admin / Super Admin |
| GET    | /api/v1/admin/job/:id | Fetches details of a specific job posting. | Admin / Super Admin |
| DELETE | /api/v1/admin/job/:id | Performs a soft-deletion of a job posting. | Admin / Super Admin |
| POST   | /api/v1/admin/job/:id/activate | Transitions job status to ACTIVE. | Admin / Super Admin |
| POST   | /api/v1/admin/job/:id/deactivate | Transitions job status to DEACTIVE. | Admin / Super Admin |

## Module: Admin Job Applications

Provides administrative control over student applications. It allows listing all incoming applications and batch updating their statuses (e.g., Shortlisted, Selected, Rejected).

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/admin-apps/list | Lists all student job applications with filters. | Admin / Super Admin |
| POST   | /api/v1/admin-apps/application/status | Performs bulk status updates on student applications. | Admin / Super Admin |

## Module: Admin Student Management

Enables administrators to view student listings, fetch individual full profiles (including academic results), and deactivate student accounts.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/admin/students | Fetches a paginated, filterable list of all students. | Admin / Super Admin |
| GET    | /api/v1/admin/students/:id | Retrieves the detailed profile of a student. | Admin / Super Admin |
| DELETE | /api/v1/admin/students/:id | Deactivates/soft deletes a student account. | Super Admin |

## Module: Admin Export

Handles asynchronous generation of CSV data dumps for students and job applications. It uses a BullMQ queue to run exports in the background, cache status in Redis, and log results in PostgreSQL.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| POST   | /api/v1/admin/export | Queues a CSV export job for student or application data. | Admin / Super Admin |
| GET    | /api/v1/admin/export/logs | Lists historical export logs. | Admin / Super Admin |
| DELETE | /api/v1/admin/export/logs/:id | Deletes a specific export log. | Admin / Super Admin |
| GET    | /api/v1/admin/export/:jobId/status | Retrieves the processing status or download link of an export job. | Admin / Super Admin |

## Module: Admin Dashboard

Aggregates stats such as total students, job postings, total applications, and branch-level metrics with a fail-safe caching system.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/admin/dashboard/stats | Retrieves aggregated placement stats and timeline. | Admin / Super Admin |

## Module: Admin Notifications (Message)

Enables administrators to create and broadcast custom email announcements to students filtered by branch using chunked queueing.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| POST   | /api/v1/admin/messages | Creates and broadcasts a notification to selected branches. | Admin / Super Admin |
| GET    | /api/v1/admin/messages | Retrieves broadcast notification logs history. | Admin / Super Admin |

## Module: Admin Team Management

Provides controls for managing administrative team accounts, enabling creation, role modification, soft deletion, and reactivation of administrators.

| Method | Route | Description | Auth Required |
|--------|-------|-------------|----------------|
| GET    | /api/v1/admin/team | Lists all administrative users in the system. | Super Admin |
| POST   | /api/v1/admin/team | Registers a new administrator user. | Super Admin |
| PATCH  | /api/v1/admin/team/:id/role | Updates an administrator's role (ADMIN vs SUPER_ADMIN). | Super Admin |
| DELETE | /api/v1/admin/team/:id | Deactivates an administrator's account. | Super Admin |
| POST   | /api/v1/admin/team/:id/reactivate | Reactivates a deactivated administrator account. | Super Admin |

