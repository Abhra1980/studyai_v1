# Backend Quick Reference Guide

## Quick Start

### 1. Start Backend

```bash
cd d:\Personal_App\AI_APP_V1\backend
$env:PYTHONPATH = "."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Verify Health

```bash
curl http://localhost:8000/api/v1/health
```

Expected Response: `status: "healthy"`

---

## API Endpoints Cheat Sheet

### Authentication

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/auth/register` | email, name, password | access_token, refresh_token, user_id |
| POST | `/auth/login` | email, password | access_token, refresh_token, user_id |
| POST | `/auth/refresh` | refresh_token | new access_token, refresh_token |

### Curriculum

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/syllabus` | Array of 14 main topics |
| GET | `/syllabus/{id}` | Main topic with all units & topics |
| GET | `/syllabus/topics/{id}` | Single topic with subtopics |
| GET | `/syllabus/search/?q=keyword` | Search results |

### Learning Content

| Method | Endpoint | Body | Returns | Time |
|--------|----------|------|---------|------|
| POST | `/learn/{topic_id}` | user_level, focus_areas | LessonContent | 15-30s |
| GET | `/learn/{topic_id}/stream` | - | SSE stream | 15-30s |

### Quiz

| Method | Endpoint | Params | Returns | Time |
|--------|----------|--------|---------|------|
| POST | `/quiz/{topic_id}` | num_questions, difficulty | QuizResponse | 10-20s |

---

## Test Scenarios

### Scenario 1: Full Authentication Flow

```bash
# 1. Register new user
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
  -Method POST `
  -Body (@{
    email = "testuser@example.com"
    name = "Test User"
    password = "TestPassword123!"
  } | ConvertTo-Json) `
  -ContentType "application/json"

$accessToken = $response.access_token
$refreshToken = $response.refresh_token
Write-Host "✅ Registered! Access Token: $($accessToken.Substring(0,20))..."

# 2. Use access token to browse syllabus
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/syllabus" `
  -Headers @{ Authorization = "Bearer $accessToken" }

# 3. Refresh token when expired
$newResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/refresh" `
  -Method POST `
  -Body (@{ refresh_token = $refreshToken } | ConvertTo-Json) `
  -ContentType "application/json"

Write-Host "✅ Token refreshed! New token: $($newResponse.access_token.Substring(0,20))..."
```

### Scenario 2: Browse & Generate Lesson

```bash
# 1. Get all topics
$topics = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/syllabus" `
  -Headers @{ Authorization = "Bearer $accessToken" }
Write-Host "📚 Found $($topics.Count) main topics"

# 2. Get first topic details
$topicDetail = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/syllabus/$($topics[0].id)" `
  -Headers @{ Authorization = "Bearer $accessToken" }
Write-Host "📖 Topic: $($topicDetail.title)"
Write-Host "   Units: $($topicDetail.units.Count)"

# 3. Generate lesson for first subtopic
$firstTopicId = $topicDetail.units[0].topics[0].id
Write-Host "🎓 Generating lesson for topic $firstTopicId..."

$lesson = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/learn/$firstTopicId" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $accessToken" } `
  -Body (@{
    user_level = "intermediate"
    focus_areas = @("examples")
    include_code = $true
    include_quiz = $true
  } | ConvertTo-Json) `
  -ContentType "application/json" `
  -TimeoutSec 60

Write-Host "✅ Lesson generated!"
Write-Host "   Title: $($lesson.topic_title)"
Write-Host "   Key Points: $($lesson.key_points.Count)"
Write-Host "   Code Examples: $($lesson.code_examples.Count)"
Write-Host "   Quiz Questions: $($lesson.quiz.Count)"
```

### Scenario 3: Generate Quiz

```bash
# 1. Generate quiz for topic
$quiz = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/quiz/1" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $accessToken" } `
  -Uri "http://localhost:8000/api/v1/quiz/1?num_questions=3&difficulty=intermediate" `
  -TimeoutSec 60

Write-Host "📝 Quiz generated!"
Write-Host "   Topic: $($quiz.topic_title)"
Write-Host "   Questions: $($quiz.questions.Count)"

# 2. Display questions
foreach ($q in $quiz.questions) {
  Write-Host "`n❓ $($q.question)"
  for ($i = 0; $i -lt $q.options.Count; $i++) {
    $mark = if ($i -eq $q.correct_index) { "✓" } else { " " }
    Write-Host "  [$mark] $($q.options[$i])"
  }
  Write-Host "   📌 $($q.explanation)"
}
```

### Scenario 4: Search Functionality

```bash
# Search for specific topics
$results = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/syllabus/search/?q=arrays&limit=5" `
  -Headers @{ Authorization = "Bearer $accessToken" }

Write-Host "🔍 Search Results for 'arrays':"
foreach ($result in $results) {
  Write-Host "   - $($result.title) [Type: $($result.type)]"
  Write-Host "     Path: $($result.path)"
}
```

---

## Common Curl Commands

### Register
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "name":"User",
    "password":"SecurePass123!"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"SecurePass123!"
  }'
```

### Browse Topics
```bash
curl "http://localhost:8000/api/v1/syllabus" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Lesson (save to variable first)
```bash
$TOKEN="your_access_token_here"

curl -X POST "http://localhost:8000/api/v1/learn/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_level":"intermediate",
    "include_code":true,
    "include_quiz":true
  }'
```

### Generate Quiz
```bash
curl -X POST "http://localhost:8000/api/v1/quiz/1?num_questions=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Expected Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Health Check | <100ms | Database query only |
| Register/Login | 200-500ms | Password hashing (bcrypt) |
| List Topics | <100ms | Database query only |
| Generate Lesson | 15-30s | Ollama LLM generation |
| Generate Quiz | 10-20s | Ollama LLM generation |
| Search | <200ms | Database full-text search |

---

## Token Structure

### Access Token (15 minute expiry)
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { 
  sub: "user_id",
  email: "user@example.com",
  type: "access",
  exp: 1702564800
}
```

### Refresh Token (7 day expiry)
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { 
  sub: "user_id",
  email: "user@example.com",
  type: "refresh",
  exp: 1703169600
}
```

---

## Response Field Mapping

### Lesson Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `topic_id` | int | Topic identifier |
| `topic_title` | string | Display name |
| `explanation` | string | Main lesson content |
| `key_points` | array | Bulleted concepts |
| `code_examples` | array | Code samples with explanations |
| `math_formulas` | array | Mathematical notation |
| `quiz` | array | Practice questions |
| `further_reading` | array | Resource links |
| `model_used` | string | LLM model name |

### Quiz Question Fields

| Field | Type | Description |
|-------|------|-------------|
| `question` | string | Question text |
| `options` | array | 4 multiple choice options |
| `correct_index` | int | Index of correct answer (0-3) |
| `explanation` | string | Why this answer is correct |

---

## Headers Required

**For Protected Routes:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**For Public Routes:**
```
Content-Type: application/json
```

---

## Database Test Data

The backend automatically seeds curriculum data from CSV on startup:

- **Main Topics:** 14 (e.g., "Fundamentals", "Data Structures")
- **Units:** 50+ (e.g., "Introduction", "Advanced Topics")
- **Topics:** 200+ (e.g., "What is Programming?")
- **Subtopics:** 800+ (detailed learning points)

No need to create test data manually!

---

## Debugging Tips

### Enable Detailed Logging

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug
```

### Test Database Connection

```bash
cd backend
python check_db.py
```

### Check Ollama Models

```bash
curl http://localhost:11434/api/tags
```

### Verify CORS

```bash
curl -X OPTIONS "http://localhost:8000/api/v1/syllabus" \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" -v
```

---

## Status Codes Reference

| Code | Scenario |
|------|----------|
| 200 | ✅ Request successful |
| 201 | ✅ Resource created |
| 400 | ❌ Invalid input |
| 401 | ❌ Unauthorized (missing/invalid token) |
| 404 | ❌ Not found (topic/user doesn't exist) |
| 422 | ❌ Validation error |
| 500 | ❌ Server error (check logs) |
| 503 | ❌ Service unavailable (Ollama down) |

---

## Quick Debugging Checklist

- [ ] Backend running on `localhost:8000`?
  ```bash
  curl http://localhost:8000/api/v1/health
  ```

- [ ] Database connected?
  ```bash
  # Check status in health endpoint response
  ```

- [ ] Ollama running?
  ```bash
  curl http://localhost:11434/api/tags
  ```

- [ ] Token valid and not expired?
  ```bash
  # Tokens expire after 15 minutes - use refresh endpoint
  ```

- [ ] CORS configured?
  ```bash
  # Check .env CORS_ORIGINS includes http://localhost:5174
  ```

- [ ] Model downloaded?
  ```bash
  ollama list
  ollama pull gpt-oss:120b-cloud
  ```

---

**Last Updated:** February 2026  
**Backend Version:** 1.0.0
