# Authentication & Authorization Test Guide

This guide provides test queries for the authentication and authorization system.

## Prerequisites

1. Start the server: `pnpm start:dev`
2. Ensure database is seeded: `pnpm prisma:seed`
3. Set JWT secrets in `.env` file

## Test Queries

### 1. Create an Organization

```graphql
mutation CreateOrganization {
  createOrganization(input: { name: "Test Organization", slug: "test-org", plan: "free" }) {
    id
    name
    slug
    plan
    isActive
    createdAt
  }
}
```

### 2. Register a User

```graphql
mutation RegisterUser {
  register(
    input: {
      organizationId: "YOUR_ORG_ID"
      email: "admin@test.com"
      password: "SecurePassword123"
      firstName: "Admin"
      lastName: "User"
    }
  ) {
    accessToken
    refreshToken
    user {
      id
      email
      firstName
      lastName
      organizationId
    }
  }
}
```

### 3. Login

```graphql
mutation Login {
  login(
    input: {
      organizationId: "YOUR_ORG_ID"
      emailOrUsername: "admin@test.com"
      password: "SecurePassword123"
    }
  ) {
    accessToken
    refreshToken
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

### 4. Refresh Token

```graphql
mutation RefreshToken {
  refreshToken(input: { refreshToken: "YOUR_REFRESH_TOKEN" }) {
    accessToken
    refreshToken
    user {
      id
      email
    }
  }
}
```

### 5. Get All Permissions

```graphql
query GetPermissions {
  permissions {
    id
    name
    slug
    module
    category
    riskLevel
    requiresMfa
  }
}
```

### 6. Get System Roles

```graphql
query GetSystemRoles {
  roles {
    id
    name
    slug
    description
    permissions
    color
    icon
    priority
    isSystem
    isDefault
  }
}
```

### 7. Create a Custom Role

```graphql
mutation CreateRole {
  createRole(
    input: {
      organizationId: "YOUR_ORG_ID"
      name: "Content Manager"
      slug: "content-manager"
      description: "Can manage all content"
      permissions: ["content.view", "content.create", "content.update", "content.delete"]
      color: "#8B5CF6"
      icon: "file-text"
      priority: 40
    }
  ) {
    id
    name
    slug
    permissions
  }
}
```

### 8. Assign Role to User

```graphql
mutation AssignRole {
  assignRole(input: { userId: "USER_ID", roleId: "ROLE_ID", scope: "global" }) {
    id
    userId
    roleId
    scope
    isActive
    assignedAt
  }
}
```

### 9. Get User Roles

```graphql
query GetUserRoles {
  userRoles(userId: "USER_ID") {
    id
    roleId
    scope
    isActive
    assignedAt
  }
}
```

### 10. Get User Permissions

```graphql
query GetUserPermissions {
  userPermissions(userId: "USER_ID")
}
```

### 11. Check User Permission

```graphql
query CheckPermission {
  checkPermission(userId: "USER_ID", permissionSlug: "content.create")
}
```

### 12. Get User with Protected Route (requires JWT)

Add header: `Authorization: Bearer YOUR_ACCESS_TOKEN`

```graphql
query GetMe {
  user(id: "YOUR_USER_ID") {
    id
    email
    firstName
    lastName
    status
    lastLoginAt
  }
}
```

### 13. Logout

Add header: `Authorization: Bearer YOUR_ACCESS_TOKEN`

```graphql
mutation Logout {
  logout
}
```

### 14. Request Password Reset

```graphql
mutation RequestPasswordReset {
  requestPasswordReset(organizationId: "YOUR_ORG_ID", email: "admin@test.com")
}
```

### 15. Reset Password

```graphql
mutation ResetPassword {
  resetPassword(resetToken: "YOUR_RESET_TOKEN", newPassword: "NewSecurePassword456")
}
```

## cURL Examples

### Register

```bash
curl -X POST http://localhost:7845/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(input: { organizationId: \"ORG_ID\", email: \"test@example.com\", password: \"Password123\", firstName: \"Test\", lastName: \"User\" }) { accessToken user { id email } } }"
  }'
```

### Login

```bash
curl -X POST http://localhost:7845/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { organizationId: \"ORG_ID\", emailOrUsername: \"test@example.com\", password: \"Password123\" }) { accessToken user { id email } } }"
  }'
```

### Get Permissions (with auth)

```bash
curl -X POST http://localhost:7845/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "query": "query { permissions { name slug module } }"
  }'
```

## Test Flow

1. **Create Organization** → Get org ID
2. **Register User** → Get access token & user ID
3. **Get System Roles** → Get role IDs
4. **Assign Role** → Assign admin role to user
5. **Get User Permissions** → Verify user has correct permissions
6. **Create Custom Role** → Create organization-specific role
7. **Test Protected Routes** → Use access token
8. **Refresh Token** → Test token refresh
9. **Logout** → Clean up session

## Default Roles & Permissions

### Roles

- **Super Admin**: All permissions
- **Admin**: Organization management, user management, content management
- **Editor**: Content management, can publish
- **Contributor**: Can create and edit content
- **Viewer**: Read-only access

### Permission Modules

- `organizations.*` - Organization management
- `users.*` - User management
- `roles.*` - Role management
- `permissions.*` - Permission management
- `content.*` - Content management
- `system.*` - System settings

## Notes

- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- Account locks after 5 failed login attempts for 30 minutes
- High-risk operations may require MFA (when implemented)
