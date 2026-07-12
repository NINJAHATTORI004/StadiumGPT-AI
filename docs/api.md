# API

Swagger is available at `/docs` when the backend is running.

## Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "organizer@stadiumgpt.ai",
  "password": "StadiumGPT2026!"
}
```

Responses include an access token, user profile, and role claims.

## Core Endpoints

| Area | Endpoint | Purpose |
| --- | --- | --- |
| Auth | `POST /api/auth/register` | Create user with initial role |
| Auth | `POST /api/auth/login` | Issue JWT |
| Users | `GET /api/users/me` | Current user profile |
| Operations | `GET /api/operations/dashboard/:role` | Role dashboard summary |
| Operations | `GET /api/operations/fan-context` | Fan route, gate, food, parking context |
| Incidents | `GET /api/operations/security-incidents` | Paginated incident list |
| Incidents | `POST /api/operations/security-incidents` | Create incident |
| Medical | `POST /api/operations/medical-requests` | Create medical request |
| Crowd | `GET /api/operations/crowd` | Live crowd readings |
| AI | `POST /api/ai/chat` | Role-aware assistant |
| AI | `POST /api/ai/transcribe` | Whisper speech-to-text |
| AI | `POST /api/ai/speak` | Text-to-speech |
| Notifications | `GET /api/notifications` | User notifications |
| Analytics | `GET /api/analytics/overview` | Executive metrics |

See [sample responses](api/sample-responses.json).

