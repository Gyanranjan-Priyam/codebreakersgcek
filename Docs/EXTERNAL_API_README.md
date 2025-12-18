# External Data API

A comprehensive, type-safe API endpoint for accessing all database information in external applications.

## 🚀 Quick Start

### 1. Set up API Key

Add your API key to `.env`:

```bash
API_KEY=your-super-secret-api-key-minimum-32-characters
```

### 2. Use the Client Library

```typescript
import { createExternalAPIClient } from '@/lib/external-api-client';

const client = createExternalAPIClient({
  apiKey: process.env.EXTERNAL_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
});

// Fetch users
const users = await client.users.list({ branch: 'CSE', limit: 50 });

// Fetch active quizzes
const quizzes = await client.quizzes.active();

// Get database summary
const summary = await client.all();
```

### 3. Or Use Raw HTTP

```bash
curl -X GET "https://your-domain.com/api/external/data?resource=users&limit=50" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 📚 Documentation

- **[Full API Documentation](./EXTERNAL_API_DOCUMENTATION.md)** - Complete reference with all endpoints, parameters, and examples
- **[Quick Reference](./EXTERNAL_API_QUICK_REFERENCE.md)** - Cheat sheet for common operations
- **[Type Definitions](../lib/external-api-types.ts)** - TypeScript types for type-safe integration
- **[Client Library](../lib/external-api-client.ts)** - Pre-built client for easy integration
- **[Usage Examples](../lib/examples/external-api-examples.ts)** - Real-world usage examples

## 🎯 Features

- ✅ Access to all database resources (users, quizzes, tasks, events, etc.)
- ✅ Type-safe TypeScript client
- ✅ Pagination support
- ✅ Advanced filtering
- ✅ Rate limiting (50 req/hour)
- ✅ Relation loading
- ✅ Error handling
- ✅ Comprehensive documentation

## 🔐 Authentication

All requests require an API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

## 📊 Available Resources

| Resource | Description |
|----------|-------------|
| `users` | User profiles and information |
| `announcements` | System announcements |
| `attendance` | Attendance sessions and records |
| `tasks` | Tasks and submissions |
| `events` | Events and participations |
| `quizzes` | Quizzes, attempts, and results |
| `projects` | Published projects |
| `reviews` | Project review requests |
| `resources` | Resource folders and files |
| `support` | Support tickets and responses |
| `all` | Summary of all resources |

## 💡 Common Use Cases

### Fetch CSE Students

```typescript
const response = await client.users.byBranch('CSE', 100);
console.log(`Found ${response.metadata.totalCount} CSE students`);
```

### Get Active Quizzes with Results

```typescript
const quizzes = await client.quizzes.list({
  isActive: true,
  includeRelations: true,
});
```

### Fetch Pending Project Reviews

```typescript
const reviews = await client.reviews.pending(50);
```

### Export Data to CSV

```typescript
const users = await client.users.list({ limit: 1000 });
const csv = users.data.map(u => `${u.name},${u.email},${u.branch}`).join('\n');
```

## 🛡️ Rate Limits

- **Limit**: 50 requests per hour
- **Window**: Rolling 1-hour window
- **Status**: Returns `429` when exceeded
- **Response**: Includes retry-after time

## 📝 Response Format

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

## 🔧 Error Handling

```typescript
try {
  const users = await client.users.list();
} catch (error) {
  if (error instanceof ExternalAPIError) {
    if (error.isRateLimitError()) {
      console.log('Rate limited. Retry after:', error.getRetryAfter());
    } else if (error.isAuthError()) {
      console.log('Invalid API key');
    }
  }
}
```

## 🌐 Integration Examples

### Node.js / Express

```javascript
const { createExternalAPIClient } = require('./lib/external-api-client');

const client = createExternalAPIClient({
  apiKey: process.env.API_KEY,
  baseUrl: 'https://your-domain.com',
});

app.get('/api/users', async (req, res) => {
  const users = await client.users.list({ limit: 100 });
  res.json(users);
});
```

### Python

```python
import requests

headers = {'Authorization': f'Bearer {API_KEY}'}
response = requests.get(
    'https://your-domain.com/api/external/data?resource=users',
    headers=headers
)
data = response.json()
```

### React / Next.js

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/external-proxy?resource=users')
      .then(res => res.json())
      .then(data => setUsers(data.data));
  }, []);
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## 📦 Client Library Features

The TypeScript client provides:

- 🔒 Type-safe methods for all resources
- ⚡ Automatic error handling
- 🔄 Built-in retry logic
- 📄 Pagination helpers
- 🎯 Convenient filter methods

## 🔍 Filtering Examples

### Users
```typescript
client.users.list({
  branch: 'CSE',
  admissionYear: '2023',
  profileComplete: true,
})
```

### Announcements
```typescript
client.announcements.list({
  category: 'EVENT_UPDATE',
  isPinned: true,
})
```

### Support Tickets
```typescript
client.support.list({
  status: 'OPEN',
  priority: 'HIGH',
  includeRelations: true,
})
```

## 🚦 Best Practices

1. **Cache responses** to reduce API calls
2. **Use pagination** for large datasets
3. **Apply filters** to fetch only needed data
4. **Use `includeRelations`** sparingly (increases payload size)
5. **Handle rate limits** with exponential backoff
6. **Secure your API key** - never expose in client-side code

## 🛠️ Development

### Run Tests

```bash
npm test
```

### Type Check

```bash
npm run type-check
```

### Generate API Docs

```bash
npm run docs:api
```

## 📧 Support

For issues or questions:
- Create a support ticket
- Email: support@codebreaker.com
- Docs: https://your-domain.com/docs/api

## 📄 License

This API is part of the Codebreaker Dashboard platform.

---

Made with ❤️ by the Codebreaker Team
