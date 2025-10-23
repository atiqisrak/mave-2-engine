<!-- 59d9963f-ec0e-4766-88c5-b8d44a3677fc ccf931ca-6c23-482a-aad0-54f5a1762634 -->
# Multi-tenant Registration Journey Implementation

## Current State Analysis

**Existing Infrastructure:**

- ✅ Multi-tenant database schema with Organizations and Users
- ✅ Role-based access control (RBAC) with system roles: super-admin, admin, editor, contributor, viewer
- ✅ Auth service with registration, login, 2FA, password reset
- ✅ Email service (conditional on MAILING_SERVICE env var)
- ✅ Organization service with CRUD operations
- ❌ No invitation system
- ❌ No subdomain management
- ❌ No org-creation-during-registration flow

## Registration Journeys

### 1. Independent User → Organization Creator

**Flow:** User signs up → Creates organization + becomes org admin → Can invite team members

### 2. Invited Employee → Team Member

**Flow:** Receives invitation → Creates account → Joins existing organization → Gets assigned permissions

### 3. Super Admin → Platform Manager

**Flow:** Seeded via database → Full platform access → Manages all organizations

## Implementation Plan

### Phase 1: Database Schema Updates

**Add Invitation table to `schema.prisma`:**

```prisma
model Invitation {
  id             String    @id @default(uuid())
  organizationId String    @db.Uuid
  email          String?   // null for shareable links
  token          String    @unique
  roleId         String?   @db.Uuid // role to assign on acceptance
  invitedBy      String    @db.Uuid
  acceptedBy     String?   @db.Uuid
  acceptedAt     DateTime?
  expiresAt      DateTime
  status         String    @default("pending") // pending, accepted, expired, revoked
  type           String    @default("email") // email, link
  maxUses        Int?      // for shareable links
  usedCount      Int       @default(0)
  metadata       Json      @default("{}")
  createdAt      DateTime  @default(now())
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  inviter        User         @relation("InvitedBy", fields: [invitedBy], references: [id])
  accepter       User?        @relation("AcceptedBy", fields: [acceptedBy], references: [id])
  
  @@index([organizationId, status])
  @@index([token])
  @@index([email, status])
}
```

**Update Organization model** to track subdomains and add invitation relation.

**Migration:** Create and run migration for new schema.

### Phase 2: Invitations Module

**Create `/src/modules/invitations/` with:**

1. **InvitationsService** - Core logic:

   - `createEmailInvitation(orgId, email, roleId, invitedBy)` - Send email invitation
   - `createShareableInvitation(orgId, roleId, maxUses, invitedBy)` - Generate shareable link
   - `validateInvitation(token)` - Check if invitation is valid
   - `acceptInvitation(token, userId)` - Accept invitation and assign role
   - `revokeInvitation(invitationId)` - Cancel invitation
   - `resendInvitation(invitationId)` - Resend email
   - `listOrganizationInvitations(orgId, status?)` - Get all invitations

2. **InvitationsResolver** - GraphQL mutations/queries:

   - `inviteUserByEmail(orgId, email, roleId)`
   - `createShareableInviteLink(orgId, roleId, maxUses, expiresInDays)`
   - `acceptInvite(token, userInfo)` - Creates user account and accepts
   - `revokeInvite(invitationId)`
   - `resendInvite(invitationId)`
   - `getInvitation(token)` - For invitation landing page
   - `listInvitations(orgId, status, skip, take)`

3. **DTOs**: CreateInvitationInput, AcceptInvitationInput, etc.

4. **Email templates**: `invitation-email.hbs`, `invitation-accepted.hbs`

**Guard logic:** Only org admins can invite; check permissions.

### Phase 3: Enhanced Organization Registration

**Update AuthService:**

1. **New method** `registerWithOrganization(input)`:

   - Validate subdomain availability (check Organization.domain uniqueness)
   - Generate subdomain from org name (slugify, check uniqueness)
   - Create organization with subdomain
   - Create user as org creator
   - Assign "admin" role to user
   - Send welcome email
   - Return auth tokens + org info

2. **New method** `registerWithInvitation(token, userInput)`:

   - Validate invitation token
   - Check invitation hasn't expired or been used
   - Create user account in invitation's organization
   - Mark invitation as accepted
   - Assign role from invitation
   - Increment usedCount for shareable links
   - Send welcome email
   - Notify inviter (if email enabled)
   - Return auth tokens

**Update AuthResolver:**

- Add mutation `registerWithOrganization(input)`
- Add mutation `registerWithInvitation(token, userInput)`
- Keep existing `register(input)` for backward compatibility (requires organizationId)

**New DTOs:**

- `RegisterWithOrganizationInput`: name, slug, email, password, firstName, lastName, orgName, orgDomain
- `RegisterWithInvitationInput`: token, email, password, firstName, lastName, username

### Phase 4: Subdomain Management

**SubdomainService** (in organizations module):

1. `generateSubdomain(orgName)` - Create URL-safe slug
2. `checkSubdomainAvailability(subdomain)` - Verify uniqueness
3. `suggestAlternativeSubdomains(subdomain)` - If taken, suggest alternatives
4. `validateSubdomain(subdomain)` - Check format rules (alphanumeric, hyphens, length 3-63)
5. `getOrganizationBySubdomain(subdomain)` - Lookup for routing

**Validation rules:**

- 3-63 characters
- Lowercase alphanumeric + hyphens
- Cannot start/end with hyphen
- Reserved subdomains: www, api, admin, app, mail, ftp, etc.

**Update OrganizationsService:**

- Modify `create()` to auto-generate subdomain if not provided
- Add subdomain validation to all create/update operations

### Phase 5: Permission Guards & Role Management

**Update permissions seed** - Add invitation permissions:

```typescript
'invitations.create', 'invitations.view', 'invitations.revoke', 'invitations.manage'
```

**Update default roles:**

- `admin`: Full invitation permissions
- `editor`: View invitations only
- Others: No invitation access

**Create PermissionGuard decorator** for resolvers:

```typescript
@UseGuards(PermissionsGuard)
@RequirePermissions('invitations.create')
```

**Organization ownership check:**

- Org admin can only manage their own organization
- Super admin can manage all organizations

### Phase 6: Frontend Integration Support

**Add query resolvers:**

- `checkSubdomainAvailability(subdomain): Boolean`
- `getOrganizationBySubdomain(subdomain): Organization`
- `validateInvitationToken(token): InvitationValidation` - Returns invitation details for signup form

**Response types** to include:

- Subdomain in AuthResponse
- Organization details after registration
- Invitation metadata (inviter name, org name, role) for signup page

### Phase 7: Super Admin Seeding

**Update `prisma/seed.ts`:**

1. Create default super admin organization (system org):

   - Name: "System"
   - Slug: "system"
   - Domain: null (or "admin.xyz.com")

2. Create super admin user:

   - Email: from env var `SUPER_ADMIN_EMAIL` (default: admin@example.com)
   - Password: from env var `SUPER_ADMIN_PASSWORD` (hashed)
   - Assign super-admin role

3. Run seed on fresh installations automatically

**Environment variables:**

```
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=changeme123
BASE_DOMAIN=xyz.com
```

### Phase 8: Email Integration

**Update EmailService** - Add templates:

1. `sendInvitationEmail(email, inviterName, orgName, token, expiresAt)`
2. `sendInvitationAcceptedEmail(inviterEmail, acceptedUserName, orgName)`
3. `sendOrgCreationConfirmation(email, userName, orgName, subdomain)`

**Graceful degradation:** All emails should fail silently if `MAILING_SERVICE=disabled`.

### Phase 9: Testing & Validation

**GraphQL Queries/Mutations to test:**

1. Register with new organization
2. Invite user by email
3. Create shareable link
4. Accept invitation
5. Revoke invitation
6. Check subdomain availability
7. Super admin manages multiple orgs

**Edge cases:**

- Duplicate subdomains
- Expired invitations
- Max uses exceeded for shareable links
- Email already exists in organization
- Invalid invitation tokens

## Technical Considerations

**Subdomain Routing (Implementation Note):**

- Backend: Extract subdomain from request headers (`Host` header)
- Middleware/Guard to resolve organizationId from subdomain
- Frontend handles subdomain routing (out of scope for backend)

**Security:**

- Invitation tokens: JWT with 7-day expiry
- Rate limiting on invitation creation
- Email verification before full account activation (optional)
- CSRF protection on accept invitation endpoints

**Performance:**

- Index on Organization.domain for fast lookups
- Index on Invitation.token for validation
- Cache organization-subdomain mappings

**Database Indexes Already Present:**

- ✅ `@@unique` on Organization.slug and Organization.domain
- ✅ User scoped to organizationId
- Need: Invitation indexes (added in schema above)

## Files to Create/Modify

**New Files:**

- `src/modules/invitations/invitations.module.ts`
- `src/modules/invitations/invitations.service.ts`
- `src/modules/invitations/invitations.resolver.ts`
- `src/modules/invitations/dto/*.ts` (5 DTOs)
- `src/modules/invitations/entities/*.ts` (2 entities)
- `src/modules/invitations/guards/invitation-owner.guard.ts`
- `src/modules/organizations/services/subdomain.service.ts`
- `src/modules/email/templates/invitation-email.hbs`
- `src/modules/email/templates/invitation-accepted.hbs`
- `src/modules/email/templates/org-creation-confirmation.hbs`
- `src/common/guards/permissions.guard.ts`
- `src/common/decorators/require-permissions.decorator.ts`

**Modified Files:**

- `prisma/schema.prisma` - Add Invitation model, update Organization
- `prisma/seed.ts` - Add super admin seeding
- `src/modules/auth/auth.service.ts` - Add new registration methods
- `src/modules/auth/auth.resolver.ts` - Add new mutations
- `src/modules/auth/dto/*.ts` - Add new DTOs
- `src/modules/organizations/organizations.service.ts` - Add subdomain logic
- `src/modules/organizations/organizations.module.ts` - Add SubdomainService
- `src/modules/email/email.service.ts` - Add invitation emails
- `src/app.module.ts` - Import InvitationsModule
- `schema.gql` - Auto-generated from resolvers

## Environment Variables to Add

```env
# Super Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=SecurePassword123!

# Multi-tenancy
BASE_DOMAIN=xyz.com
RESERVED_SUBDOMAINS=www,api,admin,app,mail,ftp,smtp,cdn,static

# Invitations
INVITATION_TOKEN_EXPIRY=7d
INVITATION_MAX_USES=50
```

## Migration Steps

1. Update schema.prisma
2. Run `npx prisma migrate dev --name add_invitations_and_subdomains`
3. Update seed.ts with super admin
4. Run `npx prisma db seed`
5. Implement modules in order: Invitations → Enhanced Auth → Subdomain
6. Test each flow independently
7. Update Postman collection with new mutations

### To-dos

- [ ] Update Prisma schema with Invitation model and Organization subdomain fields
- [ ] Create and run database migration for new schema changes
- [ ] Create Invitations module with service, resolver, DTOs, and guards
- [ ] Implement SubdomainService for validation, generation, and availability checks
- [ ] Update AuthService with registerWithOrganization and registerWithInvitation methods
- [ ] Create permission guards and update role permissions for invitation management
- [ ] Create email templates for invitations and update EmailService
- [ ] Update seed script to create super admin user and system organization
- [ ] Test all registration flows and update Postman collection