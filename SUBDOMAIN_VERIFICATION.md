# Subdomain Organization Isolation Verification

## Backend Setup

### ✅ Completed

1. **SubdomainMiddleware** - Extracts subdomain and attaches organization context
2. **SubdomainOrganizationGuard** - Verifies user's org matches subdomain org
3. **Email domain validation** - Shows warning when email doesn't match org
4. **CORS configuration** - Allows wildcard subdomain origins
5. **Environment variables** - BASE_DOMAIN configured

### Test Scenarios

#### 1. Create Organizations

Create three test organizations with subdomains:

**Ethertech:**

```
Name: Ethertech
Slug: ethertech
Domain: ethertech
```

**Acme:**

```
Name: Acme Corp
Slug: acme
Domain: acme
```

**Webable:**

```
Name: Webable
Slug: webable
Domain: webable
```

#### 2. Create Users for Each Organization

**Ethertech User:**

- Email: user@ethertech.localhost
- Organization: ethertech

**Acme User:**

- Email: user@acme.localhost
- Organization: acme

**Webable User:**

- Email: user@webable.localhost
- Organization: webable

#### 3. Test Subdomain Isolation

##### Test 1: Correct Subdomain Access

1. Login as Ethertech user
2. Access http://ethertech.localhost:9614
3. **Expected**: Should work normally

##### Test 2: Wrong Subdomain Access

1. Login as Ethertech user
2. Try to access http://acme.localhost:9614
3. **Expected**: Should show "Access denied: You are trying to access Acme Corp but you belong to a different organization."

##### Test 3: Main Domain Access

1. Login as any user
2. Access http://localhost:9614
3. **Expected**: Should work (main domain allows all orgs)

#### 4. Server Logs Verification

When accessing with subdomain, you should see:

```
✓ Subdomain detected: ethertech → Organization: Ethertech
```

When trying to access wrong org:

```
→ ForbiddenException: Access denied: You are trying to access Acme Corp but you belong to a different organization.
```

## Frontend Setup (To Be Implemented)

### Current Status

- ✅ Subdomain utilities created
- ✅ Auth state includes subdomain tracking
- ⏳ Need: Frontend subdomain detection
- ⏳ Need: Auto-redirect to correct subdomain
- ⏳ Need: Show subdomain mismatch warning

### Frontend Implementation Needed

1. **Detect current subdomain** on page load
2. **Verify user's organization** matches subdomain
3. **Redirect** user to correct subdomain if mismatch
4. **Show warning** if email domain doesn't match

## Quick Test Commands

### 1. Test Subdomain Resolution

```bash
curl -H "Host: ethertech.localhost" http://localhost:7845/api/health
curl -H "Host: acme.localhost" http://localhost:7845/api/health
curl -H "Host: webable.localhost" http://localhost:7845/api/health
```

### 2. Test with GraphQL

```bash
# Login as ethertech user
curl -X POST http://ethertech.localhost:9614/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query":"{ me { id email organization { id name domain } } }"}'
```

Expected response should include `organization.domain = "ethertech"`

### 3. Test Wrong Subdomain

```bash
# Try to access acme subdomain as ethertech user
curl -X POST http://acme.localhost:9614/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ethertech_token>" \
  -d '{"query":"{ me { id } }"}'
```

Expected: 403 Forbidden error

## Current Backend Status

✅ **Ready for testing:**

- Subdomain middleware active
- Organization context attached to requests
- Email domain matching implemented
- CORS configured for wildcard subdomains

⚠️ **Needs guards on resolvers:**

- Need to add SubdomainOrganizationGuard to protected queries
- Need to verify GraphQL resolvers use org context

## Environment Configuration

Make sure your `.env` has:

```env
BASE_DOMAIN=localhost
ENABLE_SUBDOMAIN_ROUTING=true
NODE_ENV=development
CORS_ORIGIN=http://localhost:9614,http://ethertech.localhost:9614,http://acme.localhost:9614,http://webable.localhost:9614
```

## Next Steps

1. ✅ Backend subdomain infrastructure complete
2. ⏳ Add guards to GraphQL resolvers
3. ⏳ Implement frontend subdomain detection
4. ⏳ Add auto-redirect logic
5. ⏳ Test end-to-end flow
