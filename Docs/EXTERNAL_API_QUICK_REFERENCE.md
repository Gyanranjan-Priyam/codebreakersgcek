# External Data API - Quick Reference

## Authentication
```bash
Authorization: Bearer YOUR_API_KEY
```

## Base URL
```
/api/external/data
```

## Rate Limit
50 requests/hour

---

## Available Resources

| Resource | Endpoint | Example |
|----------|----------|---------|
| Users | `?resource=users` | `/api/external/data?resource=users&limit=50` |
| Announcements | `?resource=announcements` | `/api/external/data?resource=announcements&category=EVENT_UPDATE` |
| Attendance | `?resource=attendance` | `/api/external/data?resource=attendance&includeRelations=true` |
| Tasks | `?resource=tasks` | `/api/external/data?resource=tasks&limit=20` |
| Events | `?resource=events` | `/api/external/data?resource=events&includeRelations=true` |
| Quizzes | `?resource=quizzes` | `/api/external/data?resource=quizzes&isActive=true` |
| Projects | `?resource=projects` | `/api/external/data?resource=projects&limit=30` |
| Reviews | `?resource=reviews` | `/api/external/data?resource=reviews&status=pending` |
| Resources | `?resource=resources` | `/api/external/data?resource=resources&includeRelations=true` |
| Support | `?resource=support` | `/api/external/data?resource=support&status=OPEN` |
| All (Summary) | `?resource=all` | `/api/external/data?resource=all` |

---

## Common Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `resource` | string | **required** | - | Resource type to fetch |
| `limit` | number | 100 | 1000 | Records per page |
| `offset` | number | 0 | - | Records to skip |
| `includeRelations` | boolean | false | - | Include related data |

---

## Resource-Specific Filters

### Users
```bash
?resource=users&branch=CSE&admissionYear=2023&profileComplete=true&role=admin
```

### Announcements
```bash
?resource=announcements&category=EVENT_UPDATE&audience=PUBLIC&isPinned=true
```

### Quizzes
```bash
?resource=quizzes&isActive=true
```

### Project Reviews
```bash
?resource=reviews&status=pending&reviewType=publish
```

### Support Tickets
```bash
?resource=support&status=OPEN&priority=HIGH
```

---

## Quick Examples

### Fetch All Users (CSE Branch)
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=users&branch=CSE&limit=100" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Fetch Active Quizzes with Attempts
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=quizzes&isActive=true&includeRelations=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Fetch Open Support Tickets
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=support&status=OPEN&priority=HIGH" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Fetch Pending Project Reviews
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=reviews&status=pending" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get Database Summary
```bash
curl -X GET "https://your-domain.com/api/external/data?resource=all" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Response Structure

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

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_FAILED` | 401 | Invalid API key |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `MISSING_RESOURCE` | 400 | No resource specified |
| `INVALID_RESOURCE` | 400 | Unknown resource |
| `INTERNAL_ERROR` | 500 | Server error |

---

## JavaScript Example

```javascript
const API_KEY = 'your-api-key';
const API_URL = 'https://your-domain.com/api/external/data';

async function fetchUsers(branch = null, limit = 100) {
  const params = new URLSearchParams({
    resource: 'users',
    limit: limit.toString()
  });
  
  if (branch) params.append('branch', branch);
  
  const response = await fetch(`${API_URL}?${params}`, {
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

// Usage
fetchUsers('CSE', 50)
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

---

## Python Example

```python
import requests

API_KEY = 'your-api-key'
API_URL = 'https://your-domain.com/api/external/data'

def fetch_users(branch=None, limit=100):
    params = {
        'resource': 'users',
        'limit': limit
    }
    if branch:
        params['branch'] = branch
    
    response = requests.get(
        API_URL,
        headers={'Authorization': f'Bearer {API_KEY}'},
        params=params
    )
    response.raise_for_status()
    return response.json()

# Usage
data = fetch_users('CSE', 50)
print(data)
```

---

## Pagination Example

```javascript
async function fetchAllUsers() {
  let allUsers = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(
      `${API_URL}?resource=users&limit=${limit}&offset=${offset}`,
      {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      }
    );
    
    const data = await response.json();
    allUsers = allUsers.concat(data.data);
    
    hasMore = data.metadata.hasMore;
    offset += limit;
  }
  
  return allUsers;
}
```

---

## TypeScript Types

```typescript
interface APIResponse<T> {
  success: boolean;
  resource: string;
  data: T;
  metadata: {
    limit: number;
    offset: number;
    totalCount?: number;
    returnedCount: number;
    hasMore: boolean;
    currentPage: number;
    totalPages?: number;
    timestamp: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  username: string | null;
  branch: string | null;
  admissionYear: string | null;
  profileComplete: boolean;
  githubUsername: string | null;
  createdAt: string;
  // ... more fields
}

interface Announcement {
  id: string;
  slugId: string;
  title: string;
  description: string;
  category: 'EMERGENCY' | 'GENERAL' | 'EVENT_UPDATE' | 'WORKSHOP' | 'LOGISTICS';
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  isPinned: boolean;
  publishDate: string;
  // ... more fields
}

// Usage
const response: APIResponse<User[]> = await fetchResource('users');
```

---

## Need More Details?

See the full documentation: [EXTERNAL_API_DOCUMENTATION.md](./EXTERNAL_API_DOCUMENTATION.md)
