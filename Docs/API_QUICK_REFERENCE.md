# Members API - Quick Reference

## 🚀 Endpoint
```
GET /api/members
```

## 🔑 Authentication
```bash
Authorization: Bearer YOUR_API_KEY
```

## 📊 Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | number | 100 | 1000 | Number of members to return |
| `offset` | number | 0 | - | Pagination offset |
| `includePoints` | boolean | false | - | Include points breakdown |
| `branch` | string | - | - | Filter by branch |
| `admissionYear` | string | - | - | Filter by year |
| `profileComplete` | boolean | - | - | Filter by profile status |

## 💻 Quick Examples

### cURL
```bash
# Basic
curl -H "Authorization: Bearer YOUR_KEY" \
  https://your-domain.com/api/members

# With points
curl -H "Authorization: Bearer YOUR_KEY" \
  "https://your-domain.com/api/members?includePoints=true&limit=20"

# With filters
curl -H "Authorization: Bearer YOUR_KEY" \
  "https://your-domain.com/api/members?branch=CSE&admissionYear=2023"
```

### JavaScript
```javascript
const response = await fetch(
  'https://your-domain.com/api/members?includePoints=true',
  {
    headers: { 'Authorization': 'Bearer YOUR_KEY' }
  }
);
const { data, pagination } = await response.json();
```

### Python
```python
import requests

response = requests.get(
    'https://your-domain.com/api/members',
    headers={'Authorization': 'Bearer YOUR_KEY'},
    params={'includePoints': 'true', 'limit': 20}
)
data = response.json()
```

## 📦 Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "Full Name",
      "email": "email@example.com",
      "username": "username",
      "branch": "CSE",
      "admissionYear": "2023",
      "profileComplete": true,
      "points": {              // Only if includePoints=true
        "total": 450,
        "attendance": 150,
        "tasks": 200,
        "events": 50,
        "quizzes": 50
      },
      "activity": {            // Only if includePoints=true
        "sessionsAttended": 15,
        "tasksCompleted": 10,
        "eventsParticipated": 5,
        "quizzesTaken": 3
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  },
  "timestamp": "2024-12-07T16:00:00.000Z"
}
```

## ⚡ Rate Limits

- **100 requests per hour** per API key
- Returns `429 Too Many Requests` when exceeded

## 🔐 Setup

1. Generate key:
   ```bash
   openssl rand -base64 32
   ```

2. Add to `.env`:
   ```env
   API_KEY=your_generated_key_here
   ```

3. Use in requests:
   ```
   Authorization: Bearer your_generated_key_here
   ```

## ❌ Error Codes

| Code | Meaning |
|------|---------|
| 401 | Invalid/missing API key |
| 429 | Rate limit exceeded |
| 500 | Server error |

## 📚 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.
