# Security Policy

## Supported Version

Security fixes are applied to the current `main` branch.

## Reporting

Report vulnerabilities privately to `security@stadiumgpt.ai`. Include:

- Affected component.
- Reproduction steps.
- Expected and actual impact.
- Suggested remediation, if known.

## Controls

- Passwords are hashed with bcrypt.
- API access uses JWT bearer tokens and role-based authorization.
- Prisma parameterization is used for database access.
- Request bodies are validated with DTOs and class-validator.
- Helmet, CORS allowlists, throttling, output shaping, and audit logs are enabled.
- Secrets are supplied through environment variables and never committed.
- AI responses are constrained by role-specific system policies and emergency escalation rules.

