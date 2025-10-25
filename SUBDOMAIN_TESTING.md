# Subdomain Testing Guide

This guide explains how to set up and test multi-tenant subdomain functionality on localhost.

## Quick Start

**Fastest way to set up subdomains:**

```bash
cd mave-2-engine
sudo ./setup-subdomains.sh
```

This script will:

- Create a backup of your `/etc/hosts` file
- Add all three test subdomains (ethertech, acme, webable)
- Skip entries that already exist
- Show you the URLs to access

## Setup Instructions

### 1. Configure Environment Variables

Update your `.env` file in the engine:

```env
BASE_DOMAIN=localhost
ENABLE_SUBDOMAIN_ROUTING=true
NODE_ENV=development
```

### 2. Configure Hosts File

**Current hosts file contents:**

```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
```

**Add subdomain entries to your `/etc/hosts` file:**

```bash
sudo nano /etc/hosts
```

**Add these lines at the end:**

```
127.0.0.1       ethertech.localhost
127.0.0.1       acme.localhost
127.0.0.1       webable.localhost
```

**Your complete `/etc/hosts` file should look like:**

```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
127.0.0.1       ethertech.localhost
127.0.0.1       acme.localhost
127.0.0.1       webable.localhost
```

Save and exit. The changes take effect immediately.

### 3. Verify Subdomain Resolution

Test if the subdomains resolve correctly:

```bash
ping ethertech.localhost
ping acme.localhost
ping webable.localhost
```

You should see responses from `127.0.0.1` for each subdomain.

## Testing Different Organizations

### Creating Organizations with Subdomains

When creating an organization:

1. **Auto-generated subdomain**: Leave subdomain field empty to auto-generate from organization name
2. **Custom subdomain**: Enter a custom subdomain (e.g., `acme`, `demo`)
3. Subdomain will be validated for availability and format

### Accessing Organization Subdomains

After creating an organization, access it via:

- Main domain: `http://localhost:9614`
- Organization subdomains:
  - `http://ethertech.localhost:9614`
  - `http://acme.localhost:9614`
  - `http://webable.localhost:9614`

The middleware will automatically:

- Extract the subdomain from the hostname
- Resolve the organization by subdomain
- Attach organization context to the request

## Test Scenarios

### Scenario 1: Create Organization "Ethertech"

1. Navigate to organization creation
2. Enter name: "Ethertech"
3. Use custom subdomain: `ethertech`
4. Verify availability
5. Create organization
6. Access at `http://ethertech.localhost:9614`

### Scenario 2: Create Organization "Acme Corp"

1. Navigate to organization creation
2. Enter name: "Acme Corp"
3. Use custom subdomain: `acme`
4. Verify availability
5. Create organization
6. Access at `http://acme.localhost:9614`

### Scenario 3: Create Organization "Webable"

1. Navigate to organization creation
2. Enter name: "Webable"
3. Use custom subdomain: `webable`
4. Verify availability
5. Create organization
6. Access at `http://webable.localhost:9614`

### Scenario 4: Email Domain Matching

1. Create organization "Ethertech" with subdomain `ethertech`
2. Register user with email `user@ethertech.localhost` → ✅ Match
3. Register user with email `user@gmail.com` → ⚠️ Warning shown (not enforced)

### Scenario 5: Multi-Organization Testing

1. Create all three test organizations:
   - Ethertech (`ethertech.localhost`)
   - Acme Corp (`acme.localhost`)
   - Webable (`webable.localhost`)
2. Access each subdomain separately
3. Verify organization isolation (data from one org doesn't show in another)
4. Users belong to their specific organization only

## Troubleshooting

### Subdomain Not Resolving

**Issue**: Cannot access test subdomains (ethertech.localhost, acme.localhost, webable.localhost)

**Solutions**:

1. Verify `/etc/hosts` entries are correct
2. Flush DNS cache: `sudo dscacheutil -flushcache` (macOS)
3. Restart browser
4. Try incognito/private browsing mode

### CORS Errors

**Issue**: CORS blocking requests from subdomain

**Solutions**:

1. Verify `BASE_DOMAIN` is set in `.env`
2. Check CORS configuration in `main.ts`
3. Ensure development mode is active

### Organization Not Found

**Issue**: Organization not resolving from subdomain

**Solutions**:

1. Verify organization has a `domain` field set
2. Check database: `SELECT * FROM organizations WHERE domain = 'acme'`
3. Ensure subdomain matches exactly (case-sensitive)

### Port Issues

**Issue**: Need to include port in URL

**Note**: Use `http://acme.localhost:9614` (with port) for local development

In production with proper DNS, this becomes `https://acme.xyz.com` (no port needed)

## Adding New Test Subdomains

1. Add entry to `/etc/hosts`:

   ```
   127.0.0.1 neworg.localhost
   ```

2. Restart services (if needed)

3. Create organization with `neworg` subdomain

4. Access at `http://neworg.localhost:9614`

## Production Setup

For production deployment:

1. Update `BASE_DOMAIN` to your actual domain:

   ```env
   BASE_DOMAIN=xyz.com
   ```

2. Configure DNS wildcard record:

   ```
   *.xyz.com → Your server IP
   ```

3. Set up SSL certificates for wildcard domain

4. Users can access: `https://acme.xyz.com`

## Common Commands

### List Organizations

```bash
# Using GraphQL
query {
  organizations {
    id
    name
    slug
    domain
  }
}
```

### Test Subdomain Resolution

```bash
# Test each subdomain
curl -H "Host: ethertech.localhost" http://localhost:9614
curl -H "Host: acme.localhost" http://localhost:9614
curl -H "Host: webable.localhost" http://localhost:9614
```

### View System Routes

```bash
npm run start:dev
# Server logs will show subdomain extraction
```

## Notes

- Localhost subdomains require `/etc/hosts` configuration
- Production subdomains require DNS wildcard configuration
- Email domain matching is informational only (not enforced)
- All subdomains share the same backend instance
- Organization isolation is enforced at database level
