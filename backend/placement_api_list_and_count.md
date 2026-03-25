# API List and Count

**Total APIs:** 53

> Note: WebSocket endpoint is counted as an API route here.

## Auth (10)

1. `POST` `/auth/signup` ✅ 🟡
2. `POST` `/auth/login` ✅ 🟡
3. `POST` `/auth/logout` ✅ 🟡
4. `GET` `/auth/me` ✅ 🟡
5. `POST` `/auth/refresh`
6. `PATCH` `/auth/change-password` 🟡
7. `POST` `/auth/admins`
8. `DELETE` `/auth/students/:studentId`
9. `POST` `/auth/password-reset/request`
10. `POST` `/auth/password-reset/confirm`

## Students (25)

1. `GET` `/students/profile` 🟡
2. `PUT` `/students/profile` 🟡
3. `PATCH` `/students/profile` 🟡
4. `POST` `/students/documents` 🟡
5. `DELETE` `/students/documents/:documentId` 🟡
6. `POST` `/students/verification`
7. `GET` `/students/verification`
8. `POST` `/students/verification/retry`
9. `GET` `/students/jobs` 🟡
10. `GET` `/students/jobs/:jobId` 🟡
11. `POST` `/students/jobs/:jobId/apply`
12. `GET` `/students/applications` 🟡
13. `GET` `/students/applications/:applicationId` 🟡
14. `POST` `/students/resumes`
15. `GET` `/students/resumes`
16. `GET` `/students/resumes/:resumeId`
17. `PATCH` `/students/resumes/:resumeId`
18. `POST` `/students/resumes/:resumeId/export`
19. `POST` `/students/ats`
20. `GET` `/students/ats`
21. `GET` `/students/ats/:analysisId`
22. `POST` `/students/interviews`
23. `GET` `/students/interviews/:sessionId`
24. `DELETE` `/students/interviews/:sessionId`
25. `WS` `/students/interviews/:sessionId/ws`

## Admin (18)

1. `POST` `/admin/jobs` 🟡
2. `GET` `/admin/jobs` 🟡
3. `GET` `/admin/jobs/:jobId` 🟡
4. `PATCH` `/admin/jobs/:jobId` 🟡
5. `DELETE` `/admin/jobs/:jobId` 🟡
6. `POST` `/admin/jobs/:jobId/activate`
7. `POST` `/admin/jobs/:jobId/deactivate`
8. `POST` `/admin/jobs/:jobId/notify`
9. `GET` `/admin/jobs/:jobId/applicants`
10. `PATCH` `/admin/applications/status`
11. `GET` `/admin/applications/:applicationId`
12. `GET` `/admin/students` 🟡
13. `GET` `/admin/students/:studentId` 🟡
14. `GET` `/admin/students/:studentId/verification`
15. `POST` `/admin/students/:studentId/verification/retry`
16. `POST` `/admin/export`
17. `POST` `/admin/admins`
18. `DELETE` `/admin/students/:studentId`








docker run -d \
  --name postgres-placement \
  --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=strongpassword \
  -e POSTGRES_DB=placement_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16









  docker run -d \
  --name redis-placement \
  --restart unless-stopped \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7 \
  redis-server --appendonly yes --requirepass strongredispassword