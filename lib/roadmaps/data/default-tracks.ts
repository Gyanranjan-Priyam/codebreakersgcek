/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RoadmapData } from "../types";
import { getAutoLayoutedElements } from "../layout";

const RAW_ROADMAPS: RoadmapData[] = [
  /* ══════════════════════════════════════════════════════════════════════════
     1. BACKEND DEVELOPER TRACK (roadmap.sh/backend)
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "backend-developer",
    slug: "backend-developer",
    title: "Backend Developer",
    description: "Step-by-step roadmap to becoming a modern backend developer in 2026. Covers Internet, Languages, Databases, APIs, Caching, Security, Architecture, and Scaling.",
    category: "systems",
    badgeText: "Recommended",
    iconName: "Server",
    version: 1,
    isPublished: true,
    nodes: [
      {
        id: "title-node",
        type: "title",
        position: { x: 550, y: 30 },
        data: { label: "Backend Developer Roadmap" },
      },
      // 1. Internet Basics
      {
        id: "internet-basics",
        type: "topic",
        position: { x: 550, y: 120 },
        data: {
          label: "Internet & Networking",
          category: "Fundamentals",
          description: "How the web works, HTTP/HTTPS methods, status codes, DNS lookup, IP addressing, TCP/UDP sockets, and domain registration.",
          difficulty: "beginner",
          colorKey: "B",
          estimatedHours: 6,
          resources: [
            { id: "b1", title: "MDN: How does the Internet work?", url: "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work", type: "docs", isOfficial: true },
            { id: "b2", title: "HTTP Crash Course & Status Codes", url: "https://youtube.com/watch?v=iYM2zFP3Zn0", type: "video" },
          ],
        },
      },
      { id: "sub-http", type: "subtopic", position: { x: 860, y: 100 }, data: { label: "HTTP / HTTPS & SSL/TLS", colorKey: "C" } },
      { id: "sub-dns", type: "subtopic", position: { x: 860, y: 150 }, data: { label: "DNS & IP Addressing", colorKey: "C" } },
      { id: "sub-sockets", type: "subtopic", position: { x: 860, y: 200 }, data: { label: "TCP/IP & WebSockets", colorKey: "C" } },

      // 2. Pick a Language
      {
        id: "backend-language",
        type: "topic",
        position: { x: 550, y: 320 },
        data: {
          label: "Pick a Backend Language",
          category: "Core Language",
          description: "Choose a primary server-side language and master memory models, async concurrency, data structures, and standard libraries.",
          difficulty: "beginner",
          colorKey: "B",
          estimatedHours: 30,
          resources: [
            { id: "b3", title: "Node.js Official Documentation", url: "https://nodejs.org/en/docs", type: "docs", isOfficial: true },
            { id: "b4", title: "Go Programming Language Tour", url: "https://go.dev/tour", type: "docs", isOfficial: true },
            { id: "b5", title: "Python Real Python Tutorials", url: "https://realpython.com", type: "article" },
          ],
        },
      },
      { id: "sub-node", type: "subtopic", position: { x: 240, y: 280 }, data: { label: "Node.js & TypeScript", colorKey: "C" } },
      { id: "sub-python", type: "subtopic", position: { x: 240, y: 330 }, data: { label: "Python (FastAPI / Django)", colorKey: "C" } },
      { id: "sub-go", type: "subtopic", position: { x: 860, y: 280 }, data: { label: "Golang (Go)", colorKey: "C" } },
      { id: "sub-java", type: "subtopic", position: { x: 860, y: 330 }, data: { label: "Java / Kotlin (Spring Boot)", colorKey: "C" } },
      { id: "sub-rust", type: "subtopic", position: { x: 860, y: 380 }, data: { label: "Rust (Actix / Axum)", colorKey: "C" } },

      // 3. Version Control
      {
        id: "git-vcs",
        type: "topic",
        position: { x: 550, y: 520 },
        data: {
          label: "Version Control (Git & GitHub)",
          category: "Tooling",
          description: "Git fundamentals, branch management, merge conflict resolution, pull requests, semantic commit conventions, and GitHub Actions.",
          difficulty: "beginner",
          colorKey: "B",
          estimatedHours: 6,
          resources: [
            { id: "b6", title: "Pro Git Official Book", url: "https://git-scm.com/book/en/v2", type: "docs", isOfficial: true },
          ],
        },
      },
      { id: "sub-branching", type: "subtopic", position: { x: 240, y: 500 }, data: { label: "Branching Workflows (Trunk vs GitFlow)", colorKey: "C" } },
      { id: "sub-github", type: "subtopic", position: { x: 240, y: 550 }, data: { label: "GitHub Collaboration & Actions", colorKey: "C" } },

      // 4. Relational Databases
      {
        id: "relational-dbs",
        type: "topic",
        position: { x: 550, y: 700 },
        data: {
          label: "Relational Databases (SQL)",
          category: "Databases",
          description: "Schema design, Normalization (1NF-3NF), B-Tree indexing, complex JOINs, ACID transactions, and query optimization.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 20,
          resources: [
            { id: "b7", title: "PostgreSQL Official Documentation", url: "https://www.postgresql.org/docs/", type: "docs", isOfficial: true },
            { id: "b8", title: "Use The Index, Luke! SQL Guide", url: "https://use-the-index-luke.com/", type: "article" },
          ],
        },
      },
      { id: "sub-postgres", type: "subtopic", position: { x: 860, y: 660 }, data: { label: "PostgreSQL", colorKey: "C" } },
      { id: "sub-mysql", type: "subtopic", position: { x: 860, y: 710 }, data: { label: "MySQL / MariaDB", colorKey: "C" } },
      { id: "sub-indexing", type: "subtopic", position: { x: 860, y: 760 }, data: { label: "Indexing & Query Plans (EXPLAIN)", colorKey: "C" } },
      { id: "sub-acid", type: "subtopic", position: { x: 860, y: 810 }, data: { label: "ACID & Transactions", colorKey: "C" } },

      // 5. NoSQL Databases
      {
        id: "nosql-dbs",
        type: "topic",
        position: { x: 550, y: 920 },
        data: {
          label: "NoSQL Databases",
          category: "Databases",
          description: "Document stores, Key-Value stores, Wide-Column, Graph databases, and CAP Theorem tradeoffs.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 15,
          resources: [
            { id: "b9", title: "Redis University & Docs", url: "https://redis.io/docs", type: "docs", isOfficial: true },
            { id: "b10", title: "MongoDB University", url: "https://learn.mongodb.com", type: "course" },
          ],
        },
      },
      { id: "sub-redis", type: "subtopic", position: { x: 240, y: 890 }, data: { label: "Redis (In-Memory Key-Value)", colorKey: "C" } },
      { id: "sub-mongo", type: "subtopic", position: { x: 240, y: 940 }, data: { label: "MongoDB (Document Store)", colorKey: "C" } },
      { id: "sub-cassandra", type: "subtopic", position: { x: 240, y: 990 }, data: { label: "Cassandra / DynamoDB", colorKey: "C" } },

      // 6. ORMs & Database Access
      {
        id: "orms-query-builders",
        type: "topic",
        position: { x: 550, y: 1100 },
        data: {
          label: "ORMs & Query Builders",
          category: "Databases",
          description: "Type-safe database query layers, migrations, connection pooling, and avoiding N+1 query traps.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 10,
          resources: [
            { id: "b11", title: "Prisma ORM Guides", url: "https://www.prisma.io/docs", type: "docs", isOfficial: true },
            { id: "b12", title: "Drizzle ORM Documentation", url: "https://orm.drizzle.team/docs/overview", type: "docs" },
          ],
        },
      },
      { id: "sub-prisma", type: "subtopic", position: { x: 860, y: 1080 }, data: { label: "Prisma & Drizzle ORM", colorKey: "C" } },
      { id: "sub-migrations", type: "subtopic", position: { x: 860, y: 1130 }, data: { label: "Database Migrations & Seeding", colorKey: "C" } },

      // 7. APIs & Protocols
      {
        id: "api-protocols",
        type: "topic",
        position: { x: 550, y: 1280 },
        data: {
          label: "APIs & Web Services",
          category: "APIs",
          description: "RESTful architecture, GraphQL schemas & resolvers, gRPC Protocol Buffers, and Server-Sent Events / WebSockets.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 18,
          resources: [
            { id: "b13", title: "RESTful API Design Best Practices", url: "https://restfulapi.net", type: "article" },
            { id: "b14", title: "GraphQL Official Tutorial", url: "https://graphql.org/learn/", type: "docs", isOfficial: true },
          ],
        },
      },
      { id: "sub-rest", type: "subtopic", position: { x: 240, y: 1240 }, data: { label: "REST APIs & OpenAPI / Swagger", colorKey: "C" } },
      { id: "sub-graphql", type: "subtopic", position: { x: 240, y: 1290 }, data: { label: "GraphQL (Apollo / Yoga)", colorKey: "C" } },
      { id: "sub-grpc", type: "subtopic", position: { x: 240, y: 1340 }, data: { label: "gRPC & Protocol Buffers", colorKey: "C" } },

      // 8. Authentication & Security
      {
        id: "auth-security",
        type: "topic",
        position: { x: 550, y: 1480 },
        data: {
          label: "Authentication & Security",
          category: "Security",
          description: "JSON Web Tokens (JWT), OAuth 2.0 / OpenID Connect, Session cookies, password hashing (Argon2/bcrypt), CORS, Rate Limiting, and OWASP Top 10.",
          difficulty: "advanced",
          colorKey: "B",
          estimatedHours: 20,
          resources: [
            { id: "b15", title: "OWASP Top Ten Security Vulnerabilities", url: "https://owasp.org/www-project-top-ten/", type: "article", isOfficial: true },
            { id: "b16", title: "Auth0: OAuth 2.0 and OpenID Connect Guide", url: "https://auth0.com/intro-to-iam/what-is-oauth-2", type: "docs" },
          ],
        },
      },
      { id: "sub-jwt", type: "subtopic", position: { x: 860, y: 1440 }, data: { label: "JWT & Cookie Sessions", colorKey: "C" } },
      { id: "sub-oauth", type: "subtopic", position: { x: 860, y: 1490 }, data: { label: "OAuth 2.0 & SSO", colorKey: "C" } },
      { id: "sub-owasp", type: "subtopic", position: { x: 860, y: 1540 }, data: { label: "OWASP Top 10 & Sanitization", colorKey: "C" } },

      // 9. Caching
      {
        id: "caching-strategies",
        type: "topic",
        position: { x: 550, y: 1680 },
        data: {
          label: "Caching Strategies",
          category: "Performance",
          description: "Cache-Aside, Write-Through, Write-Behind, Cache Eviction policies (LRU/LFU), and CDN edge caching.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 12,
          resources: [
            { id: "b17", title: "AWS Caching Best Practices Overview", url: "https://aws.amazon.com/caching/best-practices/", type: "article" },
          ],
        },
      },
      { id: "sub-redis-cache", type: "subtopic", position: { x: 240, y: 1650 }, data: { label: "Redis Caching & Key Expiration", colorKey: "C" } },
      { id: "sub-cdn", type: "subtopic", position: { x: 240, y: 1700 }, data: { label: "CDN Caching (Cloudflare / CloudFront)", colorKey: "C" } },

      // 10. Message Brokers & Asynchronous Processing
      {
        id: "message-brokers",
        type: "topic",
        position: { x: 550, y: 1860 },
        data: {
          label: "Message Brokers & Queues",
          category: "Architecture",
          description: "Event-driven architecture, Pub/Sub patterns, message persistence, background worker job queues, and dead-letter queues.",
          difficulty: "advanced",
          colorKey: "B",
          estimatedHours: 18,
          resources: [
            { id: "b18", title: "Apache Kafka Quickstart", url: "https://kafka.apache.org/documentation/", type: "docs", isOfficial: true },
            { id: "b19", title: "RabbitMQ Tutorials", url: "https://www.rabbitmq.com/tutorials", type: "docs" },
          ],
        },
      },
      { id: "sub-kafka", type: "subtopic", position: { x: 860, y: 1820 }, data: { label: "Apache Kafka (Event Streaming)", colorKey: "C" } },
      { id: "sub-rabbitmq", type: "subtopic", position: { x: 860, y: 1870 }, data: { label: "RabbitMQ & BullMQ (Task Queues)", colorKey: "C" } },

      // 11. Testing & Code Quality
      {
        id: "backend-testing",
        type: "topic",
        position: { x: 550, y: 2040 },
        data: {
          label: "Testing & Code Quality",
          category: "Quality",
          description: "Unit testing, integration testing with testcontainers, API mock services, contract testing, and code coverage.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 14,
          resources: [
            { id: "b20", title: "Martin Fowler: The Practical Test Pyramid", url: "https://martinfowler.com/articles/practical-test-pyramid.html", type: "article" },
          ],
        },
      },
      { id: "sub-unit-tests", type: "subtopic", position: { x: 240, y: 2010 }, data: { label: "Unit & Integration Tests", colorKey: "C" } },
      { id: "sub-testcontainers", type: "subtopic", position: { x: 240, y: 2060 }, data: { label: "Testcontainers & Mocking", colorKey: "C" } },

      // 12. CI/CD & Containerization
      {
        id: "containers-cicd",
        type: "topic",
        position: { x: 550, y: 2220 },
        data: {
          label: "Docker & CI/CD Pipelines",
          category: "DevOps",
          description: "Docker multi-stage builds, container optimization, environment variables, GitHub Actions workflows, and automated deployments.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 16,
          resources: [
            { id: "b21", title: "Docker Getting Started Guide", url: "https://docs.docker.com/get-started/", type: "docs", isOfficial: true },
          ],
        },
      },
      { id: "sub-docker", type: "subtopic", position: { x: 860, y: 2190 }, data: { label: "Docker Multi-stage Builds", colorKey: "C" } },
      { id: "sub-cicd", type: "subtopic", position: { x: 860, y: 2240 }, data: { label: "GitHub Actions CI/CD", colorKey: "C" } },

      // 13. System Design & Scaling
      {
        id: "system-design-scale",
        type: "topic",
        position: { x: 550, y: 2400 },
        data: {
          label: "System Design & Building for Scale",
          category: "Architecture",
          description: "Monolithic to Microservices breakdown, horizontal vs vertical scaling, Load Balancing (Nginx/HAProxy), Sharding, and Distributed Tracing.",
          difficulty: "advanced",
          colorKey: "B",
          estimatedHours: 35,
          resources: [
            { id: "b22", title: "System Design Primer by Donne Martin", url: "https://github.com/donnemartin/system-design-primer", type: "article", isOfficial: true },
          ],
        },
      },
      { id: "sub-microservices", type: "subtopic", position: { x: 240, y: 2360 }, data: { label: "Microservices & gRPC", colorKey: "C" } },
      { id: "sub-load-balancer", type: "subtopic", position: { x: 240, y: 2410 }, data: { label: "Load Balancers & Reverse Proxies", colorKey: "C" } },
      { id: "sub-sharding", type: "subtopic", position: { x: 240, y: 2460 }, data: { label: "Database Sharding & Replication", colorKey: "C" } },

      // 14. Milestone Completion
      {
        id: "milestone-backend-cert",
        type: "milestone",
        position: { x: 550, y: 2600 },
        data: {
          label: "Certified Backend Architect",
          category: "Milestone",
          description: "Congratulations! You have mastered backend systems architecture from core network protocols to resilient enterprise microservices.",
          difficulty: "advanced",
          color: "gold",
          status: "not-started",
        },
      },
    ],
    edges: [
      // Spine connections (downwards)
      { id: "e-sp-1", source: "internet-basics", target: "backend-language", type: "interactive" },
      { id: "e-sp-2", source: "backend-language", target: "git-vcs", type: "interactive" },
      { id: "e-sp-3", source: "git-vcs", target: "relational-dbs", type: "interactive" },
      { id: "e-sp-4", source: "relational-dbs", target: "nosql-dbs", type: "interactive" },
      { id: "e-sp-5", source: "nosql-dbs", target: "orms-query-builders", type: "interactive" },
      { id: "e-sp-6", source: "orms-query-builders", target: "api-protocols", type: "interactive" },
      { id: "e-sp-7", source: "api-protocols", target: "auth-security", type: "interactive" },
      { id: "e-sp-8", source: "auth-security", target: "caching-strategies", type: "interactive" },
      { id: "e-sp-9", source: "caching-strategies", target: "message-brokers", type: "interactive" },
      { id: "e-sp-10", source: "message-brokers", target: "backend-testing", type: "interactive" },
      { id: "e-sp-11", source: "backend-testing", target: "containers-cicd", type: "interactive" },
      { id: "e-sp-12", source: "containers-cicd", target: "system-design-scale", type: "interactive" },
      { id: "e-sp-13", source: "system-design-scale", target: "milestone-backend-cert", type: "interactive" },

      // Subtopics to parents
      { id: "eb-1", source: "internet-basics", target: "sub-http" },
      { id: "eb-2", source: "internet-basics", target: "sub-dns" },
      { id: "eb-3", source: "internet-basics", target: "sub-sockets" },

      { id: "eb-4", source: "backend-language", target: "sub-node" },
      { id: "eb-5", source: "backend-language", target: "sub-python" },
      { id: "eb-6", source: "backend-language", target: "sub-go" },
      { id: "eb-7", source: "backend-language", target: "sub-java" },
      { id: "eb-8", source: "backend-language", target: "sub-rust" },

      { id: "eb-9", source: "git-vcs", target: "sub-branching" },
      { id: "eb-10", source: "git-vcs", target: "sub-github" },

      { id: "eb-11", source: "relational-dbs", target: "sub-postgres" },
      { id: "eb-12", source: "relational-dbs", target: "sub-mysql" },
      { id: "eb-13", source: "relational-dbs", target: "sub-indexing" },
      { id: "eb-14", source: "relational-dbs", target: "sub-acid" },

      { id: "eb-15", source: "nosql-dbs", target: "sub-redis" },
      { id: "eb-16", source: "nosql-dbs", target: "sub-mongo" },
      { id: "eb-17", source: "nosql-dbs", target: "sub-cassandra" },

      { id: "eb-18", source: "orms-query-builders", target: "sub-prisma" },
      { id: "eb-19", source: "orms-query-builders", target: "sub-migrations" },

      { id: "eb-20", source: "api-protocols", target: "sub-rest" },
      { id: "eb-21", source: "api-protocols", target: "sub-graphql" },
      { id: "eb-22", source: "api-protocols", target: "sub-grpc" },

      { id: "eb-23", source: "auth-security", target: "sub-jwt" },
      { id: "eb-24", source: "auth-security", target: "sub-oauth" },
      { id: "eb-25", source: "auth-security", target: "sub-owasp" },

      { id: "eb-26", source: "caching-strategies", target: "sub-redis-cache" },
      { id: "eb-27", source: "caching-strategies", target: "sub-cdn" },

      { id: "eb-28", source: "message-brokers", target: "sub-kafka" },
      { id: "eb-29", source: "message-brokers", target: "sub-rabbitmq" },

      { id: "eb-30", source: "backend-testing", target: "sub-unit-tests" },
      { id: "eb-31", source: "backend-testing", target: "sub-testcontainers" },

      { id: "eb-32", source: "containers-cicd", target: "sub-docker" },
      { id: "eb-33", source: "containers-cicd", target: "sub-cicd" },

      { id: "eb-34", source: "system-design-scale", target: "sub-microservices" },
      { id: "eb-35", source: "system-design-scale", target: "sub-load-balancer" },
      { id: "eb-36", source: "system-design-scale", target: "sub-sharding" },
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════════
     2. FRONTEND DEVELOPER TRACK
  ══════════════════════════════════════════════════════════════════════════ */
  {
    id: "frontend-developer",
    slug: "frontend-developer",
    title: "Frontend Developer",
    description: "Step-by-step path to master modern web frontend engineering from HTML/CSS to React 19, Next.js, and web performance.",
    category: "web-dev",
    badgeText: "Most Popular",
    iconName: "Layout",
    version: 1,
    isPublished: true,
    nodes: [
      {
        id: "title-node",
        type: "title",
        position: { x: 550, y: 30 },
        data: { label: "Frontend Developer Roadmap" },
      },
      // 1. Internet
      {
        id: "internet-basics",
        type: "topic",
        position: { x: 550, y: 120 },
        data: {
          label: "Internet Fundamentals",
          category: "Fundamentals",
          description: "Understand HTTP/HTTPS, DNS, Browsers, Domain names, and client-server architectures.",
          difficulty: "beginner",
          colorKey: "B",
          estimatedHours: 4,
          resources: [
            { id: "r1", title: "MDN: How the Web Works", url: "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work", type: "docs", isOfficial: true },
            { id: "r2", title: "CS50: Internet & Networking", url: "https://youtube.com/watch?v=zN8HWvt1eI0", type: "video" },
          ],
        },
      },
      { id: "sub-http", type: "subtopic", position: { x: 860, y: 100 }, data: { label: "HTTP / HTTPS & SSL", colorKey: "C" } },
      { id: "sub-dns", type: "subtopic", position: { x: 860, y: 150 }, data: { label: "DNS & Domain Names", colorKey: "C" } },
      { id: "sub-browsers", type: "subtopic", position: { x: 860, y: 200 }, data: { label: "Browsers & Rendering Engine", colorKey: "C" } },

      // 2. HTML & CSS
      {
        id: "html-css",
        type: "topic",
        position: { x: 550, y: 300 },
        data: {
          label: "HTML5 & Modern CSS",
          category: "Fundamentals",
          description: "Semantic HTML elements, Flexbox, Grid, Responsive Design, CSS Variables, and accessibility (a11y).",
          difficulty: "beginner",
          colorKey: "B",
          estimatedHours: 12,
          resources: [
            { id: "r3", title: "MDN HTML & CSS Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "docs", isOfficial: true },
            { id: "r4", title: "CSS Flexbox & Grid Crash Course", url: "https://youtube.com/watch?v=fYq5PXgSsbE", type: "video" },
          ],
        },
      },
      { id: "sub-semantic", type: "subtopic", position: { x: 240, y: 280 }, data: { label: "Semantic HTML Elements", colorKey: "C" } },
      { id: "sub-flex-grid", type: "subtopic", position: { x: 240, y: 330 }, data: { label: "Flexbox & CSS Grid", colorKey: "C" } },
      { id: "sub-responsive", type: "subtopic", position: { x: 240, y: 380 }, data: { label: "Responsive Design & Media Queries", colorKey: "C" } },

      // 3. JavaScript
      {
        id: "javascript-deep-dive",
        type: "topic",
        position: { x: 550, y: 480 },
        data: {
          label: "JavaScript Deep Dive",
          category: "Core Language",
          description: "Closures, Event Loop, Promises, Async/Await, Prototypes, DOM Manipulation, and Fetch API.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 20,
          resources: [
            { id: "r5", title: "JavaScript.info Modern Tutorial", url: "https://javascript.info", type: "article", isOfficial: true },
            { id: "r6", title: "What the heck is the event loop anyway?", url: "https://youtube.com/watch?v=8aGhZQkoFbQ", type: "video" },
          ],
        },
      },
      { id: "sub-async", type: "subtopic", position: { x: 860, y: 460 }, data: { label: "Promises & Async/Await", colorKey: "C" } },
      { id: "sub-dom", type: "subtopic", position: { x: 860, y: 510 }, data: { label: "DOM & Event Listeners", colorKey: "C" } },
      { id: "sub-event-loop", type: "subtopic", position: { x: 860, y: 560 }, data: { label: "Event Loop & Execution Context", colorKey: "C" } },

      // 4. Version Control
      {
        id: "git-version-control",
        type: "topic",
        position: { x: 550, y: 660 },
        data: {
          label: "Version Control (Git)",
          category: "Tooling",
          description: "Branching strategies, Pull requests, Merge vs Rebase, Git Stash, and GitHub Actions CI.",
          difficulty: "beginner",
          colorKey: "B",
          estimatedHours: 6,
          resources: [
            { id: "r8", title: "Git Pro Book", url: "https://git-scm.com/book/en/v2", type: "docs", isOfficial: true },
          ],
        },
      },
      { id: "sub-git-branches", type: "subtopic", position: { x: 240, y: 640 }, data: { label: "Branching & Merging", colorKey: "C" } },
      { id: "sub-github-prs", type: "subtopic", position: { x: 240, y: 690 }, data: { label: "GitHub PRs & Code Review", colorKey: "C" } },

      // 5. TypeScript
      {
        id: "typescript",
        type: "topic",
        position: { x: 550, y: 840 },
        data: {
          label: "TypeScript Fundamentals",
          category: "Core Language",
          description: "Static typing, Interfaces, Generics, Utility types, Type narrowing, and TypeScript with bundlers.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 10,
          resources: [
            { id: "r7", title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "docs", isOfficial: true },
          ],
        },
      },
      { id: "sub-ts-generics", type: "subtopic", position: { x: 860, y: 820 }, data: { label: "Generics & Utility Types", colorKey: "C" } },
      { id: "sub-ts-interfaces", type: "subtopic", position: { x: 860, y: 870 }, data: { label: "Interfaces & Type Aliases", colorKey: "C" } },

      // 6. React 19 & Next.js
      {
        id: "react-ecosystem",
        type: "topic",
        position: { x: 550, y: 1020 },
        data: {
          label: "React 19 & Modern Ecosystem",
          category: "Frameworks",
          description: "Server Components (RSC), Hooks (useActionState, useOptimistic), TanStack Query, Zustand, and Tailwind CSS.",
          difficulty: "intermediate",
          colorKey: "B",
          estimatedHours: 24,
          resources: [
            { id: "r9", title: "React 19 Official Documentation", url: "https://react.dev", type: "docs", isOfficial: true },
          ],
        },
      },
      { id: "sub-rsc", type: "subtopic", position: { x: 240, y: 1000 }, data: { label: "React Server Components (RSC)", colorKey: "C" } },
      { id: "sub-hooks", type: "subtopic", position: { x: 240, y: 1050 }, data: { label: "Hooks & State Management", colorKey: "C" } },

      // 7. Fullstack Next.js
      {
        id: "nextjs-fullstack",
        type: "topic",
        position: { x: 550, y: 1200 },
        data: {
          label: "Next.js 15 & SSR / SSG",
          category: "Frameworks",
          description: "App Router, Server Actions, Dynamic vs Static rendering, Edge Middleware, and SEO optimizations.",
          difficulty: "advanced",
          colorKey: "B",
          estimatedHours: 18,
          resources: [
            { id: "r11", title: "Next.js Official Documentation", url: "https://nextjs.org/docs", type: "docs", isOfficial: true },
          ],
        },
      },
      { id: "sub-app-router", type: "subtopic", position: { x: 860, y: 1180 }, data: { label: "App Router & Layouts", colorKey: "C" } },
      { id: "sub-server-actions", type: "subtopic", position: { x: 860, y: 1230 }, data: { label: "Server Actions & Mutations", colorKey: "C" } },

      // 8. Performance & Testing
      {
        id: "web-perf-testing",
        type: "topic",
        position: { x: 550, y: 1380 },
        data: {
          label: "Web Performance & Testing",
          category: "Production Ready",
          description: "Core Web Vitals (LCP, FID, CLS), Bundle analysis, Playwright E2E testing, Vitest, and CI/CD pipelines.",
          difficulty: "advanced",
          colorKey: "B",
          estimatedHours: 14,
          resources: [
            { id: "r13", title: "web.dev: Learn Core Web Vitals", url: "https://web.dev/vitals/", type: "article", isOfficial: true },
          ],
        },
      },
      { id: "sub-vitals", type: "subtopic", position: { x: 240, y: 1360 }, data: { label: "Core Web Vitals (LCP, INP)", colorKey: "C" } },
      { id: "sub-playwright", type: "subtopic", position: { x: 240, y: 1410 }, data: { label: "Vitest & Playwright E2E", colorKey: "C" } },
    ],
    edges: [
      // Spine connections (downwards)
      { id: "e-spine-1", source: "internet-basics", target: "html-css", type: "interactive" },
      { id: "e-spine-2", source: "html-css", target: "javascript-deep-dive", type: "interactive" },
      { id: "e-spine-3", source: "javascript-deep-dive", target: "git-version-control", type: "interactive" },
      { id: "e-spine-4", source: "git-version-control", target: "typescript", type: "interactive" },
      { id: "e-spine-5", source: "typescript", target: "react-ecosystem", type: "interactive" },
      { id: "e-spine-6", source: "react-ecosystem", target: "nextjs-fullstack", type: "interactive" },
      { id: "e-spine-7", source: "nextjs-fullstack", target: "web-perf-testing", type: "interactive" },

      // Subtopics
      { id: "e-sub-1", source: "internet-basics", target: "sub-http" },
      { id: "e-sub-2", source: "internet-basics", target: "sub-dns" },
      { id: "e-sub-3", source: "internet-basics", target: "sub-browsers" },
      { id: "e-sub-4", source: "html-css", target: "sub-semantic" },
      { id: "e-sub-5", source: "html-css", target: "sub-flex-grid" },
      { id: "e-sub-6", source: "html-css", target: "sub-responsive" },
      { id: "e-sub-7", source: "javascript-deep-dive", target: "sub-async" },
      { id: "e-sub-8", source: "javascript-deep-dive", target: "sub-dom" },
      { id: "e-sub-9", source: "javascript-deep-dive", target: "sub-event-loop" },
      { id: "e-sub-10", source: "git-version-control", target: "sub-git-branches" },
      { id: "e-sub-11", source: "git-version-control", target: "sub-github-prs" },
      { id: "e-sub-12", source: "typescript", target: "sub-ts-generics" },
      { id: "e-sub-13", source: "typescript", target: "sub-ts-interfaces" },
      { id: "e-sub-14", source: "react-ecosystem", target: "sub-rsc" },
      { id: "e-sub-15", source: "react-ecosystem", target: "sub-hooks" },
      { id: "e-sub-16", source: "nextjs-fullstack", target: "sub-app-router" },
      { id: "e-sub-17", source: "nextjs-fullstack", target: "sub-server-actions" },
      { id: "e-sub-18", source: "web-perf-testing", target: "sub-vitals" },
      { id: "e-sub-19", source: "web-perf-testing", target: "sub-playwright" },
    ],
  },
];

// Automatically layout roadmaps using the natural spine & alternating branch algorithm
export const DEFAULT_ROADMAPS: RoadmapData[] = RAW_ROADMAPS.map((rm) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getAutoLayoutedElements(
    rm.nodes as any,
    rm.edges as any,
    "TB"
  );
  return {
    ...rm,
    nodes: layoutedNodes as any,
    edges: layoutedEdges as any,
  };
});
