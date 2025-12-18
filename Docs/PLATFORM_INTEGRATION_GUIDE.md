# Platform Integration Guide

Quick integration guides for popular platforms and frameworks.

---

## 🌐 Web Frameworks

### Next.js (App Router)

```typescript
// app/api/users/route.ts
import { createExternalAPIClient } from '@/lib/external-api-client';

const client = createExternalAPIClient({
  apiKey: process.env.EXTERNAL_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch');
  
  const users = await client.users.list({ 
    branch: branch || undefined,
    limit: 100 
  });
  
  return Response.json(users);
}
```

```typescript
// app/users/page.tsx
async function UsersPage() {
  const response = await fetch('/api/users');
  const data = await response.json();
  
  return (
    <div>
      <h1>Users ({data.metadata.totalCount})</h1>
      <ul>
        {data.data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### React (Client-Side)

```typescript
import { useState, useEffect } from 'react';

function useExternalAPI(resource: string, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/proxy?resource=${resource}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [resource]);
  
  return { data, loading, error };
}

// Usage
function UsersList() {
  const { data, loading, error } = useExternalAPI('users', { limit: 50 });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data.data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Express.js

```javascript
const express = require('express');
const app = express();

const API_KEY = process.env.EXTERNAL_API_KEY;
const API_URL = 'https://your-domain.com/api/external/data';

app.get('/api/users', async (req, res) => {
  try {
    const response = await fetch(
      `${API_URL}?resource=users&limit=${req.query.limit || 100}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running'));
```

---

## 📱 Mobile Apps

### React Native

```typescript
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';

const API_URL = 'https://your-domain.com/api/external/data';
const API_KEY = 'your-api-key';

function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${API_URL}?resource=users&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      const data = await response.json();
      setUsers(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FlatList
      data={users}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>{item.email}</Text>
        </View>
      )}
    />
  );
}
```

### Flutter

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ExternalAPIService {
  static const String apiUrl = 'https://your-domain.com/api/external/data';
  static const String apiKey = 'your-api-key';
  
  Future<Map<String, dynamic>> fetchUsers({int limit = 100}) async {
    final response = await http.get(
      Uri.parse('$apiUrl?resource=users&limit=$limit'),
      headers: {
        'Authorization': 'Bearer $apiKey',
      },
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load users');
    }
  }
}

// Usage
class UsersScreen extends StatefulWidget {
  @override
  _UsersScreenState createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final apiService = ExternalAPIService();
  List<dynamic> users = [];
  
  @override
  void initState() {
    super.initState();
    loadUsers();
  }
  
  void loadUsers() async {
    final data = await apiService.fetchUsers(limit: 50);
    setState(() {
      users = data['data'];
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: users.length,
      itemBuilder: (context, index) {
        final user = users[index];
        return ListTile(
          title: Text(user['name']),
          subtitle: Text(user['email']),
        );
      },
    );
  }
}
```

---

## 🐍 Python

### Flask

```python
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

API_KEY = os.environ.get('EXTERNAL_API_KEY')
API_URL = 'https://your-domain.com/api/external/data'

@app.route('/api/users')
def get_users():
    try:
        response = requests.get(
            API_URL,
            headers={'Authorization': f'Bearer {API_KEY}'},
            params={
                'resource': 'users',
                'limit': request.args.get('limit', 100)
            }
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)
```

### Django

```python
# views.py
from django.http import JsonResponse
import requests
import os

API_KEY = os.environ.get('EXTERNAL_API_KEY')
API_URL = 'https://your-domain.com/api/external/data'

def users_view(request):
    try:
        response = requests.get(
            API_URL,
            headers={'Authorization': f'Bearer {API_KEY}'},
            params={
                'resource': 'users',
                'limit': request.GET.get('limit', 100)
            }
        )
        response.raise_for_status()
        return JsonResponse(response.json())
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/users/', views.users_view),
]
```

### FastAPI

```python
from fastapi import FastAPI, HTTPException
import httpx
import os

app = FastAPI()

API_KEY = os.environ.get('EXTERNAL_API_KEY')
API_URL = 'https://your-domain.com/api/external/data'

@app.get('/api/users')
async def get_users(limit: int = 100, branch: str = None):
    async with httpx.AsyncClient() as client:
        params = {'resource': 'users', 'limit': limit}
        if branch:
            params['branch'] = branch
            
        response = await client.get(
            API_URL,
            headers={'Authorization': f'Bearer {API_KEY}'},
            params=params
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code)
            
        return response.json()
```

---

## ☕ Java

### Spring Boot

```java
@RestController
@RequestMapping("/api")
public class ExternalAPIController {
    
    @Value("${external.api.key}")
    private String apiKey;
    
    @Value("${external.api.url}")
    private String apiUrl;
    
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
        @RequestParam(defaultValue = "100") int limit,
        @RequestParam(required = false) String branch
    ) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            
            UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(apiUrl)
                .queryParam("resource", "users")
                .queryParam("limit", limit);
            
            if (branch != null) {
                builder.queryParam("branch", branch);
            }
            
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                Map.class
            );
            
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
```

---

## 🔵 PHP

### Laravel

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ExternalAPIController extends Controller
{
    private $apiKey;
    private $apiUrl;
    
    public function __construct()
    {
        $this->apiKey = env('EXTERNAL_API_KEY');
        $this->apiUrl = env('EXTERNAL_API_URL');
    }
    
    public function getUsers(Request $request)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->get($this->apiUrl, [
                'resource' => 'users',
                'limit' => $request->input('limit', 100),
                'branch' => $request->input('branch'),
            ]);
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
```

---

## 🔄 Webhooks & Automation

### Zapier Integration

```javascript
// Zapier Custom Integration
const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://your-domain.com/api/external/data',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bundle.authData.apiKey}`,
    },
    params: {
      resource: bundle.inputData.resource,
      limit: bundle.inputData.limit || 100,
    },
  });
  
  return response.json.data;
};

module.exports = {
  key: 'fetch_data',
  noun: 'Data',
  display: {
    label: 'Fetch Data',
    description: 'Fetches data from External API',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'resource',
        label: 'Resource',
        type: 'string',
        required: true,
        choices: ['users', 'quizzes', 'tasks', 'events'],
      },
      {
        key: 'limit',
        label: 'Limit',
        type: 'integer',
        default: 100,
      },
    ],
  },
};
```

### GitHub Actions

```yaml
name: Fetch Data

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch Users
        run: |
          curl -X GET "https://your-domain.com/api/external/data?resource=users" \
            -H "Authorization: Bearer ${{ secrets.EXTERNAL_API_KEY }}" \
            -o users.json
      
      - name: Upload Artifact
        uses: actions/upload-artifact@v2
        with:
          name: users-data
          path: users.json
```

---

## 📊 Analytics & BI Tools

### Google Sheets (Apps Script)

```javascript
function fetchUsers() {
  const API_KEY = 'your-api-key';
  const API_URL = 'https://your-domain.com/api/external/data';
  
  const response = UrlFetchApp.fetch(
    `${API_URL}?resource=users&limit=1000`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    }
  );
  
  const data = JSON.parse(response.getContentText());
  const users = data.data;
  
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  
  // Headers
  sheet.appendRow(['Name', 'Email', 'Branch', 'Admission Year']);
  
  // Data
  users.forEach(user => {
    sheet.appendRow([
      user.name,
      user.email,
      user.branch,
      user.admissionYear
    ]);
  });
}
```

### Power BI (Power Query M)

```m
let
    ApiKey = "your-api-key",
    BaseUrl = "https://your-domain.com/api/external/data",
    
    Source = Json.Document(
        Web.Contents(
            BaseUrl,
            [
                Headers = [
                    #"Authorization" = "Bearer " & ApiKey
                ],
                Query = [
                    resource = "users",
                    limit = "1000"
                ]
            ]
        )
    ),
    
    Data = Source[data],
    ToTable = Table.FromList(Data, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandedColumns = Table.ExpandRecordColumn(ToTable, "Column1", 
        {"name", "email", "branch", "admissionYear"}, 
        {"Name", "Email", "Branch", "Admission Year"}
    )
in
    ExpandedColumns
```

---

## 🔔 Real-time Updates

### WebSocket Proxy

```typescript
import { WebSocket, WebSocketServer } from 'ws';
import { createExternalAPIClient } from './lib/external-api-client';

const wss = new WebSocketServer({ port: 8080 });
const client = createExternalAPIClient({
  apiKey: process.env.EXTERNAL_API_KEY!,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
});

// Broadcast updates every 30 seconds
setInterval(async () => {
  const summary = await client.all();
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'summary_update',
        data: summary.data
      }));
    }
  });
}, 30000);

console.log('WebSocket server running on ws://localhost:8080');
```

---

## 📝 Best Practices by Platform

### API Rate Limiting
- ✅ Implement caching (5-15 minutes TTL)
- ✅ Use batch requests when possible
- ✅ Add exponential backoff for retries

### Error Handling
- ✅ Handle 401 (authentication)
- ✅ Handle 429 (rate limit)
- ✅ Handle 500 (server error)
- ✅ Log errors for debugging

### Security
- ✅ Never expose API key in client-side code
- ✅ Use environment variables
- ✅ Implement server-side proxy for client apps
- ✅ Validate and sanitize input

---

Need help with a specific platform? Check the full documentation or contact support!
