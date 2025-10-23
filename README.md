# Mave CMS - Headless CMS Platform

> **MACH Architecture**: Microservices, API-first, Cloud-native, Headless

A modern, scalable, enterprise-grade headless CMS built with NestJS, GraphQL, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.0-e10098.svg)](https://graphql.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

---

## 🚀 Features

### Core Features

- ✅ **Multi-Tenancy** - Full organization isolation
- ✅ **Advanced RBAC/ABAC** - Role & Attribute-Based Access Control
- ✅ **Flexible Content Modeling** - Create any content structure
- ✅ **GraphQL & REST APIs** - Choose your preferred API style
- ✅ **Real-time Updates** - WebSocket support
- ✅ **Webhook System** - Event-driven integrations

### Content Management

- 📝 **Rich Content Editor** - Powerful content editing
- 🔄 **Version Control** - Track all content changes
- 🌍 **Internationalization** - Multi-language support
- 📅 **Content Scheduling** - Publish on schedule
- 🔍 **Full-Text Search** - Find content instantly
- 🏷️ **Tagging & Taxonomy** - Organize content

### Digital Asset Management

- 🖼️ **Image Optimization** - Auto WebP/AVIF conversion
- 📦 **CDN Integration** - Global content delivery
- 🎥 **Video Support** - Video management
- 🔒 **Signed URLs** - Secure asset access
- 📊 **Asset Analytics** - Track usage

### Form Builder

- 📋 **Drag-and-Drop Forms** - Visual form builder
- ✅ **Conditional Logic** - Smart forms
- 📧 **Email Notifications** - Auto-responses
- 📊 **Submissions Analytics** - Track performance
- 🔗 **Third-Party Integrations** - Connect anywhere

### Security

- 🔐 **JWT Authentication** - Secure auth
- 🔑 **2FA/MFA** - Multi-factor authentication
- 🛡️ **Rate Limiting** - DDoS protection
- 📋 **Audit Logging** - Track everything
- 🔒 **Encryption** - At rest and in transit

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                    │
│  (Web, Mobile, IoT, Third-party integrations)            │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Nginx)                    │
│            Load Balancer & Reverse Proxy                 │
└───────────────┬─────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│   GraphQL    │  │   REST API   │
│   Endpoint   │  │   Endpoints  │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                ▼
┌─────────────────────────────────────────────────────────┐
│              NestJS Application (Cluster)                │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │   Auth     │   RBAC     │  Content   │   Media    │  │
│  │  Module    │  Module    │  Module    │  Module    │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │   Forms    │  Webhooks  │ Analytics  │  Settings  │  │
│  │  Module    │  Module    │  Module    │  Module    │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
└───────┬─────────────┬───────────────┬──────────────────┘
        │             │               │
        ▼             ▼               ▼
┌──────────────┐ ┌──────────┐  ┌────────────┐
│  PostgreSQL  │ │  Redis   │  │  S3/CDN    │
│  (Primary)   │ │ (Cache)  │  │  (Assets)  │
└──────────────┘ └──────────┘  └────────────┘
```

---

## 📋 Prerequisites

- **Node.js** 20.x LTS
- **pnpm** 8.x or higher
- **PostgreSQL** 16+ (or access to remote PostgreSQL)
- **Redis** 7.x (optional for local development)
- **Git**

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd cms-engine
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development Server

```bash
pnpm run start:dev
```

Visit:

- 🌐 API: http://localhost:3000
- 🎮 GraphQL Playground: http://localhost:3000/graphql
- 📊 Prisma Studio: `npx prisma studio`

---

## 📚 Documentation

- [Local Setup Guide](./LOCAL_SETUP.md)
- [Migration Plan](./REVISED_MIGRATION_PLAN.md)
- [Database Schema](./DATABASE_SCHEMA_MAPPING.md)
- [TODO & Roadmap](./TODO.md)

---

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run start          # Start server
pnpm run start:dev      # Start with hot reload
pnpm run start:debug    # Start with debugging
pnpm run start:prod     # Start production build

# Build
pnpm run build          # Build for production
pnpm run build:watch    # Build with watch mode

# Testing
pnpm run test           # Run unit tests
pnpm run test:watch     # Run tests in watch mode
pnpm run test:cov       # Run tests with coverage
pnpm run test:e2e       # Run end-to-end tests

# Code Quality
pnpm run lint           # Lint code
pnpm run format         # Format code

# Database
npx prisma migrate dev  # Create new migration
npx prisma migrate deploy # Deploy migrations
npx prisma studio       # Open database GUI
npx prisma generate     # Generate Prisma Client
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

---

## 🚢 Deployment

### Production Build

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start:prod
```

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all
```

### Docker Deployment (Coming Soon)

```bash
# Build Docker image
docker build -t mave-cms .

# Run container
docker-compose up -d
```

---

## 🌳 Project Structure

```
cms-engine/
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── src/
│   ├── main.ts            # Application entry point
│   ├── app.module.ts      # Root module
│   ├── common/            # Shared utilities
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── filters/
│   ├── config/            # Configuration
│   ├── database/          # Database service
│   └── modules/           # Feature modules
│       ├── auth/          # Authentication
│       ├── rbac/          # Access control
│       ├── organizations/ # Multi-tenancy
│       ├── users/         # User management
│       ├── content/       # Content management
│       ├── media/         # Asset management
│       └── forms/         # Form builder
├── test/                  # Tests
├── docs/                  # Documentation
├── env.example           # Environment template
├── ecosystem.config.js    # PM2 configuration
├── nest-cli.json          # NestJS CLI config
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database ORM: [Prisma](https://www.prisma.io/)
- GraphQL: [Apollo Server](https://www.apollographql.com/)
- Inspired by modern headless CMS platforms

---

## 📞 Support

- 📧 Email: support@mave.io
- 💬 Discord: [Join our community](https://discord.gg/mave)
- 📖 Documentation: [docs.mave.io](https://docs.mave.io)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/mave-cms/issues)

---

## 🗺️ Roadmap

- [x] Phase 0: Foundation & Planning
- [ ] Phase 1: Authentication & RBAC
- [ ] Phase 2: Content Management Core
- [ ] Phase 3: Digital Asset Management
- [ ] Phase 4: Form Builder
- [ ] Phase 5: Webhooks & Real-time
- [ ] Phase 6: Search & Discovery
- [ ] Phase 7: Analytics & Reporting

See [TODO.md](./TODO.md) for detailed roadmap.

---

**Made with ❤️ by the Mave Team**
