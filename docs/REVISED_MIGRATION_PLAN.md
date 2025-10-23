# CMS Engine - Product-Led Migration Plan

## Enterprise-Grade Scalable Backend Platform

**Document Version**: 2.0  
**Last Updated**: October 21, 2025  
**Role**: Product Lead Engineer

---

## Executive Summary

This is a **complete reimagining** of the migration—not just a Laravel-to-NestJS conversion, but building a **modern, enterprise-grade platform** from the ground up with:

1. **Advanced RBAC/ABAC System** - Industry-leading authorization
2. **Multi-Tenancy Architecture** - Organization isolation built-in
3. **Scalable Form Builder** - Dynamic, extensible form platform
4. **Enterprise Media Management** - CDN-integrated, optimized storage
5. **Dynamic Entity System** - Extend the platform without code changes
6. **Real-time Analytics** - Actionable insights and monitoring

**Philosophy**: Build for scale from day one. Make the right choice today, not the easy one.

---

## Core Principles

### 1. **Scalability First**

- **Horizontal scaling**: Stateless services, no sticky sessions
- **Event-driven**: Decouple services for independent scaling
- **Caching strategy**: Multi-layer (memory, Redis, CDN)
- **Database optimization**: Proper indexing, partitioning, read replicas

### 2. **Security by Design**

- **Zero-trust**: Verify everything, trust nothing
- **Fine-grained permissions**: ABAC + RBAC combined
- **Audit everything**: Complete audit trail for compliance
- **Encryption**: At rest (database) and in transit (TLS 1.3)

### 3. **Developer Experience**

- **Type-safety**: TypeScript strict mode everywhere
- **Auto-documentation**: GraphQL introspection + Swagger
- **Testing**: Unit + Integration + E2E coverage
- **Local dev**: Docker Compose for instant environment

### 4. **Performance Obsessed**

- **<100ms API responses**: 95th percentile target
- **Query optimization**: DataLoader, query batching
- **Smart caching**: Cache invalidation patterns
- **CDN integration**: Static assets globally distributed

---

## Technology Stack (Production-Ready)

### Backend Core

- **Framework**: NestJS 10.x (TypeScript 5.x)
- **API Layer**: GraphQL (Apollo Server 4) + REST (critical endpoints)
- **Database**: PostgreSQL 16 + pgvector (AI/ML ready)
- **ORM**: Prisma 5.x (superior type safety vs TypeORM)
- **Cache**: Redis 7.x with clustering support
- **Queue**: BullMQ (Redis-based, scalable job processing)
- **Search**: Elasticsearch 8.x OR Meilisearch (cost-effective alternative)

### Security & Authentication

- **Auth**: Passport.js + JWT (short-lived) + Refresh Tokens (rotating)
- **Authorization**: Custom RBAC + CASL for ABAC
- **Password**: Argon2 (modern, more secure than bcrypt)
- **Rate Limiting**: Redis-based sliding window algorithm
- **2FA**: Time-based OTP (TOTP) support

### Storage & Media

- **Primary**: AWS S3 / Cloudflare R2 / MinIO (self-hosted)
- **Processing**: Sharp (WebP, AVIF conversion)
- **CDN**: CloudFront / Cloudflare (automatic)
- **Validation**: Magic bytes + file type verification

### Observability Stack

- **Logging**: Winston → Elasticsearch (ELK Stack)
- **Metrics**: Prometheus + Grafana dashboards
- **Tracing**: OpenTelemetry + Jaeger
- **APM**: DataDog / New Relic / Elastic APM
- **Errors**: Sentry with source maps

### Infrastructure

- **Containers**: Docker + multi-stage builds
- **Orchestration**: Kubernetes (production) / Docker Compose (dev)
- **CI/CD**: GitHub Actions with automated deployments
- **IaC**: Terraform for reproducible infrastructure
- **Secrets**: HashiCorp Vault / AWS Secrets Manager

---

## Project Architecture

```
cms-engine/
├── apps/
│   └── api/                        # Main API application
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   └── modules/
│       │       ├── auth/           # Authentication & JWT
│       │       ├── rbac/           # RBAC/ABAC engine
│       │       ├── organizations/  # Multi-tenancy
│       │       ├── users/          # User management
│       │       ├── forms/          # Form builder platform
│       │       ├── submissions/    # Form submissions
│       │       ├── media/          # Media management
│       │       ├── content/        # News, events, etc.
│       │       ├── analytics/      # Analytics & reporting
│       │       ├── dynamic/        # Dynamic entities
│       │       ├── notifications/  # Email, push, SMS
│       │       ├── audit/          # Audit logging
│       │       └── settings/       # System settings
│       └── test/
├── libs/                           # Shared libraries
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── filters/
│   │   └── utils/
│   ├── database/
│   │   ├── prisma/
│   │   └── repositories/
│   ├── rbac/                       # RBAC/ABAC library
│   │   ├── services/
│   │   ├── guards/
│   │   ├── decorators/
│   │   └── interfaces/
│   ├── events/                     # Event bus
│   │   ├── emitters/
│   │   └── listeners/
│   ├── security/
│   │   ├── encryption/
│   │   ├── hashing/
│   │   └── validation/
│   └── testing/
│       ├── fixtures/
│       └── mocks/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
├── k8s/                            # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── configmap.yaml
├── scripts/
│   ├── migrate-data.ts
│   ├── seed-prod.ts
│   └── backup.sh
├── docs/
│   ├── api/
│   ├── architecture/
│   └── guides/
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

---

## Part 1: Enterprise RBAC/ABAC System

### Why This Matters

Traditional RBAC (Role-Based Access Control) isn't enough for modern applications. We need:

- **Contextual permissions**: "Can edit forms they created"
- **Time-based access**: "Access expires after 30 days"
- **Conditional logic**: "Can approve if department = 'finance' AND level >= 3"
- **Resource-level control**: Per-item permissions

### Solution: Hybrid RBAC + ABAC

We'll build a system that supports:

1. **Traditional RBAC**: Roles → Permissions (fast, simple)
2. **ABAC**: Attribute-based rules (flexible, powerful)
3. **Resource Permissions**: Per-entity access control
4. **Permission Policies**: Complex conditional logic
5. **Hierarchical Roles**: Role inheritance
6. **Scoped Permissions**: Global, organization, or resource-level

---

### Database Schema (PostgreSQL)

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Better indexing

-- ============================================
-- MULTI-TENANCY
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255) UNIQUE,  -- Custom domain support

  -- Subscription
  plan VARCHAR(50) DEFAULT 'free',
  plan_limits JSONB DEFAULT '{}',
  trial_ends_at TIMESTAMPTZ,

  -- Settings
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_plan CHECK (plan IN ('free', 'starter', 'professional', 'enterprise'))
);

CREATE INDEX idx_orgs_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_orgs_domain ON organizations(domain) WHERE deleted_at IS NULL;
CREATE INDEX idx_orgs_active ON organizations(is_active) WHERE deleted_at IS NULL;

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identity
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,

  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,

  -- Security
  email_verified_at TIMESTAMPTZ,
  email_verification_token VARCHAR(255),

  -- 2FA
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes TEXT[],

  -- Password Reset
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMPTZ,

  -- Account Security
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  last_login_ip INET,
  last_activity_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) DEFAULT 'active',
  is_system BOOLEAN DEFAULT FALSE,

  -- Preferences
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en',
  preferences JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_email_per_org UNIQUE (organization_id, email),
  CONSTRAINT unique_username_per_org UNIQUE (organization_id, username),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'invited'))
);

CREATE INDEX idx_users_org ON users(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_activity ON users(last_activity_at DESC);

-- Full-text search on user data
CREATE INDEX idx_users_search ON users USING GIN (
  to_tsvector('english',
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name, '') || ' ' ||
    coalesce(email, '') || ' ' ||
    coalesce(username, '')
  )
);

-- ============================================
-- ROLES & PERMISSIONS
-- ============================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identity
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 0,
  path LTREE,  -- For efficient hierarchy queries

  -- Type
  role_type VARCHAR(50) DEFAULT 'custom',
  is_system BOOLEAN DEFAULT FALSE,
  is_assignable BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,

  -- Permissions (array of slugs)
  permissions TEXT[] DEFAULT '{}',

  -- UI
  color VARCHAR(20),
  icon VARCHAR(50),
  priority INTEGER DEFAULT 0,

  -- Limits
  max_users INTEGER,  -- Max users that can have this role

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_slug_per_org UNIQUE NULLS NOT DISTINCT (organization_id, slug),
  CONSTRAINT valid_role_type CHECK (role_type IN ('system', 'custom', 'auto'))
);

CREATE INDEX idx_roles_org ON roles(organization_id);
CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_parent ON roles(parent_role_id);
CREATE INDEX idx_roles_level ON roles(level);
CREATE INDEX idx_roles_path ON roles USING GIST (path);
CREATE INDEX idx_roles_permissions ON roles USING GIN (permissions);
CREATE INDEX idx_roles_default ON roles(is_default) WHERE is_default = TRUE;

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,

  -- Categorization
  module VARCHAR(100) NOT NULL,
  category VARCHAR(100),

  -- Type
  permission_type VARCHAR(50) DEFAULT 'action',

  -- Dependencies
  depends_on TEXT[],
  conflicts_with TEXT[],

  -- Risk & Security
  risk_level VARCHAR(20) DEFAULT 'low',
  requires_mfa BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,

  -- Status
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_deprecated BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_permission_type CHECK (permission_type IN ('action', 'resource', 'field', 'data', 'api')),
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_slug ON permissions(slug);
CREATE INDEX idx_permissions_type ON permissions(permission_type);
CREATE INDEX idx_permissions_depends ON permissions USING GIN (depends_on);
CREATE INDEX idx_permissions_active ON permissions(is_active, is_deprecated);

-- ============================================
-- USER ROLES (Many-to-Many with context)
-- ============================================

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,

  -- Scope
  scope VARCHAR(50) DEFAULT 'global',
  resource_type VARCHAR(100),
  resource_id UUID,

  -- Conditions
  conditions JSONB DEFAULT '{}',

  -- Temporal
  starts_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ,

  -- Assignment info
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_reason TEXT,
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_role_scope UNIQUE (user_id, role_id, scope, resource_type, resource_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_user_roles_role ON user_roles(role_id) WHERE is_active = TRUE;
CREATE INDEX idx_user_roles_scope ON user_roles(scope, resource_type, resource_id);
CREATE INDEX idx_user_roles_expires ON user_roles(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_roles_active_valid ON user_roles(user_id, is_active)
  WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

-- ============================================
-- ABAC: PERMISSION POLICIES
-- ============================================

CREATE TABLE permission_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(100) UNIQUE,  -- For programmatic reference

  -- Target
  resource_type VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,

  -- Effect
  effect VARCHAR(20) NOT NULL DEFAULT 'allow',

  -- Priority (higher = evaluated first)
  priority INTEGER DEFAULT 0,

  -- Conditions (JSON-based rules)
  conditions JSONB NOT NULL,
  /* Example:
  {
    "user": {
      "department": "engineering",
      "level": { "$gte": 3 },
      "metadata.certified": true
    },
    "resource": {
      "status": { "$in": ["draft", "pending"] },
      "owner_id": { "$eq": "$user.id" }
    },
    "environment": {
      "time": { "$between": ["09:00", "17:00"] },
      "day_of_week": { "$nin": ["saturday", "sunday"] },
      "ip": { "$in_cidr": ["10.0.0.0/8", "192.168.0.0/16"] }
    }
  }
  */

  -- Scope
  applies_to VARCHAR(50) DEFAULT 'all',
  organization_ids UUID[],
  role_ids UUID[],
  user_ids UUID[],

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_enforced BOOLEAN DEFAULT TRUE,

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_effect CHECK (effect IN ('allow', 'deny')),
  CONSTRAINT valid_applies_to CHECK (applies_to IN ('all', 'organizations', 'roles', 'users'))
);

CREATE INDEX idx_policies_org ON permission_policies(organization_id);
CREATE INDEX idx_policies_resource_action ON permission_policies(resource_type, action);
CREATE INDEX idx_policies_priority ON permission_policies(priority DESC) WHERE is_active = TRUE;
CREATE INDEX idx_policies_conditions ON permission_policies USING GIN (conditions);
CREATE INDEX idx_policies_active ON permission_policies(is_active, is_enforced);

-- ============================================
-- RESOURCE-LEVEL PERMISSIONS
-- ============================================

CREATE TABLE resource_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Resource
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID NOT NULL,

  -- Subject (who has the permission)
  subject_type VARCHAR(50) NOT NULL,
  subject_id UUID NOT NULL,

  -- Permission
  permission_slug VARCHAR(100) NOT NULL,

  -- Inheritance
  inherited_from UUID REFERENCES resource_permissions(id) ON DELETE CASCADE,
  is_inherited BOOLEAN DEFAULT FALSE,

  -- Conditions
  conditions JSONB DEFAULT '{}',

  -- Temporal
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  revoke_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_subject_type CHECK (subject_type IN ('user', 'role', 'group', 'organization', 'public')),
  CONSTRAINT unique_resource_subject_permission UNIQUE (resource_type, resource_id, subject_type, subject_id, permission_slug)
);

CREATE INDEX idx_resource_perms_resource ON resource_permissions(resource_type, resource_id);
CREATE INDEX idx_resource_perms_subject ON resource_permissions(subject_type, subject_id);
CREATE INDEX idx_resource_perms_permission ON resource_permissions(permission_slug);
CREATE INDEX idx_resource_perms_active ON resource_permissions(is_active)
  WHERE (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) AND revoked_at IS NULL;
CREATE INDEX idx_resource_perms_inheritance ON resource_permissions(inherited_from) WHERE inherited_from IS NOT NULL;

-- ============================================
-- PERMISSION GROUPS (For easier management)
-- ============================================

CREATE TABLE permission_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Identity
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,

  -- Permissions
  permission_slugs TEXT[] NOT NULL,

  -- Members
  user_ids UUID[],
  role_ids UUID[],

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_group_slug_per_org UNIQUE (organization_id, slug)
);

CREATE INDEX idx_perm_groups_org ON permission_groups(organization_id);
CREATE INDEX idx_perm_groups_permissions ON permission_groups USING GIN (permission_slugs);
CREATE INDEX idx_perm_groups_users ON permission_groups USING GIN (user_ids);
CREATE INDEX idx_perm_groups_roles ON permission_groups USING GIN (role_ids);

-- ============================================
-- AUDIT TRAIL
-- ============================================

CREATE TABLE permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  session_id VARCHAR(100),

  -- What
  action VARCHAR(100) NOT NULL,
  permission_slug VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id UUID,

  -- Result
  result VARCHAR(20) NOT NULL,
  reason TEXT,

  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  request_method VARCHAR(10),
  request_path TEXT,

  -- Policy evaluation
  policies_evaluated JSONB,
  evaluation_time_ms INTEGER,
  cache_hit BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_result CHECK (result IN ('allow', 'deny', 'error'))
) PARTITION BY RANGE (created_at);

-- Create partitions (monthly)
CREATE TABLE permission_audit_log_2024_10 PARTITION OF permission_audit_log
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE permission_audit_log_2024_11 PARTITION OF permission_audit_log
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
-- Add more partitions as needed

CREATE INDEX idx_perm_audit_user ON permission_audit_log(user_id, created_at DESC);
CREATE INDEX idx_perm_audit_resource ON permission_audit_log(resource_type, resource_id);
CREATE INDEX idx_perm_audit_created ON permission_audit_log(created_at DESC);
CREATE INDEX idx_perm_audit_result ON permission_audit_log(result);
CREATE INDEX idx_perm_audit_org ON permission_audit_log(organization_id);

-- Activity log for general actions
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Action
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  entity_name VARCHAR(255),

  -- Changes
  changes JSONB,
  previous_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  request_id VARCHAR(100),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create partitions (monthly)
CREATE TABLE activity_log_2024_10 PARTITION OF activity_log
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE activity_log_2024_11 PARTITION OF activity_log
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_org ON activity_log(organization_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: User permissions (materialized for performance)
CREATE MATERIALIZED VIEW user_permissions_cache AS
SELECT
  u.id as user_id,
  u.organization_id,
  r.id as role_id,
  r.slug as role_slug,
  unnest(r.permissions) as permission_slug,
  ur.scope,
  ur.resource_type,
  ur.resource_id,
  ur.expires_at
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE
  u.deleted_at IS NULL
  AND ur.is_active = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP);

CREATE UNIQUE INDEX ON user_permissions_cache (user_id, permission_slug, role_id, scope, COALESCE(resource_type, ''), COALESCE(resource_id::text, ''));
CREATE INDEX idx_upc_user ON user_permissions_cache(user_id);
CREATE INDEX idx_upc_org ON user_permissions_cache(organization_id);
CREATE INDEX idx_upc_permission ON user_permissions_cache(permission_slug);

-- Refresh function (call periodically or on permission changes)
CREATE OR REPLACE FUNCTION refresh_user_permissions_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_permissions_cache;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_policies_updated_at BEFORE UPDATE ON permission_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_groups_updated_at BEFORE UPDATE ON permission_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update last_activity_at on users
CREATE OR REPLACE FUNCTION update_user_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET last_activity_at = CURRENT_TIMESTAMP WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_activity_on_audit
  AFTER INSERT ON permission_audit_log
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION update_user_last_activity();

-- Refresh materialized view on permission changes
CREATE OR REPLACE FUNCTION refresh_permissions_on_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_user_permissions_cache();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_perms_on_role_change
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_permissions_on_change();
```

This is comprehensive! Should I continue with:

1. The complete NestJS implementation of the RBAC/ABAC system
2. Form Builder module with advanced features
3. Media management with CDN
4. Complete migration timeline and deployment strategy?
