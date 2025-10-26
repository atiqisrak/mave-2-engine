# Mave v2 Engine - Content Management Service

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.0-e10098.svg)](https://graphql.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

**Mave v2 Engine** is the core content management service for the Mave ecosystem. It provides flexible content modeling, content entries management, webhooks, and form submissions with GraphQL and REST APIs.

> **Note**: This service integrates with [mave-2-auth](https://github.com/atiqisrak/mave-2-auth) for authentication and RBAC. All content operations require a valid JWT token from the auth service.

## Features

### Content Management

- ✅ **Content Types** - Define flexible content structures
- ✅ **Content Entries** - CRUD operations for content
- ✅ **Version Control** - Track content changes with history
- ✅ **Draft/Published States** - Content lifecycle management
- ✅ **Content Scheduling** - Schedule publish/unpublish
- ✅ **Media Integration** - Integration with [mave-2-dam-engine](https://github.com/atiqisrak/mave-2-dam-engine)

### Webhooks

- ✅ **Event-Driven** - Subscribe to content events
- ✅ **Retry Logic** - Automatic retry for failed deliveries
- ✅ **Webhook Logs** - Track webhook delivery history
- ✅ **Custom Headers** - Configure custom headers per webhook
- ✅ **Secret Signing** - Secure webhook payloads

### Form Builder

- ✅ **Dynamic Forms** - Create forms dynamically
- ✅ **Form Submissions** - Handle form submissions
- ✅ **Email Notifications** - Auto-responses on submission
- ✅ **Webhook Integration** - Connect to third-party services
- ✅ **Submissions Analytics** - Track form performance

## Architecture

### Microservices Integration

```
┌─────────────────────────────────────────────────┐
│              Mave v2 Ecosystem                  │
└────────────────┬────────────────────────────────┘
                 │
        ┌─────────┴─────────┐
        ▼                     ▼
┌───────────────┐   ┌──────────────────┐
│  mave-2-auth  │──▶│  mave-2-engine   │◀─┐
│  (Auth/RBAC)  │   │  (Content Mgmt)  │  │
└───────────────┘   └──────────────────┘  │
                          │               │
                          ▼               │
                    ┌──────────────────┐  │
                    │  mave-2-cms      │  │
                    │  (Frontend)      │──┘
                    └──────────────────┘
```

### Authentication Flow

1. Frontend authenticates via `mave-2-auth`
2. Frontend receives JWT token
3. Frontend includes JWT token in all requests to `mave-2-engine`
4. `mave-2-engine` validates token with `mave-2-auth`
5. Request proceeds with authenticated user context

### Service Responsibilities

This service focuses on:

- **Content Types** - Schema definitions for content
- **Content Entries** - Actual content instances
- **Webhooks** - Event subscriptions and deliveries
- **Form Submissions** - Form data management

It delegates to other services:

- **Authentication** → `mave-2-auth`
- **Media Management** → `mave-2-dam-engine`
- **Page Building** → `mave-2-creator-studio-engine`

## Tech Stack

- **Framework**: NestJS 10+
- **Language**: TypeScript 5.0+
- **Database**: PostgreSQL 16+
- **ORM**: Prisma
- **API**: GraphQL + REST
- **Validation**: class-validator, class-transformer
- **Auth**: JWT validation via `mave-2-auth`

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- `mave-2-auth` service running
- pnpm (recommended)

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Seed database (optional)
pnpm prisma seed

# Start development server
pnpm start:dev
```

## Environment Variables

```env
# Server Configuration
PORT=7846
NODE_ENV=development
SERVICE_NAME=mave-2-engine

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mave_engine_db

# Auth Service (required)
AUTH_SERVICE_URL=http://localhost:7845

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# GraphQL Playground
ENABLE_GRAPHQL_PLAYGROUND=true

# Application URLs
APP_URL=http://localhost:7846
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### GraphQL API

The service exposes a GraphQL API at `/graphql`:

#### Content Types

- `query contentTypes` - List all content types
- `query contentType` - Get content type by ID/slug
- `mutation createContentType` - Create content type
- `mutation updateContentType` - Update content type
- `mutation deleteContentType` - Delete content type

#### Content Entries

- `query contentEntries` - List entries with filters
- `query contentEntry` - Get entry by ID
- `mutation createContentEntry` - Create entry
- `mutation updateContentEntry` - Update entry
- `mutation deleteContentEntry` - Delete entry
- `mutation publishContentEntry` - Publish entry
- `mutation unpublishContentEntry` - Unpublish entry

#### Webhooks

- `query webhooks` - List webhooks
- `query webhook` - Get webhook by ID
- `mutation createWebhook` - Create webhook
- `mutation updateWebhook` - Update webhook
- `mutation deleteWebhook` - Delete webhook
- `mutation testWebhook` - Test webhook delivery

#### Form Submissions

- `query formSubmissions` - List submissions
- `query formSubmission` - Get submission by ID
- `mutation submitForm` - Submit form data
- `mutation deleteFormSubmission` - Delete submission

### REST API

#### Health Check

```http
GET /health
```

#### Content Endpoints

```http
GET /api/v1/content-types
POST /api/v1/content-types
GET /api/v1/content-types/:id
PUT /api/v1/content-types/:id
DELETE /api/v1/content-types/:id

GET /api/v1/content-entries
POST /api/v1/content-entries
GET /api/v1/content-entries/:id
PUT /api/v1/content-entries/:id
DELETE /api/v1/content-entries/:id
POST /api/v1/content-entries/:id/publish
POST /api/v1/content-entries/:id/unpublish
```

## Authentication

All requests require a valid JWT token from `mave-2-auth`:

```http
Authorization: Bearer <jwt-token>
```

The service validates tokens by calling:

```
POST {AUTH_SERVICE_URL}/api/v1/auth/validate-token
```

And extracts:

- User ID and details
- Organization ID
- User roles
- User permissions

## Database Schema

The engine manages:

- **ContentType**: Content type definitions
- **ContentEntry**: Content entries with JSONB data
- **Webhook**: Webhook configurations
- **WebhookLog**: Webhook delivery logs
- **FormSubmission**: Form submission data

User and organization data is managed by `mave-2-auth`.

## Development

```bash
# Start development server
pnpm start:dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Prisma Studio
pnpm prisma studio

# Generate Prisma client
pnpm prisma generate
```

## Deployment

### Production Checklist

- [ ] Configure PostgreSQL with proper indexes
- [ ] Set up connection to `mave-2-auth`
- [ ] Configure SSL/TLS
- [ ] Set up rate limiting
- [ ] Configure monitoring and logging
- [ ] Set up backup strategy
- [ ] Configure CORS for production domains
- [ ] Enable HTTPS

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 7846

CMD ["node", "dist/main.js"]
```

## Related Services

- **[mave-2-auth](https://github.com/atiqisrak/mave-2-auth)** - Authentication and RBAC
- **[mave-2-cms](https://github.com/atiqisrak/mave-2-cms)** - Frontend dashboard
- **[mave-2-dam-engine](https://github.com/atiqisrak/mave-2-dam-engine)** - Media management
- **[mave-2-creator-studio-engine](https://github.com/atiqisrak/mave-2-creator-studio-engine)** - Page builder

## License

MIT License - see LICENSE file

## Author

**Atiq Israk** - [@atiqisrak](https://github.com/atiqisrak)
