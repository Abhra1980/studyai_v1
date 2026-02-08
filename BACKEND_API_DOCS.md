# StudyAI Backend API Documentation

**API Base URL:** `http://localhost:8000/api/v1`

**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Authentication](#authentication-endpoints)
   - [Syllabus](#syllabus-endpoints)
   - [Learn](#learn-endpoints)
   - [Quiz](#quiz-endpoints)
4. [Request/Response Models](#requestresponse-models)
5. [Error Handling](#error-handling)
6. [Database Schema](#database-schema)
7. [LLM Integration](#llm-integration)
8. [Configuration](#configuration)

---

## Overview

**StudyAI** is an AI-powered learning platform backend built with:

- **Framework:** FastAPI + Uvicorn
- **Database:** PostgreSQL (async with SQLAlchemy ORM)
- **Authentication:** JWT (PyJWT) + bcrypt password hashing
- **LLM Provider:** Ollama (gpt-oss:120b-cloud model)
- **API Style:** RESTful with `/api/v1` prefix

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Web Server | Uvicorn ASGI |
| ORM | SQLAlchemy (async) |
| Validation | Pydantic v2 |
| Authentication | JWT + bcrypt |
| LLM | Ollama |
| Database | PostgreSQL |

---

## Authentication

### JWT Token Flow

1. **User Registration** → `POST /api/v1/auth/register`
   - Create account with email, name, password
   - Returns: `access_token` + `refresh_token`

2. **User Login** → `POST /api/v1/auth/login`
   - Authenticate with email + password
   - Returns: `access_token` + `refresh_token`

3. **Token Refresh** → `POST /api/v1/auth/refresh`
   - Exchange refresh token for new access token
   - Use when access token expires

4. **Protected Routes**
   - Include `Authorization: Bearer <access_token>` header
   - Token expires in **15 minutes**
   - Refresh token expires in **7 days**

### Password Hashing

- Uses **bcrypt** with salt rounds: 12
- Passwords never stored in plaintext
- Verification on login with constant-time comparison

---

## API Endpoints

### Health Check

#### `GET /api/v1/health`

**Purpose:** Verify backend is operational with database & LLM connectivity

**Response (200 OK):**
```json
{
  "status": "healthy",
  "app": "StudyAI",
  "version": "1.0.0",
  "database": "connected",
  "llm_provider": "ollama",
  "llm_model": "gpt-oss:120b-cloud"
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Database connection failed

---

### Authentication Endpoints

#### `POST /api/v1/auth/register`

**Purpose:** Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `400 Bad Request` - Email already registered
- `422 Unprocessable Entity` - Invalid email format or missing fields

---

#### `POST /api/v1/auth/login`

**Purpose:** Authenticate user and get JWT tokens

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid email or password
- `422 Unprocessable Entity` - Invalid email format

---

#### `POST /api/v1/auth/refresh`

**Purpose:** Get a new access token using refresh token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

### Syllabus Endpoints

#### `GET /api/v1/syllabus`

**Purpose:** Get all main topics (curriculum overview)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Fundamentals",
    "description": "Core concepts and basics",
    "unit_count": 3,
    "topic_count": 12
  },
  {
    "id": 2,
    "title": "Data Structures",
    "description": "Essential data structures",
    "unit_count": 4,
    "topic_count": 18
  }
]
```

**Query Parameters:** None

---

#### `GET /api/v1/syllabus/{main_topic_id}`

**Purpose:** Get a specific main topic with all its units and subtopics

**Path Parameters:**
- `main_topic_id` (integer) - ID of the main topic

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Fundamentals",
  "description": "Core concepts and basics",
  "units": [
    {
      "id": 1,
      "name": "Introduction",
      "topics": [
        {
          "id": 1,
          "title": "What is Programming?",
          "subtopic_count": 3,
          "subtopics": [
            {
              "id": 1,
              "content": "Programming basics and syntax"
            }
          ]
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Main topic doesn't exist

---

#### `GET /api/v1/syllabus/topics/{topic_id}`

**Purpose:** Get a single topic with all subtopics

**Path Parameters:**
- `topic_id` (integer) - ID of the topic

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "What is Programming?",
  "unit_name": "Introduction",
  "main_topic_name": "Fundamentals",
  "sub_topics": [
    {
      "id": 1,
      "content": "Programming basics and syntax"
    },
    {
      "id": 2,
      "content": "Programming languages overview"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Topic doesn't exist

---

#### `GET /api/v1/syllabus/search/?q={query}&limit={limit}`

**Purpose:** Search topics and subtopics by keyword

**Query Parameters:**
- `q` (string, required) - Search query (minimum 2 characters)
- `limit` (integer, optional) - Maximum results (1-100, default 20)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Arrays",
    "type": "topic",
    "relevance": 0.95,
    "path": "Data Structures > Linear Structures > Arrays"
  },
  {
    "id": 52,
    "content": "Dynamic array allocation",
    "type": "subtopic",
    "relevance": 0.85,
    "path": "Data Structures > Linear Structures > Arrays"
  }
]
```

**Error Responses:**
- `422 Unprocessable Entity` - Search query too short

---

### Learn Endpoints

#### `POST /api/v1/learn/{topic_id}`

**Purpose:** Generate a full lesson for a topic (non-streaming)

**Path Parameters:**
- `topic_id` (integer) - ID of the topic to learn

**Request Body:**
```json
{
  "user_level": "intermediate",
  "focus_areas": ["practical examples", "code patterns"],
  "include_code": true,
  "include_quiz": true
}
```

**Request Fields:**
- `user_level` - "beginner" | "intermediate" | "advanced" (default: "beginner")
- `focus_areas` - Array of focus areas (optional)
- `include_code` - Include code examples (default: true)
- `include_quiz` - Include quiz questions (default: true)

**Response (200 OK):**
```json
{
  "topic_id": 1,
  "topic_title": "What is Programming?",
  "explanation": "Programming is the process of creating software by writing code. Code is a set of instructions written in a programming language that tells a computer what to do...",
  "key_points": [
    "Programming is communicating with computers",
    "Code is written in programming languages",
    "Syntax and logic are both important"
  ],
  "code_examples": [
    {
      "language": "python",
      "code": "print('Hello, World!')",
      "explanation": "This prints a message to the console"
    }
  ],
  "math_formulas": [
    "Time_Complexity = O(n)"
  ],
  "quiz": [
    {
      "question": "What is a variable?",
      "options": ["A container for data", "A function", "A module"],
      "correct": 0,
      "explanation": "A variable is a container that stores data values in memory"
    }
  ],
  "further_reading": [
    "Python Documentation: https://docs.python.org",
    "Clean Code by Robert C. Martin"
  ],
  "model_used": "gpt-oss:120b-cloud"
}
```

**Timing:**
- ⏱️ **Expected response time:** 15-30 seconds (Ollama LLM generation)

**Error Responses:**
- `404 Not Found` - Topic doesn't exist
- `500 Internal Server Error` - LLM service unavailable

---

#### `GET /api/v1/learn/{topic_id}/stream`

**Purpose:** Stream lesson generation via Server-Sent Events (SSE)

**Path Parameters:**
- `topic_id` (integer) - ID of the topic

**Query Parameters:**
- `user_level` - "beginner" | "intermediate" | "advanced" (default: "intermediate")

**Response (200 OK with streaming):**
```
data: {"token":"Programming"}
data: {"token":" is"}
data: {"token":" the"}
data: {"token":" process"}
...
```

**Headers:**
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`

**Error Responses:**
- `404 Not Found` - Topic doesn't exist

---

### Quiz Endpoints

#### `POST /api/v1/quiz/{topic_id}`

**Purpose:** Generate a multiple-choice quiz for a topic

**Path Parameters:**
- `topic_id` (integer) - ID of the topic

**Query Parameters:**
- `num_questions` (integer) - Number of questions (default: 5)
- `difficulty` - "easy" | "intermediate" | "hard" (default: "intermediate")

**Response (200 OK):**
```json
{
  "topic_id": 1,
  "topic_title": "What is Programming?",
  "questions": [
    {
      "question": "What is a variable?",
      "options": [
        "A container for storing data",
        "A function that performs calculations",
        "A module containing code",
        "A type of loop"
      ],
      "correct_index": 0,
      "explanation": "A variable is a named container that stores values in memory. It allows us to reference data by a meaningful name instead of a memory address."
    },
    {
      "question": "Which of these is a programming language?",
      "options": [
        "HTML",
        "Python",
        "SQL",
        "All of the above"
      ],
      "correct_index": 3,
      "explanation": "All three are used in programming. HTML is for web markup, Python is a general-purpose language, and SQL is for databases."
    }
  ],
  "model_used": "gpt-oss:120b-cloud"
}
```

**Timing:**
- ⏱️ **Expected response time:** 10-20 seconds (Ollama LLM generation)

**Error Responses:**
- `404 Not Found` - Topic doesn't exist
- `500 Internal Server Error` - LLM service unavailable

---

## Request/Response Models

### Authentication Models

#### LoginRequest
```python
{
  "email": "user@example.com",  # Valid email
  "password": "SecurePassword123!"  # Min 8 characters
}
```

#### RegisterRequest
```python
{
  "email": "user@example.com",  # Valid, unique email
  "name": "John Doe",  # User's display name
  "password": "SecurePassword123!"  # Min 8 characters
}
```

#### AuthResponse
```python
{
  "access_token": "string",  # JWT access token (15 min expiry)
  "refresh_token": "string",  # JWT refresh token (7 day expiry)
  "token_type": "bearer",
  "user_id": "string",  # UUID
  "email": "string",
  "name": "string"
}
```

### Content Models

#### LearnRequest
```python
{
  "user_level": "beginner|intermediate|advanced",
  "focus_areas": ["string"],  # Optional
  "include_code": true,
  "include_quiz": true
}
```

#### LessonContent
```python
{
  "topic_id": 1,
  "topic_title": "string",
  "explanation": "string",  # Main lesson content
  "key_points": ["string"],
  "code_examples": [
    {
      "language": "string",
      "code": "string",
      "explanation": "string"
    }
  ],
  "math_formulas": ["string"],
  "quiz": ["object"],  # Quiz questions
  "further_reading": ["string"],  # Resource links
  "model_used": "string|null"
}
```

#### QuizResponse
```python
{
  "topic_id": 1,
  "topic_title": "string",
  "questions": [
    {
      "question": "string",
      "options": ["string"],  # 4 options
      "correct_index": 0,  # Index of correct answer
      "explanation": "string"
    }
  ],
  "model_used": "string|null"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error description",
  "status_code": 400
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|--------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 500 | Server Error | Unexpected error |
| 503 | Service Unavailable | LLM service down |

### Common Error Scenarios

**Invalid Email Format:**
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "value is not a valid email address"
    }
  ]
}
```

**Missing Required Field:**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "password"],
      "msg": "Field required"
    }
  ]
}
```

**Invalid Credentials:**
```json
{
  "detail": "Invalid email or password"
}
```

**Resource Not Found:**
```json
{
  "detail": "Topic not found"
}
```

---

## Database Schema

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | id, email, hashed_password, name |
| `main_topics` | Curriculum structure | id, title, description |
| `units` | Topic grouping | id, main_topic_id, name |
| `topics` | Learning topics | id, unit_id, title |
| `subtopics` | Topic breakdown | id, topic_id, content |
| `cached_content` | Generated lessons/quizzes | id, topic_id, content_json |
| `progress` | User learning progress | id, user_id, topic_id, status |

### Key Relationships

```
- MainTopic (1) ──→ (many) Unit
- Unit (1) ──→ (many) Topic
- Topic (1) ──→ (many) SubTopic
- User (1) ──→ (many) Progress
- Progress (many) ──→ (1) Topic
```

---

## LLM Integration

### Ollama Configuration

**Base URL:** `http://localhost:11434`

**Model:** `gpt-oss:120b-cloud`

**Capabilities:**
- Lesson generation with structured output
- Quiz question generation
- Adaptive content based on user level

### LLM Prompting

**Lesson Generation Prompt:**
```
Generate a comprehensive lesson for:
- Topic: {topic_title}
- Main Topic: {main_topic}
- Unit: {unit_name}
- Subtopics: {sub_topics}
- User Level: {user_level}

Include:
1. Detailed explanation
2. Key concepts
3. Code examples (if applicable)
4. Further reading resources

Format as JSON with fields:
- explanation (string)
- key_concepts (array)
- code_examples (array with language, code, explanation)
- resources (array)
```

**Quiz Generation Prompt:**
```
Generate {num_questions} multiple-choice questions for:
- Topic: {topic_title}
- Subtopics: {sub_topics}
- Difficulty: {difficulty}

Each question should have:
- question (string)
- options (4 options as array)
- correct_answer (index 0-3)
- explanation (string)

Format as JSON.
```

### Performance Tuning

- **Model Size:** 120B (large, slower but accurate)
- **Timeout:** 60 seconds per request
- **Caching:** Results cached for 30 days

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# FastAPI App
APP_NAME=StudyAI
APP_VERSION=1.0.0

# Database (PostgreSQL)
neon_db_api_key=postgresql://user:password@host:5432/studyai

# LLM Provider
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gpt-oss:120b-cloud

# JWT Secret
JWT_SECRET_KEY=your_super_secret_key_here_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=0.25

# CORS
CORS_ORIGINS=["http://localhost:5174","http://localhost:3000"]
```

### Startup Configuration

**Command to start backend:**

```bash
cd backend
$env:PYTHONPATH = "."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**With auto-reload (development):**

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**With logging:**

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level debug
```

### Dependencies

Key packages (from `requirements.txt`):

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg[asyncio]==3.1.13
pydantic==2.5.0
pydantic-settings==2.1.0
PyJWT==2.8.1
bcrypt==4.1.1
python-multipart==0.0.6
email-validator==2.1.0
httpx==0.25.0
python-dotenv==1.0.0
```

---

## Usage Examples

### 1. Register & Login Flow

**Step 1: Register**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "name": "Alex Student",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@example.com",
  "name": "Alex Student"
}
```

**Step 2: Login (if you return later)**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123!"
  }'
```

### 2. Browse Curriculum

**Get all topics:**
```bash
curl "http://localhost:8000/api/v1/syllabus" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Get specific topic with subtopics:**
```bash
curl "http://localhost:8000/api/v1/syllabus/topics/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Search topics:**
```bash
curl "http://localhost:8000/api/v1/syllabus/search/?q=arrays&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 3. Generate Lesson

```bash
curl -X POST "http://localhost:8000/api/v1/learn/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_level": "intermediate",
    "focus_areas": ["practical examples"],
    "include_code": true,
    "include_quiz": true
  }'
```

⏱️ **Wait 15-30 seconds for response...**

### 4. Generate Quiz

```bash
curl -X POST "http://localhost:8000/api/v1/quiz/1?num_questions=5&difficulty=intermediate" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

⏱️ **Wait 10-20 seconds for response...**

---

## Troubleshooting

### Backend Won't Start

**Error: `ModuleNotFoundError: No module named 'app'`**

**Solution:** Set PYTHONPATH before running:
```bash
cd d:\Personal_App\AI_APP_V1\backend
$env:PYTHONPATH = "."
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### LLM Service Unavailable

**Error: `Failed to stream lesson content`**

**Solution:** Ensure Ollama is running:
```bash
ollama serve  # Start Ollama
ollama pull gpt-oss:120b-cloud  # Download model
```

### CORS Errors

**Error: `CORS error - blocked by policy`**

**Solution:** Ensure frontend URL is in CORS_ORIGINS (`.env`):
```bash
CORS_ORIGINS=["http://localhost:5174","http://127.0.0.1:5174"]
```

### Database Connection Failed

**Error: `Failed to connect to database`**

**Solution:** Check environment variables:
```bash
# Verify neon_db_api_key in .env
# Format: postgresql://user:password@host:5432/dbname
```

---

## Security Considerations

✅ **Implemented:**
- JWT token-based authentication
- bcrypt password hashing (12 rounds)
- CORS middleware for frontend isolation
- SQL injection prevention via SQLAlchemy ORM
- Pydantic input validation

⚠️ **Production Recommendations:**
- Use HTTPS in production
- Set strong JWT_SECRET_KEY (min 32 chars)
- Enable HTTPS-only cookies
- Implement rate limiting
- Add request logging and monitoring
- Use environment secrets manager (not .env in production)

---

**Last Updated:** February 2026  
**Status:** ✅ Production Ready  
**Support:** StudyAI Development Team
