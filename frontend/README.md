# StudyAI Frontend

A modern React 18 + TypeScript frontend for StudyAI, an AI-powered learning platform.

## Architecture

### Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + PostCSS
- **State Management**: React Context + React Query
- **HTTP Client**: Axios with auth interceptors
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod validation
- **Markdown**: react-markdown with KaTeX + Prism.js
- **Icons**: lucide-react
- **UI Components**: Custom built with TailwindCSS

### Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Button, Card, Badge, etc.)
│   ├── layout/          # Layout components (MainLayout, Sidebar, Header, Footer)
│   ├── pages/           # Page components (Home, Login, Syllabus, Learn, Quiz)
│   ├── learn/           # Lesson display components
│   └── quiz/            # Quiz components
├── contexts/            # React Context (Auth, App state)
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── App.tsx              # Main app component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles + TailwindCSS
```

### Features

#### 1. **Custom React Hooks**
- `useAuth()` - Authentication state and methods
- `useSyllabus()` - Curriculum data fetching
- `useMainTopic()` - Main topic details
- `useTopic()` - Topic details
- `useSearchTopics()` - Search with debounce
- `useHealth()` - Server health status
- `useGenerateLesson()` - Lesson generation with streaming
- `useGenerateLessonDirect()` - Direct lesson generation
- `useStreamLesson()` - Manual SSE streaming handle
- `useGenerateQuiz()` - Quiz generation
- `useQuizState()` - Quiz state management
- `useSearch()` - Debounced search
- `useLocalStorage()` - Persistent storage
- `useSessionStorage()` - Session storage

#### 2. **React Contexts**
- **AuthContext** - User authentication state, login/register/logout
- **AppContext** - Global app state (current topic, lesson, quiz, sidebar, dark mode)

#### 3. **API Services**
- `syllabusService.ts` - Curriculum endpoints
- `lessonService.ts` - Lesson generation and caching
- `quizService.ts` - Quiz generation
- `api.ts` - Axios instance with auth & error handling

#### 4. **UI Components**
- **Layout**: MainLayout, Sidebar, Header, Footer
- **Pages**: HomePage, LoginPage, SyllabusPage
- **Common**: Button, Card, Badge, Loader, ErrorBoundary
- **Specialized**: Lesson renderer, Quiz components (to be completed)

### Configuration

#### Environment Variables (.env.local)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=StudyAI
VITE_ENVIRONMENT=development
```

#### TypeScript Paths
```
@/*          -> ./src/*
@components/ -> ./src/components/
@contexts/   -> ./src/contexts/
@hooks/      -> ./src/hooks/
@services/   -> ./src/services/
@types/      -> ./src/types/
```

## Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
# Opens on http://localhost:5173
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Features Implemented

### ✅ Completed
- Project structure and configuration
- TypeScript types for all API responses
- Axios HTTP client with auth interceptors
- API service layer (13 methods)
- Custom React hooks (13+ hooks)
- React Context setup (Auth + App)
- Layout components (MainLayout, Sidebar, Header, Footer)
- Common UI components (Button, Card, Badge, Loader, ErrorBoundary)
- Page components (HomePage, LoginPage, SyllabusPage)
- App.tsx with React Router setup
- Dark mode support
- Responsive design
- Error boundary
- Global CSS with TailwindCSS animations

### 🔄 In Progress
- Lesson rendering component with markdown + KaTeX + Prism
- Quiz UI components
- Form validation with React Hook Form + Zod
- Integration testing

### 📋 TODO
- LearnPage component
- QuizPage component
- RegisterPage component
- Advanced quiz features
- Lesson caching UI
- Progress tracking
- User profile page
- Settings page
- Deployment configuration

## API Integration

### Endpoints Used

**Syllabus**
```
GET /api/v1/syllabus                    # List main topics
GET /api/v1/syllabus/{id}              # Get main topic with units
GET /api/v1/syllabus/topics/{id}       # Get topic details
GET /api/v1/syllabus/search/?q={query} # Search topics
GET /api/v1/health                      # Server health
```

**Learning**
```
GET /api/v1/learn/{id}/cached          # Get cached lesson
POST /api/v1/learn/{id}                 # Generate lesson (streaming)
```

**Quiz**
```
POST /api/v1/quiz/{id}                  # Generate quiz
```

## Authentication

### Login Flow
1. User submits email + password on LoginPage
2. `useAuth().login()` makes POST request to backend
3. Backend returns JWT token + user info
4. Token stored in localStorage
5. Axios interceptor adds token to all requests
6. On 401, token cleared and user redirected to login

### Protected Routes
- AuthGuard component checks authentication status
- Unauthenticated users redirected to /login
- LoginPage not accessible if already authenticated

## Styling

### TailwindCSS Customization
- **Primary Color**: Blue (#3b82f6)
- **Dark Colors**: Slate grays
- **Custom Theme**: Colors, animations, fonts
- **Responsive**: Mobile-first approach

### Dark Mode
- Toggle via Header button
- Persisted in localStorage
- Applied to entire app via `dark:` classes

## Performance Optimizations

1. **Code Splitting**: React Router lazy loading (to be implemented)
2. **Image Optimization**: Use next/image (after Next.js migration)
3. **Caching**: React Query with stale time settings
4. **Debouncing**: Search input debounced
5. **Virtualization**: For large lists (if needed)

## Error Handling

1. **ErrorBoundary** component catches React errors
2. **Axios interceptor** handles HTTP errors
3. **User feedback** via toast notifications (to be implemented)
4. **Fallback UI** for loading and error states

## Testing

To be implemented:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Cypress
- API mocking with MSW

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## Contributing

1. Create feature branch
2. Follow TypeScript strict mode
3. Use TailwindCSS for styling
4. Test components before committing
5. Update types as needed

## License

MIT
