# API List and Count

**Total APIs:** 53

> Note: WebSocket endpoint is counted as an API route here.

## Auth (10)

1. `POST` `/auth/signup` ✅ 🟡 [TRANSACTION, IDEMPOTENCY]
2. `POST` `/auth/login` ✅ 🟡 [CRUD]
3. `POST` `/auth/logout` ✅ 🟡 [CRUD]
4. `GET` `/auth/me` ✅ 🟡 [CRUD]
5. `POST` `/auth/refresh` [IDEMPOTENCY]
6. `PATCH` `/auth/change-password` 🟡 [CRUD]
7. `POST` `/auth/admins` [CRUD]
8. `DELETE` `/auth/students/:studentId` [TRANSACTION (Cascade Soft Delete)]
9. `POST` `/auth/password-reset/request` [QUEUE (Email), RATE_LIMIT (Redis, Optional)]
10. `POST` `/auth/password-reset/confirm` [CRUD]

## Students (25)

1. `GET` `/students/profile` 🟡 [CRUD]
2. `PUT` `/students/profile` 🟡 [TRANSACTION (Multi-relation sync)]
3. `PATCH` `/students/profile` 🟡 [TRANSACTION (Partial sync)]
4. `POST` `/students/documents` 🟡 [CRUD (Cloudinary Logic)]
5. `DELETE` `/students/documents/:documentId` 🟡 [CRUD (Cloudinary Logic)]
6. `POST` `/students/verification` [QUEUE (OCR Job), IDEMPOTENCY]
7. `GET` `/students/verification` [CRUD]
8. `POST` `/students/verification/retry` [QUEUE]
9. `GET` `/students/jobs` 🟡 [CRUD (Filtering/Search)]
10. `GET` `/students/jobs/:jobId` 🟡 [CRUD]
11. `POST` `/students/jobs/:jobId/apply` [TRANSACTION (Eligibility Check), IDEMPOTENCY, RATE_LIMIT (Optional)]
12. `GET` `/students/applications` 🟡 [CRUD]
13. `GET` `/students/applications/:applicationId` 🟡 [CRUD]
14. `POST` `/students/resumes` [QUEUE (AI Generation), RATE_LIMIT (DB Enforced: Max 5)]
15. `GET` `/students/resumes` [CRUD]
16. `GET` `/students/resumes/:resumeId` [CRUD]
17. `PATCH` `/students/resumes/:resumeId` [CRUD]
18. `POST` `/students/resumes/:resumeId/export` [CRUD (Puppeteer On-Demand), QUEUE (Optional for high load)]
19. `POST` `/students/ats` [QUEUE (LLM Worker), RATE_LIMIT (Redis: 5/day), IDEMPOTENCY]
20. `GET` `/students/ats` [CRUD]
21. `GET` `/students/ats/:analysisId` [CRUD]
22. `POST` `/students/interviews` [QUEUE (Gen Context), REDIS (Session)]
23. `GET` `/students/interviews/:sessionId` [CRUD]
24. `DELETE` `/students/interviews/:sessionId` [CRUD]
25. `WS` `/students/interviews/:sessionId/ws` [WEBSOCKET (Real-time AI)]

## Admin (18)

1. `POST` `/admin/jobs` 🟡 [CRUD]
2. `GET` `/admin/jobs` 🟡 [CRUD]
3. `GET` `/admin/jobs/:jobId` 🟡 [CRUD]
4. `PATCH` `/admin/jobs/:jobId` 🟡 [CRUD]
5. `DELETE` `/admin/jobs/:jobId` 🟡 [CRUD (Soft Delete)]
6. `POST` `/admin/jobs/:jobId/activate` [CRUD (Status update)]
7. `POST` `/admin/jobs/:jobId/deactivate` [CRUD]
8. `POST` `/admin/jobs/:jobId/notify` [QUEUE (Batch Email), WORKER, RATE_LIMIT (SMTP Safe)]
9. `GET` `/admin/jobs/:jobId/applicants` [CRUD]
10. `PATCH` `/admin/applications/status` [TRANSACTION (Batch update)]
11. `GET` `/admin/applications/:applicationId` [CRUD]
12. `GET` `/admin/students` 🟡 [CRUD]
13. `GET` `/admin/students/:studentId` 🟡 [CRUD]
14. `GET` `/admin/students/:studentId/verification` [CRUD]
15. `POST` `/admin/students/:studentId/verification/retry` [QUEUE]
16. `POST` `/admin/export` [QUEUE (Large CSV), WORKER, RATE_LIMIT (Optional)]
17. `POST` `/admin/admins` [CRUD]
18. `DELETE` `/admin/students/:studentId` [TRANSACTION (Cascade Soft Delete)]