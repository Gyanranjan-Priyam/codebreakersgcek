# External Data API Documentation

## Overview

The External Data API provides comprehensive access to all database information for external applications. This endpoint enables third-party applications to fetch user information, announcements, attendance records, tasks, events, quizzes, projects, and more.

## Base URL

```
https://your-domain.com/api/external/data
```

## Authentication

All requests require authentication using an API key passed in the `Authorization` header.

### Header Format
```
Authorization: Bearer YOUR_API_KEY
```

### Getting an API Key

The API key must be configured in your environment variables:
- Set the `API_KEY` environment variable with a secure string (minimum 32 characters)
- The API key should be kept confidential and not shared publicly

## Rate Limiting

- **Limit**: 50 requests per hour per API key
- **Window**: Rolling 1-hour window
- **Response**: Returns `429 Too Many Requests` when limit exceeded
- **Reset Time**: Included in error response when rate limited

## Request Parameters

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `resource` | string | The type of data to fetch. See [Available Resources](#available-resources) |

### Optional Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | integer | 100 | 1000 | Number of records to return |
| `offset` | integer | 0 | - | Number of records to skip (for pagination) |
| `includeRelations` | boolean | false | - | Include related data in response |

### Resource-Specific Filters

Different resources support different filter parameters:

#### Users Resource
- `branch` - Filter by branch (e.g., CSE, ECE)
- `admissionYear` - Filter by admission year
- `profileComplete` - Filter by profile completion status (true/false)
- `role` - Filter by user role

#### Announcements Resource
- `category` - Filter by category (EMERGENCY, GENERAL, EVENT_UPDATE, WORKSHOP, LOGISTICS)
- `audience` - Filter by audience (PUBLIC, PARTICIPANTS_ONLY, VOLUNTEERS_ONLY, ORGANIZERS_ONLY)
- `isPinned` - Filter pinned announcements (true/false)

#### Quizzes Resource
- `isActive` - Filter by active status (true/false)

#### Project Reviews Resource
- `status` - Filter by status (pending, approved, rejected)
- `reviewType` - Filter by type (review, collaboration, publish)

#### Support Tickets Resource
- `status` - Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)

## Available Resources

| Resource | Description | Supports Relations |
|----------|-------------|-------------------|
| `users` | User profiles and information | ✓ |
| `announcements` | System announcements | ✗ |
| `attendance` | Attendance sessions and records | ✓ |
| `tasks` | Tasks and submissions | ✓ |
| `events` | Events and participations | ✓ |
| `quizzes` | Quizzes, attempts, and assignments | ✓ |
| `projects` | Published projects | ✓ |
| `reviews` | Project review requests | ✓ |
| `resources` | Resource folders and files | ✓ |
| `support` | Support tickets and responses | ✓ |
| `all` | Summary of all resources + system settings | ✗ |

## Response Format

### Success Response

```json
{
  "success": true,
  "resource": "users",
  "data": [...],
  "metadata": {
    "limit": 100,
    "offset": 0,
    "totalCount": 500,
    "returnedCount": 100,
    "hasMore": true,
    "currentPage": 1,
    "totalPages": 5,
    "timestamp": "2025-12-18T10:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_FAILED` | 401 | Invalid or missing API key |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `MISSING_RESOURCE` | 400 | Resource parameter not provided |
| `INVALID_RESOURCE` | 400 | Invalid resource type |
| `INTERNAL_ERROR` | 500 | Server error |

## Examples

### Example 1: Fetch Users

**Request:**
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=users&limit=50&branch=CSE" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "resource": "users",
  "data": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "branch": "CSE",
      "admissionYear": "2023",
      "profileComplete": true,
      "githubUsername": "johndoe-dev",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
    // ... more users
  ],
  "metadata": {
    "limit": 50,
    "offset": 0,
    "totalCount": 200,
    "returnedCount": 50,
    "hasMore": true,
    "currentPage": 1,
    "totalPages": 4,
    "timestamp": "2025-12-18T10:30:00.000Z"
  }
}
```

### Example 2: Fetch Announcements

**Request:**
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=announcements&category=EVENT_UPDATE&limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "resource": "announcements",
  "data": [
    {
      "id": "ann123",
      "slugId": "event-announcement-1",
      "title": "Workshop Tomorrow",
      "description": "Join us for an exciting workshop...",
      "category": "EVENT_UPDATE",
      "priority": "IMPORTANT",
      "audience": "PUBLIC",
      "publishDate": "2025-12-18T09:00:00.000Z",
      "isPinned": true,
      "createdAt": "2025-12-17T15:00:00.000Z"
    }
    // ... more announcements
  ],
  "metadata": {
    "limit": 20,
    "offset": 0,
    "totalCount": 45,
    "returnedCount": 20,
    "hasMore": true,
    "currentPage": 1,
    "totalPages": 3,
    "timestamp": "2025-12-18T10:30:00.000Z"
  }
}
```

### Example 3: Fetch Quizzes with Relations

**Request:**
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=quizzes&isActive=true&includeRelations=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "resource": "quizzes",
  "data": [
    {
      "id": "quiz123",
      "quizId": "CODEBREAKER-QUIZZES-abc123",
      "title": "JavaScript Fundamentals",
      "description": "Test your JavaScript knowledge",
      "sets": 4,
      "duration": 30,
      "pointsPerQuestion": 2,
      "startDateTime": "2025-12-20T10:00:00.000Z",
      "endDateTime": "2025-12-20T12:00:00.000Z",
      "isActive": true,
      "attempts": [
        {
          "id": "attempt1",
          "userId": "user123",
          "setNumber": 1,
          "score": 85,
          "totalQuestions": 20,
          "correctAnswers": 17,
          "pointsEarned": 34,
          "completedAt": "2025-12-20T10:35:00.000Z"
        }
        // ... more attempts
      ],
      "setAssignments": [
        {
          "userId": "user123",
          "assignedSet": "A",
          "assignedAt": "2025-12-20T09:50:00.000Z"
        }
        // ... more assignments
      ]
    }
    // ... more quizzes
  ],
  "metadata": {
    "limit": 100,
    "offset": 0,
    "totalCount": 12,
    "returnedCount": 12,
    "hasMore": false,
    "currentPage": 1,
    "totalPages": 1,
    "timestamp": "2025-12-18T10:30:00.000Z"
  }
}
```

### Example 4: Fetch All Data Summary

**Request:**
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=all" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "resource": "all",
  "data": {
    "summary": {
      "totalUsers": 500,
      "totalAnnouncements": 45,
      "totalAttendanceSessions": 30,
      "totalTasks": 25,
      "totalEvents": 15,
      "totalQuizzes": 12,
      "totalPublishedProjects": 80,
      "totalProjectReviews": 120,
      "totalResourceFolders": 8,
      "totalSupportTickets": 50
    },
    "systemSettings": [
      {
        "key": "registration_open",
        "value": "true",
        "description": "Whether registration is currently open",
        "updatedAt": "2025-12-01T10:00:00.000Z"
      }
      // ... more settings
    ],
    "message": "To fetch detailed data, use specific resource endpoints like ?resource=users or ?resource=quizzes"
  },
  "metadata": {
    "limit": 100,
    "offset": 0,
    "returnedCount": 1,
    "timestamp": "2025-12-18T10:30:00.000Z"
  }
}
```

### Example 5: Pagination

**Fetch Second Page of Tasks:**
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=tasks&limit=10&offset=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example 6: Support Tickets with Filters

**Request:**
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=support&status=OPEN&priority=HIGH&includeRelations=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Data Models

### User Object

```typescript
{
  id: string
  name: string
  email: string
  username: string | null
  firstName: string | null
  middleName: string | null
  lastName: string | null
  mobileNumber: string | null
  whatsappNumber: string | null
  image: string | null
  profileImageKey: string | null
  state: string | null
  district: string | null
  collegeName: string | null
  collegeAddress: string | null
  registration: string | null
  rollNumber: string | null
  branch: string | null
  admissionYear: string | null
  address: string | null
  postOffice: string | null
  policeStation: string | null
  block: string | null
  pinCode: string | null
  profileComplete: boolean
  githubUsername: string | null
  role: string | null
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  
  // With includeRelations=true
  publishedProjects?: Array<{...}>
  projectReviews?: Array<{...}>
}
```

### Announcement Object

```typescript
{
  id: string
  slugId: string
  title: string
  description: string
  category: "EMERGENCY" | "GENERAL" | "EVENT_UPDATE" | "WORKSHOP" | "LOGISTICS"
  priority: "NORMAL" | "IMPORTANT" | "URGENT"
  attachmentKeys: string[]
  imageKeys: string[]
  audience: "PUBLIC" | "PARTICIPANTS_ONLY" | "VOLUNTEERS_ONLY" | "ORGANIZERS_ONLY"
  sendNotifications: boolean
  isPinned: boolean
  showInHomeBanner: boolean
  publishDate: string (ISO 8601)
  expiryDate: string | null (ISO 8601)
  isRecurring: boolean
  recurrenceType: "NONE" | "HOURLY" | "DAILY" | "WEEKLY"
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  createdBy: string
}
```

### Task Object

```typescript
{
  id: string
  taskNumber: number
  title: string
  description: string | null
  startDate: string (ISO 8601)
  dueDate: string (ISO 8601)
  points: number
  createdAt: string (ISO 8601)
  createdBy: string
  
  // With includeRelations=true
  submissions?: Array<{
    id: string
    userId: string
    status: string
    projectUrl: string | null
    submittedAt: string | null (ISO 8601)
    evaluatedAt: string | null (ISO 8601)
    pointsAwarded: number
    feedback: string | null
  }>
}
```

### Quiz Object

```typescript
{
  id: string
  quizId: string
  title: string
  description: string
  sets: number
  duration: number
  pointsPerQuestion: number
  startDateTime: string | null (ISO 8601)
  endDateTime: string | null (ISO 8601)
  isActive: boolean
  createdAt: string (ISO 8601)
  createdBy: string
  
  // With includeRelations=true
  attempts?: Array<{...}>
  setAssignments?: Array<{...}>
}
```

## Best Practices

### 1. Pagination
Always use pagination for large datasets to avoid timeouts and excessive data transfer:

```bash
# Fetch first 100 users
GET /api/external/data?resource=users&limit=100&offset=0

# Fetch next 100 users
GET /api/external/data?resource=users&limit=100&offset=100
```

### 2. Use Specific Resources
Instead of fetching `all` data, fetch specific resources you need:

```bash
# Good - specific resource
GET /api/external/data?resource=users

# Less efficient - fetching everything
GET /api/external/data?resource=all
```

### 3. Apply Filters
Use filters to reduce the amount of data transferred:

```bash
GET /api/external/data?resource=users&branch=CSE&profileComplete=true
```

### 4. Relations Only When Needed
Only use `includeRelations=true` when you need the related data:

```bash
# Without relations - faster, less data
GET /api/external/data?resource=tasks

# With relations - more data, useful for full context
GET /api/external/data?resource=tasks&includeRelations=true
```

### 5. Error Handling
Always handle errors appropriately:

```javascript
try {
  const response = await fetch(
    'https://your-domain.com/api/external/data?resource=users',
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.code, error.message);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      // Wait and retry after reset time
      console.log('Rate limited. Reset at:', error.resetTime);
    }
    
    return;
  }
  
  const data = await response.json();
  console.log('Success:', data);
  
} catch (error) {
  console.error('Network error:', error);
}
```

### 6. Rate Limit Management
Monitor your usage and implement caching to stay within rate limits:

```javascript
// Simple cache implementation
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(resource) {
  const cacheKey = `external_api_${resource}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFromAPI(resource);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
```

## Security Considerations

1. **API Key Storage**: Never expose your API key in client-side code or public repositories
2. **HTTPS Only**: Always use HTTPS when making requests
3. **Environment Variables**: Store API keys in environment variables
4. **Access Control**: The API respects user privacy - banned users are excluded from user queries
5. **Data Filtering**: Sensitive fields like passwords are never exposed

## Integration Examples

### Node.js / Express

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
const API_KEY = process.env.EXTERNAL_API_KEY;
const API_URL = 'https://your-domain.com/api/external/data';

app.get('/users', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}?resource=users`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      params: {
        limit: req.query.limit || 100,
        offset: req.query.offset || 0,
        branch: req.query.branch
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Internal server error' }
    });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Python / Flask

```python
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)
API_KEY = os.environ.get('EXTERNAL_API_KEY')
API_URL = 'https://your-domain.com/api/external/data'

@app.route('/users')
def get_users():
    try:
        response = requests.get(
            API_URL,
            headers={'Authorization': f'Bearer {API_KEY}'},
            params={
                'resource': 'users',
                'limit': request.args.get('limit', 100),
                'offset': request.args.get('offset', 0),
                'branch': request.args.get('branch')
            }
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)
```

### React / Next.js

```typescript
// lib/externalApi.ts
const API_KEY = process.env.EXTERNAL_API_KEY;
const API_URL = 'https://your-domain.com/api/external/data';

export async function fetchResource(
  resource: string, 
  params?: Record<string, any>
) {
  const queryParams = new URLSearchParams({
    resource,
    ...params
  }).toString();
  
  const response = await fetch(`${API_URL}?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}

// app/users/page.tsx
import { fetchResource } from '@/lib/externalApi';

export default async function UsersPage() {
  const data = await fetchResource('users', { limit: 50 });
  
  return (
    <div>
      <h1>Users ({data.metadata.totalCount})</h1>
      <ul>
        {data.data.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Support

For API issues, questions, or feature requests:
- Create a support ticket through the platform
- Email: support@codebreaker.com
- Documentation: https://your-domain.com/docs/api

## Changelog

### Version 1.0.0 (December 2025)
- Initial release
- Support for 11 resource types
- Rate limiting (50 requests/hour)
- Pagination support
- Relation loading
- Comprehensive filtering options
