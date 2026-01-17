# Product Requirements Document (PRD)
## CodeBreaker Dashboard Platform

**Version:** 1.0  
**Last Updated:** January 17, 2026  
**Document Owner:** Product Team

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Objectives & Goals](#3-objectives--goals)
4. [Target Users](#4-target-users)
5. [User Stories & Use Cases](#5-user-stories--use-cases)
6. [Feature Requirements](#6-feature-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Technical Constraints](#8-technical-constraints)
9. [Success Metrics](#9-success-metrics)
10. [Release Planning](#10-release-planning)
11. [Risks & Mitigations](#11-risks--mitigations)

---

## 1. Executive Summary

### What is CodeBreaker Dashboard?
CodeBreaker Dashboard is a comprehensive educational platform designed for managing coding clubs, technical communities, and programming bootcamps. It provides a complete ecosystem for member management, learning activities, competitive programming, event coordination, and community engagement.

### Problem Statement
Educational institutions and coding clubs struggle to:
- Manage member registrations and profiles efficiently
- Track attendance and participation
- Organize coding challenges and quizzes
- Evaluate student projects and submissions
- Maintain engagement through events and announcements
- Provide learning resources in an organized manner

### Solution
A unified dashboard platform that streamlines administrative operations while providing students with an interactive learning environment featuring coding challenges, real-time collaboration, and gamified point systems.

### Key Value Propositions
- **For Admins:** Centralized management of all club activities with automated workflows
- **For Members:** Engaging learning platform with competitive coding, project showcases, and resource library
- **For Organizations:** Data-driven insights into member engagement and learning progress

---

## 2. Product Overview

### Vision
To be the leading platform for managing and scaling technical educational communities with best-in-class member engagement and learning outcomes.

### Mission
Empower educational institutions and coding clubs with tools to manage operations efficiently while providing students with an immersive, competitive, and collaborative learning environment.

### Core Capabilities
1. **Member Management System** - Complete lifecycle management of members
2. **Coding Platform** - LeetCode-style problem-solving environment
3. **Attendance Management** - QR-code based automated attendance system
4. **Event & Task Management** - Comprehensive event coordination and task tracking
5. **Quiz System** - Multi-set quiz platform with proctoring features
6. **Resource Library** - Organized learning materials and documentation
7. **Project Showcase** - Platform for displaying member projects
8. **Analytics Dashboard** - Insights into engagement and performance

---

## 3. Objectives & Goals

### Primary Objectives
1. **Reduce Administrative Overhead** by 70% through automation
2. **Increase Member Engagement** by 50% through gamification
3. **Improve Learning Outcomes** with structured coding challenges
4. **Enable Data-Driven Decisions** through comprehensive analytics

### Business Goals
- Onboard 1,000+ members in the first year
- Achieve 80% member satisfaction rate
- Reduce manual attendance marking time by 90%
- Process 10,000+ code submissions monthly

### User Goals
- **Students:** Easy access to learning resources, track progress, participate in competitions
- **Admins:** Efficient member management, automated workflows, detailed analytics
- **Instructors:** Monitor student progress, evaluate submissions, provide feedback

---

## 4. Target Users

### Primary Personas

#### 1. **Admin/Organizer**
- **Profile:** Technical club organizer or faculty coordinator
- **Goals:** Manage members efficiently, track engagement, organize events
- **Pain Points:** Manual processes, scattered data, difficulty tracking attendance
- **Technical Proficiency:** Medium to High

#### 2. **Student Member**
- **Profile:** College student interested in coding and technology
- **Goals:** Learn new skills, participate in competitions, showcase projects
- **Pain Points:** Lack of structured learning path, difficulty finding resources
- **Technical Proficiency:** Varies (Beginner to Advanced)

#### 3. **Volunteer/Team Lead**
- **Profile:** Senior member helping with club operations
- **Goals:** Assist in event management, mentor juniors
- **Pain Points:** Limited access to management tools
- **Technical Proficiency:** Medium to High

---

## 5. User Stories & Use Cases

### Admin User Stories

**US-A01: Member Registration Management**
- **As an** admin
- **I want to** review and approve member registrations
- **So that** I can maintain quality membership and complete profiles
- **Acceptance Criteria:**
  - View pending registrations with incomplete profiles
  - Filter by branch, admission year, completion status
  - Export member data for external use
  - Send reminder emails to incomplete profiles

**US-A02: QR-Based Attendance**
- **As an** admin
- **I want to** generate time-limited QR codes for attendance
- **So that** I can automate attendance marking and prevent fraud
- **Acceptance Criteria:**
  - Generate QR code with 5-minute expiry
  - Display countdown timer
  - Track scan counts
  - Manual deactivation option
  - View attendance reports

**US-A03: Quiz Management**
- **As an** admin
- **I want to** create multi-set quizzes with time limits
- **So that** I can conduct fair assessments with different question sets
- **Acceptance Criteria:**
  - Create quizzes with 1-8 different sets
  - Set duration and points per question
  - Schedule quiz with start/end times
  - Assign sets randomly to students
  - View results and analytics

**US-A04: Task & Event Management**
- **As an** admin
- **I want to** create tasks and events with point allocations
- **So that** I can track submissions and reward participation
- **Acceptance Criteria:**
  - Create tasks with deadlines and point values
  - Review submissions (URLs, screenshots)
  - Approve/reject with feedback
  - Track event participation
  - Generate leaderboards

**US-A05: Announcement Broadcasting**
- **As an** admin
- **I want to** create categorized announcements with media
- **So that** I can communicate effectively with different audiences
- **Acceptance Criteria:**
  - Create rich-text announcements
  - Attach images and PDFs
  - Set priority levels (normal, important, urgent)
  - Target specific audiences (public, participants, volunteers)
  - Schedule and auto-expire announcements
  - Pin important announcements

### Student User Stories

**US-S01: Profile Completion**
- **As a** student
- **I want to** complete my profile during onboarding
- **So that** I can access all platform features
- **Acceptance Criteria:**
  - Multi-step registration form
  - Upload profile picture and documents
  - Provide academic and contact details
  - Progress indicator showing completion

**US-S02: Coding Challenges**
- **As a** student
- **I want to** solve LeetCode-style problems with code editor
- **So that** I can improve my programming skills
- **Acceptance Criteria:**
  - Browse problems by difficulty (Easy, Medium, Hard)
  - Filter by tags (Array, String, DP, etc.)
  - Write code in Monaco editor with syntax highlighting
  - Run and test code with sample test cases
  - Submit code for evaluation
  - View submission history and acceptance rate

**US-S03: QR Attendance Marking**
- **As a** student
- **I want to** scan QR codes to mark attendance using my phone
- **So that** I can quickly mark attendance without waiting in line
- **Acceptance Criteria:**
  - Camera-based QR scanner
  - Instant verification and confirmation
  - Auto-award points for attendance
  - View attendance history
  - See attendance percentage

**US-S04: Quiz Participation**
- **As a** student
- **I want to** take timed quizzes with proctoring
- **So that** I can test my knowledge fairly
- **Acceptance Criteria:**
  - Receive randomly assigned question set
  - Countdown timer display
  - Fullscreen enforcement
  - Tab-switch detection and warnings
  - Auto-submit on violations or time expiry
  - View score immediately after completion

**US-S05: Project Submission**
- **As a** student
- **I want to** submit projects for review and showcase
- **So that** I can get feedback and display my work
- **Acceptance Criteria:**
  - Submit GitHub repository URL
  - Add project description and tech stack
  - Upload thumbnail/screenshots
  - Track submission status
  - Receive admin feedback
  - See published projects in showcase

**US-S06: Resource Access**
- **As a** student
- **I want to** access organized learning resources
- **So that** I can learn at my own pace
- **Acceptance Criteria:**
  - Browse resources by folders/categories
  - Filter by type (PDF, video, link)
  - Search by tags
  - Download materials
  - View video previews

**US-S07: Leaderboard & Points**
- **As a** student
- **I want to** view my rank and points breakdown
- **So that** I can track my progress and compete
- **Acceptance Criteria:**
  - Global leaderboard with rankings
  - Filter by branch and admission year
  - Points breakdown by category
  - Activity timeline
  - Achievement badges

---

## 6. Feature Requirements

### 6.1 Authentication & Authorization

**Priority:** P0 (Critical)

**Description:**  
Secure authentication system supporting multiple OAuth providers and email verification with role-based access control.

**Technical Requirements:**
- OAuth integration (GitHub, Google, Discord)
- Email OTP verification
- Session management with expiry
- Role-based permissions (Admin, User)
- Account linking/unlinking

**User Impact:**  
Ensures secure access and protects user data while providing convenient login options.

---

### 6.2 Member Management System

**Priority:** P0 (Critical)

**Description:**  
Comprehensive system for managing member lifecycle from registration to profile management.

**Features:**
- **Registration & Onboarding**
  - Multi-step form with validation
  - File uploads (profile picture, Aadhaar)
  - Academic information collection
  - Contact details (mobile, WhatsApp, UPI)
  
- **Profile Management**
  - View and edit profile
  - Track profile completion status
  - Upload verification documents
  
- **Admin Controls**
  - View all members with filters
  - Export member data (CSV, PDF)
  - Mark profiles as complete/incomplete
  - Ban/unban users with reason tracking

**Data Fields:**
- Personal: Name, email, mobile, WhatsApp, UPI, Aadhaar
- Academic: Registration no., roll no., branch, admission year
- Address: Full address, post office, police station, block, district, state, pin
- Platform: Username, GitHub handle, profile picture

**Business Rules:**
- Incomplete profiles have restricted access
- Admins can manually mark completion
- Profile changes logged for audit

---

### 6.3 Attendance Management System

**Priority:** P0 (Critical)

**Description:**  
Automated attendance system using time-limited QR codes with manual fallback.

**Features:**
- **Session Management**
  - Create attendance sessions with title and date
  - Sequential session numbering
  - Track session statistics
  
- **QR Code System**
  - Generate unique QR codes per session
  - 5-minute auto-expiry
  - Real-time countdown timer
  - Scan count tracking
  - Manual deactivation
  
- **Student Interface**
  - Camera-based QR scanner
  - Live camera preview
  - Instant attendance confirmation
  - Attendance history view
  
- **Manual Marking**
  - Admin can manually mark present/absent
  - Bulk import from CSV
  
- **Reporting**
  - Attendance percentage per student
  - Session-wise reports
  - Export capabilities

**Technical Specs:**
- QR token: Unique CUID with session ID embedded
- Expiry: 5 minutes from generation
- Storage: AttendanceQR and Attendance tables
- Points: Configurable per session

**Security:**
- Token validated server-side
- Duplicate scan prevention
- Expired QR rejection
- Rate limiting on scan endpoint

---

### 6.4 Coding Platform (Convex-based)

**Priority:** P1 (High)

**Description:**  
LeetCode-style competitive programming platform with real-time code execution.

**Features:**
- **Problem Management**
  - Create/edit problems with difficulty levels
  - Rich markdown descriptions
  - Multiple examples with explanations
  - Test cases (visible and hidden)
  - Starter code templates for 8+ languages
  
- **Code Editor**
  - Monaco Editor integration
  - Syntax highlighting
  - Auto-completion
  - Theme support (light/dark)
  - Emmet support
  
- **Code Execution**
  - Support for C, C++, Java, Python, JavaScript, TypeScript, C#
  - Run against sample test cases
  - Submit for full evaluation
  - Real-time execution feedback
  
- **Submission Tracking**
  - Status: Accepted, Wrong Answer, TLE, Runtime Error, Compilation Error
  - Runtime and memory statistics
  - Test cases passed vs. total
  - Submission history per user
  
- **Problem Discovery**
  - Filter by difficulty
  - Search by tags (Array, DP, Graph, etc.)
  - Sort by acceptance rate
  - Track solved problems

**Technical Stack:**
- **Frontend:** Monaco Editor for code editing
- **Backend:** Convex for real-time data sync
- **Execution:** Code execution service API
- **Storage:** Convex database for problems and submissions

**Data Models:**
- Problems: Title, slug, difficulty, description, test cases, starter code
- Submissions: Problem ID, user ID, code, status, runtime, memory
- User Progress: Solved problems, success rate, language preferences

---

### 6.5 Quiz System

**Priority:** P1 (High)

**Description:**  
Secure multi-set quiz platform with proctoring features and automatic grading.

**Features:**
- **Quiz Creation**
  - Create quizzes with 1-8 different sets
  - Set duration (minutes)
  - Configure points per question
  - Schedule with start/end date-time
  - Add MCQ questions with correct answers
  
- **Set Assignment**
  - Random assignment of sets to students
  - Ensure fair distribution
  - Store assignments for reference
  
- **Quiz Taking**
  - Fullscreen enforcement
  - Tab-switch detection
  - Countdown timer
  - One-question-at-a-time view
  - Auto-save answers
  - Warning system (3 strikes)
  
- **Proctoring & Security**
  - Fullscreen exit detection
  - Tab/window switch detection
  - Violation logging
  - Auto-block after 3 violations
  - Submission timestamp tracking
  
- **Results & Analytics**
  - Immediate score display
  - Correct/incorrect breakdown
  - Points awarded calculation
  - Set-wise performance analysis
  - Export results to CSV
  
- **Admin Dashboard**
  - View all attempts
  - Monitor live quiz sessions
  - Manually review flagged attempts
  - Unblock users if needed
  - Generate reports

**Business Rules:**
- Students get only one attempt per quiz
- Violations logged with type and timestamp
- 3 violations = auto-block and submission
- Blocked students cannot retake
- Points awarded only on completion

---

### 6.6 Task & Event Management

**Priority:** P1 (High)

**Description:**  
System for creating, assigning, and evaluating tasks and event participations with point rewards.

**Task Features:**
- Create tasks with title, description, due date
- Set point value for completion
- Accept submissions (URLs, screenshots)
- Approve/reject with feedback
- Track submission status
- Leaderboard integration

**Event Features:**
- Create events with date and point value
- Track participations
- Approve/reject participations
- Award points for attendance
- Event-wise reports

**Workflow:**
1. Admin creates task/event
2. Students submit/participate
3. Admin reviews and evaluates
4. Points awarded on approval
5. Reflected in leaderboard

---

### 6.7 Announcement System

**Priority:** P1 (High)

**Description:**  
Multi-channel announcement system with rich media support and targeted broadcasting.

**Features:**
- **Content Creation**
  - Rich text editor (TipTap)
  - Image uploads (multiple)
  - PDF attachments
  - YouTube embed support
  
- **Categorization**
  - Categories: Emergency, General, Event Update, Workshop, Logistics
  - Priority: Normal, Important, Urgent
  
- **Targeting**
  - Audiences: Public, Participants Only, Volunteers, Organizers
  - Branch-specific filtering
  - Year-specific filtering
  
- **Scheduling**
  - Publish date
  - Auto-expiry date
  - Recurring announcements (hourly, daily, weekly)
  
- **Display Options**
  - Pin to top
  - Show in home banner
  - Send notifications (email/push)
  
- **Management**
  - Soft delete
  - Edit existing announcements
  - View analytics (views, clicks)

---

### 6.8 Project Showcase

**Priority:** P2 (Medium)

**Description:**  
Platform for students to submit projects for review and public showcase.

**Features:**
- **Project Submission**
  - GitHub repository integration
  - Project description and tech stack
  - Thumbnail upload
  - Live project URL
  
- **Review Types**
  - Code Review: Get feedback on code quality
  - Collaboration: Find teammates
  - Publish: Request to showcase publicly
  
- **Admin Review**
  - Review submissions
  - Provide detailed feedback
  - Approve for public showcase
  
- **Public Showcase**
  - Gallery view of published projects
  - Filter by tech stack
  - Search functionality
  - GitHub stars integration

---

### 6.9 Resource Library

**Priority:** P2 (Medium)

**Description:**  
Organized repository of learning materials with folder structure and filtering.

**Features:**
- **Folder Management**
  - Create folders with icons
  - Set display order
  - Activate/deactivate folders
  
- **Resource Types**
  - PDF documents
  - Video links (YouTube, Drive)
  - Images and diagrams
  - External links
  
- **Metadata**
  - Title and description
  - Tags for filtering
  - File size display
  - Video duration
  
- **Access Control**
  - Downloadable toggle
  - Member-only resources
  - Public resources
  
- **User Experience**
  - Search by title/tags
  - Filter by type
  - Preview for videos
  - Thumbnail support

---

### 6.10 Leaderboard & Points System

**Priority:** P1 (High)

**Description:**  
Gamification system with points tracking and competitive leaderboards.

**Point Sources:**
- Attendance: Points per session
- Quizzes: Points per correct answer
- Tasks: Points on approval
- Events: Points for participation
- Coding Problems: Points on acceptance

**Leaderboard Features:**
- Global rankings
- Filter by branch
- Filter by admission year
- Time-based (monthly, all-time)
- Points breakdown by category
- Activity timeline

**User Profile:**
- Total points
- Rank display
- Points history
- Achievement badges
- Activity graph

---

### 6.11 Support System

**Priority:** P2 (Medium)

**Description:**  
Internal support ticket system for member queries and issues.

**Features:**
- Create tickets with priority
- File attachments
- Admin responses
- Internal notes
- Status tracking (Open, In Progress, Resolved, Closed)
- Email notifications

---

### 6.12 Analytics & Reporting

**Priority:** P2 (Medium)

**Description:**  
Comprehensive analytics dashboard for data-driven decision making.

**Metrics:**
- Member growth over time
- Attendance trends
- Quiz participation rates
- Task completion rates
- Active vs. inactive members
- Points distribution
- Engagement heatmaps

**Reports:**
- Member export (CSV, PDF)
- Attendance reports
- Quiz results
- Task submissions
- Event participation
- Custom date ranges

---

### 6.13 External API

**Priority:** P2 (Medium)

**Description:**  
RESTful API for external applications to access platform data.

**Features:**
- API key authentication
- Rate limiting (50-100 req/hour)
- Pagination support
- Resource endpoints (users, quizzes, tasks, events, etc.)
- Advanced filtering
- Relation loading
- Type-safe TypeScript client

**Security:**
- Bearer token authentication
- API key rotation
- Request logging
- IP whitelisting option

---

## 7. Non-Functional Requirements

### 7.1 Performance

**Response Time:**
- Page loads: < 2 seconds
- API responses: < 500ms
- Code execution: < 5 seconds
- Search results: < 1 second

**Scalability:**
- Support 10,000+ concurrent users
- Handle 1M+ submissions per month
- Store 100GB+ of user data

**Optimization:**
- Server-side rendering (Next.js)
- Image optimization (WebP, AVIF)
- Code splitting and lazy loading
- CDN for static assets

### 7.2 Security

**Authentication:**
- Secure session management
- JWT token validation
- OAuth 2.0 implementation
- Rate limiting on auth endpoints

**Data Protection:**
- HTTPS only
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens
- File upload validation
- S3 presigned URLs

**Compliance:**
- GDPR considerations for user data
- Data encryption at rest
- Secure file storage (AWS S3)
- Audit logs for admin actions

### 7.3 Reliability

**Uptime:**
- 99.9% availability
- Automated health checks
- Error monitoring (Sentry/similar)

**Backup:**
- Daily database backups
- 30-day retention
- Point-in-time recovery

**Error Handling:**
- Graceful degradation
- User-friendly error messages
- Automatic retry mechanisms

### 7.4 Usability

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios

**Responsiveness:**
- Mobile-first design
- Support for 320px to 4K screens
- Touch-friendly interfaces
- Progressive Web App (PWA) ready

**Localization:**
- English as primary language
- Date/time formatting
- Number formatting

### 7.5 Maintainability

**Code Quality:**
- TypeScript for type safety
- ESLint for code standards
- Prettier for formatting
- Component documentation

**Testing:**
- Unit tests for critical functions
- Integration tests for APIs
- E2E tests for critical flows

**Monitoring:**
- Application performance monitoring
- Error tracking and alerts
- User analytics
- Server metrics

---

## 8. Technical Constraints

### 8.1 Technology Stack

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS + shadcn/ui
- Monaco Editor
- Framer Motion

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL database
- Convex (real-time data)

**Authentication:**
- Better Auth library
- OAuth providers (GitHub, Google, Discord)
- Email OTP

**File Storage:**
- AWS S3
- Presigned URLs for uploads

**Deployment:**
- Vercel (hosting)
- AWS RDS (database)
- Cloudflare (CDN)

### 8.2 Infrastructure

**Database:**
- PostgreSQL 14+
- Connection pooling
- Read replicas for scaling

**Caching:**
- Redis for session storage
- CDN caching for static assets

**Email:**
- Nodemailer with SMTP
- Email templates

### 8.3 Third-Party Dependencies

- Arcjet (rate limiting, security)
- Convex (real-time database)
- AWS SDK (S3 operations)
- QRCode library (attendance)
- jsPDF (PDF generation)
- Monaco Editor (code editing)

---

## 9. Success Metrics

### 9.1 Adoption Metrics

- **Member Registrations:** 1,000+ in first 6 months
- **Profile Completion Rate:** > 85%
- **Daily Active Users (DAU):** > 200
- **Monthly Active Users (MAU):** > 800

### 9.2 Engagement Metrics

- **Average Session Duration:** > 15 minutes
- **Quiz Participation Rate:** > 60%
- **Task Submission Rate:** > 70%
- **Code Problem Attempts:** > 5,000/month
- **Attendance Scan Usage:** > 80% vs. manual

### 9.3 Quality Metrics

- **System Uptime:** > 99.9%
- **Page Load Time:** < 2 seconds
- **Error Rate:** < 0.1%
- **User Satisfaction:** > 4.5/5

### 9.4 Business Metrics

- **Admin Time Saved:** 70% reduction
- **Attendance Processing Time:** 90% reduction
- **Support Ticket Response Time:** < 24 hours
- **Data Export Requests:** Handled automatically

---

## 10. Release Planning

### Phase 1: MVP (Months 1-2)
**Status:** ✅ Complete

**Features:**
- Authentication system
- Basic member management
- Manual attendance
- Simple announcements
- Admin dashboard

### Phase 2: Core Features (Months 3-4)
**Status:** ✅ Complete

**Features:**
- QR-based attendance
- Quiz system with proctoring
- Task management
- Event participation
- Points system

### Phase 3: Advanced Features (Months 5-6)
**Status:** ✅ Complete

**Features:**
- Coding platform (Convex)
- Project showcase
- Resource library
- Advanced analytics
- External API

### Phase 4: Optimization (Months 7-8)
**Status:** 🔄 In Progress

**Features:**
- Performance optimization
- Mobile app (optional)
- Advanced reporting
- AI-powered features
- Integration marketplace

---

## 11. Risks & Mitigations

### 11.1 Technical Risks

**Risk:** Database performance degradation with scale  
**Impact:** High  
**Likelihood:** Medium  
**Mitigation:**
- Implement database indexing
- Use read replicas
- Query optimization
- Connection pooling

**Risk:** Code execution security vulnerabilities  
**Impact:** Critical  
**Likelihood:** Medium  
**Mitigation:**
- Sandboxed execution environment
- Input validation
- Resource limits (CPU, memory, time)
- Regular security audits

**Risk:** Third-party service downtime (Convex, S3)  
**Impact:** Medium  
**Likelihood:** Low  
**Mitigation:**
- Implement fallback mechanisms
- Cache critical data
- Multi-region deployment
- SLA agreements

### 11.2 Business Risks

**Risk:** Low user adoption  
**Impact:** High  
**Likelihood:** Medium  
**Mitigation:**
- User onboarding program
- Training sessions
- Feedback collection
- Continuous improvements

**Risk:** Data privacy concerns  
**Impact:** High  
**Likelihood:** Low  
**Mitigation:**
- Clear privacy policy
- GDPR compliance
- User consent management
- Data encryption

### 11.3 Operational Risks

**Risk:** Insufficient admin training  
**Impact:** Medium  
**Likelihood:** Medium  
**Mitigation:**
- Comprehensive documentation
- Video tutorials
- Live training sessions
- Admin support channel

**Risk:** Peak load during quiz/event times  
**Impact:** Medium  
**Likelihood:** High  
**Mitigation:**
- Auto-scaling infrastructure
- Load testing
- Queue management
- Rate limiting

---

## Appendices

### Glossary

- **CUID:** Collision-resistant Unique Identifier
- **OAuth:** Open Authorization protocol
- **OTP:** One-Time Password
- **S3:** Amazon Simple Storage Service
- **QR:** Quick Response (code)
- **TLE:** Time Limit Exceeded
- **MCQ:** Multiple Choice Question

### References

- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- Better Auth Documentation: https://better-auth.com
- Convex Documentation: https://docs.convex.dev

### Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 17, 2026 | Product Team | Initial PRD creation |

---

**Document Status:** ✅ Approved  
**Next Review Date:** April 17, 2026
