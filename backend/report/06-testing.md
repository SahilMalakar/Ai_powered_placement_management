# 6. Testing

## Unit Testing
Unit tests are written with Vitest, targeting pure utility functions, helper methods, and mocked AI wrappers to verify isolated logic and schema validations without requiring database access.

## Integration Testing
Integration tests are written using Vitest and Supertest running against a dockerized PostgreSQL database (port 5433) and Redis cache instance (port 6380). The tests execute through the active middleware stack (auth, RBAC, and validation), using signed JWT test cookies to authenticate requests.

## System Test Cases

| Test Case ID | Module | Description | Input | Expected Output | Actual Output | Status |
|--------------|--------|-------------|-------|------------------|----------------|--------|
| TC-AUTH-01 | Auth | Successful student signup | Valid email/password in body | 201 Created, sets cookies, user details returned | 201 Created, sets cookies, user details returned | Pass |
| TC-AUTH-02 | Auth | Prevent signup with duplicate email | Already registered email | 409 Conflict with unique error message | 409 Conflict with unique error message | Pass |
| TC-AUTH-03 | Auth | Validation error during signup | Invalid email format / short password | 400 Bad Request, validation errors | 400 Bad Request, validation errors | Pass |
| TC-AUTH-04 | Auth | Successful student login | Valid email and password | 200 OK, sets token/refreshToken cookies | 200 OK, sets token/refreshToken cookies | Pass |
| TC-AUTH-05 | Auth | Login with incorrect password | Valid email, wrong password | 401 Unauthorized | 401 Unauthorized | Pass |
| TC-AUTH-06 | Auth | Get current user session (/me) | Valid token cookie | 200 OK, returns logged-in user profile | 200 OK, returns logged-in user profile | Pass |
| TC-AUTH-07 | Auth | Successful password update | Valid current password and strong new password | 200 OK, password updated in database | 200 OK, password updated in database | Pass |
| TC-AUTH-08 | Auth | Password reset using OTP | Valid email, fetch OTP from Redis, reset request | 200 OK, password reset successfully | 200 OK, password reset successfully | Pass |
| TC-AUTH-09 | Auth | Rotate token using refresh token | Valid refreshToken cookie | 200 OK, rotates both token cookies | 200 OK, rotates both token cookies | Pass |
| TC-PROFILE-01 | Student Profile | Profile not found initially | GET request with new user's cookie | 404 Not Found response | 404 Not Found response | Pass |
| TC-PROFILE-02 | Student Profile | Successful profile creation | Valid fields in body (fullName, rollNo, branch...) | 201 Created, user isProfileCompleted is true | 201 Created, user isProfileCompleted is true | Pass |
| TC-PROFILE-03 | Student Profile | Profile creation validation fail | Invalid phone number formatting | 400 Bad Request | 400 Bad Request | Pass |
| TC-PROFILE-04 | Student Profile | Successful profile update | PATCH request with updated fullName / bio | 200 OK, profile updated successfully | 200 OK, profile updated successfully | Pass |
| TC-PROFILE-05 | Student Profile | Get academic record | Verified profile and semester sgpa record | 200 OK, returns CGPA and SGPA lists | 200 OK, returns CGPA and SGPA lists | Pass |
| TC-APPLICATION-01 | Student Application | Successful application to job | Eligible student profile, active job | 201 Created, application status is APPLIED | 201 Created, application status is APPLIED | Pass |
| TC-APPLICATION-02 | Student Application | Prevent duplicate application | Student applying to same job twice | 409 Conflict | 409 Conflict | Pass |
| TC-APPLICATION-03 | Student Application | Check branch eligibility | Student applying to a job that restricts their branch | 403 Forbidden | 403 Forbidden | Pass |
| TC-APPLICATION-04 | Student Application | Check CGPA requirement | Student CGPA is lower than job required CGPA | 403 Forbidden | 403 Forbidden | Pass |
| TC-APPLICATION-05 | Student Application | List student applications | GET request with student cookie | 200 OK, lists application items with job info | 200 OK, lists application items with job info | Pass |
| TC-DOCUMENT-01 | Student Document | List documents (initially empty) | GET request with student cookie | 200 OK, returns empty list | 200 OK, returns empty list | Pass |
| TC-DOCUMENT-02 | Student Document | Queue document upload | POST multipart request attaching a pdf file | 202 Accepted, returns jobId | 202 Accepted, returns jobId | Pass |
| TC-DOCUMENT-03 | Student Document | Prevent upload without file | POST request without file parameter | 400 Bad Request | 400 Bad Request | Pass |
| TC-DOCUMENT-04 | Student Document | Delete document successfully | Owner student deleting document | 200 OK, document hard deleted from DB | 200 OK, document hard deleted from DB | Pass |
| TC-DOCUMENT-05 | Student Document | Prevent deletion of others' docs | Student deleting other student's document | 403 Forbidden | 403 Forbidden | Pass |
| TC-EXPERIENCE-01 | Student Experience | Add work experience item | POST experience details | 201 Created, experience saved to DB | 201 Created, experience saved to DB | Pass |
| TC-EXPERIENCE-02 | Student Experience | Update work experience item | PATCH experience details | 200 OK, experience updated | 200 OK, experience updated | Pass |
| TC-EXPERIENCE-03 | Student Experience | Delete work experience item | DELETE experience item ID | 200 OK, experience deleted | 200 OK, experience deleted | Pass |
| TC-PROJECT-01 | Student Project | Add project item | POST project details | 201 Created, project saved to DB | 201 Created, project saved to DB | Pass |
| TC-PROJECT-02 | Student Project | Update project item | PATCH project details | 200 OK, project updated | 200 OK, project updated | Pass |
| TC-PROJECT-03 | Student Project | Delete project item | DELETE project item ID | 200 OK, project deleted | 200 OK, project deleted | Pass |
| TC-SKILL-01 | Student Skill | Add skill category | POST skill details | 201 Created, skill category saved to DB | 201 Created, skill category saved to DB | Pass |
| TC-SKILL-02 | Student Skill | Update skill category | PATCH skill details | 200 OK, skill category updated | 200 OK, skill category updated | Pass |
| TC-SKILL-03 | Student Skill | Delete skill category | DELETE skill category ID | 200 OK, skill category deleted | 200 OK, skill category deleted | Pass |
| TC-SOCIALLINK-01 | Student SocialLink | Add social link item | POST socialLink details | 201 Created, socialLink saved to DB | 201 Created, socialLink saved to DB | Pass |
| TC-SOCIALLINK-02 | Student SocialLink | Update social link item | PATCH socialLink details | 200 OK, socialLink updated | 200 OK, socialLink updated | Pass |
| TC-SOCIALLINK-03 | Student SocialLink | Delete social link item | DELETE socialLink ID | 200 OK, socialLink deleted | 200 OK, socialLink deleted | Pass |
| TC-ADDITIONAL-01 | Student AdditionalDetail | Add detail item | POST additional detail details | 201 Created, detail saved to DB | 201 Created, detail saved to DB | Pass |
| TC-ADDITIONAL-02 | Student AdditionalDetail | Update detail item | PATCH additional detail details | 200 OK, detail updated | 200 OK, detail updated | Pass |
| TC-ADDITIONAL-03 | Student AdditionalDetail | Delete detail item | DELETE additional detail ID | 200 OK, detail deleted | 200 OK, detail deleted | Pass |
| TC-VERIFICATION-01 | Student Verification | Fail if profile doesn't exist | POST verification request for new user | 404 Not Found | 404 Not Found | Pass |
| TC-VERIFICATION-02 | Student Verification | Fail if no marksheets uploaded | POST verification request with no documents | 400 Bad Request | 400 Bad Request | Pass |
| TC-VERIFICATION-03 | Student Verification | Initiate verification successfully | Profile exists, has SGPA marksheet uploaded | 200 OK, status transitions to PROCESSING | 200 OK, status transitions to PROCESSING | Pass |
| TC-VERIFICATION-04 | Student Verification | Fail if already processing | Triggering verification when status is processing | 409 Conflict | 409 Conflict | Pass |
| TC-ANNOUNCEMENT-01 | Student Announcement | Fail announcements if no profile | GET request with no profile completed | 400 Bad Request | 400 Bad Request | Pass |
| TC-ANNOUNCEMENT-02 | Student Announcement | Fetch branch targeted announcements | GET request, checks notifications targeted to branch | 200 OK, returns list of filtered notifications | 200 OK, returns list of filtered notifications | Pass |
| TC-JOB-01 | Admin Job | Create a job posting | Valid job details with deadline | 201 Created, status is DRAFT | 201 Created, status is DRAFT | Pass |
| TC-JOB-02 | Admin Job | Activate and deactivate job | POST /activate and POST /deactivate | 200 OK, transitions status ACTIVE -> DEACTIVE | 200 OK, transitions status ACTIVE -> DEACTIVE | Pass |
| TC-JOB-03 | Admin Job | Fetch all jobs and single job details | GET / and GET /:id | 200 OK, details fetched successfully | 200 OK, details fetched successfully | Pass |
| TC-JOB-04 | Admin Job | Soft delete a job posting | DELETE /:id | 200 OK, deletedAt timestamp set in DB | 200 OK, deletedAt timestamp set in DB | Pass |
| TC-JOBAPP-01 | Admin JobApplication | List all applications | GET /list with admin cookie | 200 OK, returns list of applications | 200 OK, returns list of applications | Pass |
| TC-JOBAPP-02 | Admin JobApplication | Batch update application statuses | POST /status with applicationIds and status | 200 OK, updates status to SHORTLISTED | 200 OK, updates status to SHORTLISTED | Pass |
| TC-JOBAPP-03 | Admin JobApplication | Fail update with empty payload | POST /status with empty IDs array | 400 Bad Request | 400 Bad Request | Pass |
| TC-ADMINSTUDENT-01 | Admin Students | List all students with branch filter | GET /?branch=CSE with admin cookie | 200 OK, returns list of CSE students | 200 OK, returns list of CSE students | Pass |
| TC-ADMINSTUDENT-02 | Admin Students | Fetch single student details | GET /:id with admin cookie | 200 OK, returns full student profile | 200 OK, returns full student profile | Pass |
| TC-ADMINSTUDENT-03 | Admin Students | Soft delete/Deactivate student | DELETE /:id with super admin cookie | 200 OK, student account deletedAt set | 200 OK, student account deletedAt set | Pass |
| TC-EXPORT-01 | Admin Export | Queue a student CSV export job | POST / with type students | 202 Accepted, status set to processing in Redis | 202 Accepted, status set to processing in Redis | Pass |
| TC-EXPORT-02 | Admin Export | Get job status from Redis cache | GET /:jobId/status | 200 OK, returns status and downloadUrl | 200 OK, returns status and downloadUrl | Pass |
| TC-EXPORT-03 | Admin Export | List historical export logs | GET /logs with admin cookie | 200 OK, returns array of logs | 200 OK, returns array of logs | Pass |
| TC-EXPORT-04 | Admin Export | Delete an export log | DELETE /logs/:id | 200 OK, log deleted from database | 200 OK, log deleted from database | Pass |
| TC-DASHBOARD-01 | Admin Dashboard | Fetch aggregated stats | GET /stats with admin cookie | 200 OK, returns student, job, and app metrics | 200 OK, returns student, job, and app metrics | Pass |
| TC-MESSAGE-01 | Admin Notification | Broadcast message to target branch | POST / with message, link, and target branch | 201 Created, recipientCount returned, status COMPLETED | 201 Created, recipientCount returned, status COMPLETED | Pass |
| TC-MESSAGE-02 | Admin Notification | Fetch historic broadcasts list | GET / with admin cookie | 200 OK, returns messages list | 200 OK, returns messages list | Pass |
| TC-TEAM-01 | Admin Team | List admin team members | GET / with super admin cookie | 200 OK, returns list of admins | 200 OK, returns list of admins | Pass |
| TC-TEAM-02 | Admin Team | Register a new administrator | POST / with email, password, and role | 201 Created, user role set to ADMIN | 201 Created, user role set to ADMIN | Pass |
| TC-TEAM-03 | Admin Team | Swap administrator role | PATCH /:id/role with SUPER_ADMIN | 200 OK, updates role in database | 200 OK, updates role in database | Pass |
| TC-TEAM-04 | Admin Team | Soft delete admin user account | DELETE /:id | 200 OK, deletedAt set on admin user | 200 OK, deletedAt set on admin user | Pass |
| TC-TEAM-05 | Admin Team | Reactivate soft deleted admin user | POST /:id/reactivate | 200 OK, deletedAt reset to null in DB | 200 OK, deletedAt reset to null in DB | Pass |

## Bug Log

### Bug: Skip rate limiters in testing mode
- **Module**: Auth, ATS, Application
- **Description**: Rapid requests in integration tests trigger HTTP 429 too many requests, breaking sequential integration tests.
- **Root Cause**: Rate limiting middlewares are active in tests and check request frequency.
- **Fix**: Skip rate limiters if `process.env.NODE_ENV === 'test'`.
- **Status**: Fixed

