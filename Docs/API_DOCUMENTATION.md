# Members API Documentation

## Overview
This API provides external access to member information from the Codebreaker Dashboard. It's designed to be used by other projects to fetch member data including profile information and optionally points/activity data.

## Base URL
```
https://your-domain.com/api/members
```

## Authentication
All requests require an API key passed in the Authorization header.

### Header Format
```
Authorization: Bearer YOUR_API_KEY
```

### Getting an API Key
1. Generate a secure random string (minimum 32 characters)
2. Add it to your `.env` file:
   ```env
   API_KEY=your_secure_random_string_here_minimum_32_chars
   ```
3. Share this key with the external project that needs to access the API

## Rate Limiting
- **Limit**: 100 requests per hour per API key
- **Response when exceeded**: HTTP 429 Too Many Requests
- **Headers**: Rate limit information is not currently included in response headers

## Endpoints

### GET /api/members

Fetch a list of members with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Number of members to return (max: 1000) |
| `offset` | integer | 0 | Number of members to skip (for pagination) |
| `includePoints` | boolean | false | Include points and activity breakdown |
| `branch` | string | - | Filter by branch (e.g., "CSE", "ECE") |
| `admissionYear` | string | - | Filter by admission year (e.g., "2023") |
| `profileComplete` | boolean | - | Filter by profile completion status |

#### Example Requests

**Basic request:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-domain.com/api/members
```

**With pagination:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://your-domain.com/api/members?limit=50&offset=100"
```

**With points data:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://your-domain.com/api/members?includePoints=true"
```

**With filters:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://your-domain.com/api/members?branch=CSE&admissionYear=2023&profileComplete=true"
```

**Complete example:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://your-domain.com/api/members?limit=20&offset=0&includePoints=true&branch=CSE"
```

#### Response Format

**Without points (`includePoints=false` or omitted):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "firstName": "John",
      "middleName": null,
      "lastName": "Doe",
      "mobileNumber": "+919876543210",
      "whatsappNumber": "+919876543210",
      "profileImageKey": "images/profile_123.jpg",
      "registration": "2023CSE001",
      "rollNumber": "001",
      "branch": "CSE",
      "admissionYear": "2023",
      "state": "Bihar",
      "district": "Gaya",
      "collegeName": "GCEK",
      "githubUsername": "johndoe",
      "profileComplete": true,
      "role": "member",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-12-07T15:45:00.000Z"
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

**With points (`includePoints=true`):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "firstName": "John",
      "middleName": null,
      "lastName": "Doe",
      "mobileNumber": "+919876543210",
      "whatsappNumber": "+919876543210",
      "profileImageKey": "images/profile_123.jpg",
      "registration": "2023CSE001",
      "rollNumber": "001",
      "branch": "CSE",
      "admissionYear": "2023",
      "state": "Bihar",
      "district": "Gaya",
      "collegeName": "GCEK",
      "githubUsername": "johndoe",
      "profileComplete": true,
      "role": "member",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-12-07T15:45:00.000Z",
      "points": {
        "total": 450,
        "attendance": 150,
        "tasks": 200,
        "events": 50,
        "quizzes": 50
      },
      "activity": {
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

#### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized - Invalid or missing API key"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

## Data Fields

### User Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique user identifier |
| `name` | string | Full name |
| `email` | string | Email address |
| `username` | string \| null | Unique username |
| `firstName` | string \| null | First name |
| `middleName` | string \| null | Middle name |
| `lastName` | string \| null | Last name |
| `mobileNumber` | string \| null | Mobile number |
| `whatsappNumber` | string \| null | WhatsApp number |
| `profileImageKey` | string \| null | S3 key for profile image |
| `registration` | string \| null | Registration number |
| `rollNumber` | string \| null | Roll number |
| `branch` | string \| null | Academic branch (CSE, ECE, etc.) |
| `admissionYear` | string \| null | Year of admission |
| `state` | string \| null | State |
| `district` | string \| null | District |
| `collegeName` | string \| null | College name |
| `githubUsername` | string \| null | GitHub username |
| `profileComplete` | boolean | Profile completion status |
| `role` | string \| null | User role (member, admin, etc.) |
| `createdAt` | string | ISO 8601 timestamp |
| `updatedAt` | string | ISO 8601 timestamp |

### Points Fields (when `includePoints=true`)

| Field | Type | Description |
|-------|------|-------------|
| `points.total` | number | Total points across all categories |
| `points.attendance` | number | Points from attendance |
| `points.tasks` | number | Points from completed tasks |
| `points.events` | number | Points from event participation |
| `points.quizzes` | number | Points from quiz attempts |

### Activity Fields (when `includePoints=true`)

| Field | Type | Description |
|-------|------|-------------|
| `activity.sessionsAttended` | number | Number of sessions attended |
| `activity.tasksCompleted` | number | Number of tasks completed |
| `activity.eventsParticipated` | number | Number of events participated in |
| `activity.quizzesTaken` | number | Number of approved quiz attempts |

## Usage Examples

### JavaScript/TypeScript (fetch)

```javascript
const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://your-domain.com/api/members';

async function getMembers(options = {}) {
  const params = new URLSearchParams();
  
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);
  if (options.includePoints) params.append('includePoints', 'true');
  if (options.branch) params.append('branch', options.branch);
  if (options.admissionYear) params.append('admissionYear', options.admissionYear);
  if (options.profileComplete !== undefined) {
    params.append('profileComplete', options.profileComplete.toString());
  }
  
  const url = `${BASE_URL}?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

// Example usage
getMembers({
  limit: 20,
  includePoints: true,
  branch: 'CSE',
  profileComplete: true
}).then(data => {
  console.log('Members:', data.data);
  console.log('Total:', data.pagination.total);
});
```

### Python (requests)

```python
import requests

API_KEY = 'your_api_key_here'
BASE_URL = 'https://your-domain.com/api/members'

def get_members(**kwargs):
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    params = {}
    if 'limit' in kwargs:
        params['limit'] = kwargs['limit']
    if 'offset' in kwargs:
        params['offset'] = kwargs['offset']
    if 'include_points' in kwargs and kwargs['include_points']:
        params['includePoints'] = 'true'
    if 'branch' in kwargs:
        params['branch'] = kwargs['branch']
    if 'admission_year' in kwargs:
        params['admissionYear'] = kwargs['admission_year']
    if 'profile_complete' in kwargs:
        params['profileComplete'] = str(kwargs['profile_complete']).lower()
    
    try:
        response = requests.get(BASE_URL, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error fetching members: {e}')
        raise

# Example usage
data = get_members(
    limit=20,
    include_points=True,
    branch='CSE',
    profile_complete=True
)

print(f"Total members: {data['pagination']['total']}")
for member in data['data']:
    print(f"{member['name']} - {member['points']['total']} points")
```

### Node.js (axios)

```javascript
const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://your-domain.com/api/members';

async function getMembers(options = {}) {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      params: {
        limit: options.limit,
        offset: options.offset,
        includePoints: options.includePoints ? 'true' : undefined,
        branch: options.branch,
        admissionYear: options.admissionYear,
        profileComplete: options.profileComplete?.toString()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching members:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
getMembers({
  limit: 20,
  includePoints: true,
  branch: 'CSE'
}).then(data => {
  console.log('Members:', data.data.length);
  console.log('Total:', data.pagination.total);
});
```

## Pagination Example

To fetch all members with pagination:

```javascript
async function getAllMembers() {
  const allMembers = [];
  let offset = 0;
  const limit = 100;
  
  while (true) {
    const response = await getMembers({ limit, offset });
    allMembers.push(...response.data);
    
    if (!response.pagination.hasMore) {
      break;
    }
    
    offset += limit;
  }
  
  return allMembers;
}
```

## Best Practices

1. **Cache responses** - Member data doesn't change frequently, consider caching for 5-10 minutes
2. **Use pagination** - Don't fetch all members at once unless necessary
3. **Filter on server** - Use query parameters instead of fetching all and filtering client-side
4. **Handle rate limits** - Implement exponential backoff when receiving 429 responses
5. **Secure your API key** - Never expose it in client-side code or public repositories
6. **Monitor usage** - Track your API calls to stay within rate limits

## Security Notes

- API keys should be treated as sensitive credentials
- Store API keys in environment variables, never in code
- Rotate API keys periodically
- The API only returns non-sensitive user information
- Banned users are automatically excluded from results
- Rate limiting prevents abuse

## Support

For issues or questions about the API, please contact the development team or create an issue in the project repository.
