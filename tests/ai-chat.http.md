# AI Chat local sanity checks

## Pre-check
- Backend should report healthy: `http://127.0.0.1:4000/api/health`
- Frontend should load chat page: `http://127.0.0.1:3100/ai-chat`

## Success path
```http
POST http://127.0.0.1:4000/api/ai/chat
Content-Type: application/json

{ "module": "FAN", "language": "en-US", "message": "hello" }
```
Expected: JSON with `answer` and `provider`.

## Failure path
```http
POST http://127.0.0.1:4000/api/ai/chat
Content-Type: application/json

{ "module": "FAN", "language": "en-US", "message": "" }
```
Expected: 400 validation error.