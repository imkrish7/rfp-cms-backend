# RFP Contract Management System (Express + TypeScript + Prisma + npm)

**Tech**
- npm workspaces monorepo
- Express API (TypeScript), Prisma + PostgreSQL
- BullMQ + Redis workers (AI analysis & notifications)
- MinIO (S3-compatible) for documents
- JWT auth with RBAC guards
- Docker Compose dev stack

## Quick Start

```bash
# 1) Start stack
docker compose up -d --build

# 2) Health
curl http://localhost:3000/health

# 3) Seed admin
docker compose exec api npm run seed --workspace @rfp/api

# 4) Login
curl -X POST http://localhost:3000/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@acme.test","password":"admin123"}'
```

### Create RFP
```bash
curl -X POST http://localhost:3000/rfps  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"  -d '{"orgId":"00000000-0000-0000-0000-000000000001","title":"IT Services","description":"Need MSP for 24x7 ops","deadline":"2030-01-01T00:00:00.000Z","attachments":[] }'
```

### Notes
- Set `OPENAI_API_KEY` in compose to enable AI processing in worker.
- Dockerfiles copy root manifests first to leverage npm workspaces, then copy the repo.
- For local dev without Docker: `npm install` at repo root, then `npm run -w @rfp/api dev` and `npm run -w @rfp/worker dev`.
