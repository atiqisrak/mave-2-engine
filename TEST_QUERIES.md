# Mave CMS - Test Queries

## 🧪 Testing Your GraphQL API

Visit: **http://localhost:7845/graphql**

---

## Basic Health Check Queries

### Query 1: Health Check

```graphql
query {
  health
}
```

**Expected Response:**

```json
{
  "data": {
    "health": "OK"
  }
}
```

---

### Query 2: Hello World

```graphql
query {
  hello
}
```

**Expected Response:**

```json
{
  "data": {
    "hello": "Welcome to Mave CMS!"
  }
}
```

---

## REST API Tests

### Health Check (REST)

```bash
curl http://localhost:7845/api/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-21T...",
  "uptime": 123.456,
  "environment": "development"
}
```

---

### App Info (REST)

```bash
curl http://localhost:7845/api
```

**Expected Response:**

```json
{
  "name": "Mave CMS",
  "version": "0.1.0",
  "description": "Modern Headless CMS with MACH Architecture",
  "architecture": "MACH (Microservices, API-first, Cloud-native, Headless)",
  "endpoints": {
    "api": "/api",
    "graphql": "/graphql",
    "health": "/api/health"
  }
}
```

---

## 🎯 Next: Test Database Connection

Open Prisma Studio to see your database:

```bash
pnpm prisma studio
```

This opens a GUI at **http://localhost:5555** where you can:

- View all tables
- Add test data
- Run queries
- Inspect relationships

---

## 🧪 Verify Database Tables

In Prisma Studio, you should see these tables:

- ✅ organizations
- ✅ users
- ✅ roles
- ✅ user_roles
- ✅ permissions
- ✅ activity_log

---

## 🚀 Ready for Phase 1!

Your setup is complete! Next steps:

1. ✅ GraphQL API working
2. ✅ Database connected
3. ⬜ Build Authentication module
4. ⬜ Build RBAC system

See `TODO.md` for the complete roadmap!

---

**All systems operational! 🟢**
