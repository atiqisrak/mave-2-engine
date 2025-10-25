# Subdomain Setup Instructions

This guide explains how to configure and use the multi-tenant subdomain system.

## Overview

The multi-tenant subdomain system allows each organization to have its own subdomain. For example:

- Main domain: `xyz.com`
- Organization subdomains: `acme.xyz.com`, `company.xyz.com`, etc.

## Backend Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Base domain for subdomain routing
BASE_DOMAIN=localhost

# Enable subdomain routing
ENABLE_SUBDOMAIN_ROUTING=true

# Reserved subdomains (comma-separated)
RESERVED_SUBDOMAINS=www,api,admin,mail
```

### Production Setup

For production:

```env
BASE_DOMAIN=xyz.com
ENABLE_SUBDOMAIN_ROUTING=true
RESERVED_SUBDOMAINS=www,api,admin,mail,cdn,static
```

### DNS Configuration

Configure a wildcard DNS record:

```
*.xyz.com → Your server IP
```

This ensures all subdomains resolve to your server.

### SSL Certificates

For production, set up SSL certificates for wildcard domains:

```bash
# Using Let's Encrypt with Certbot
certbot certonly --manual --preferred-challenges dns \
  -d "*.xyz.com" -d "xyz.com"
```

Or use cloud providers:

- **Cloudflare**: Free wildcard SSL
- **AWS Certificate Manager**: Wildcard certificates
- **Let's Encrypt**: Free wildcard SSL (with DNS challenge)

## Frontend Configuration

### Next.js Middleware

The frontend automatically detects and handles subdomains. No additional configuration needed.

### Testing on Localhost

**Option 1: Use the setup script (recommended)**

```bash
cd mave-2-engine
sudo ./setup-subdomains.sh
```

**Option 2: Manual setup**

1. Add entries to `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

Add these lines at the end of your existing hosts file:

```
127.0.0.1       ethertech.localhost
127.0.0.1       acme.localhost
127.0.0.1       webable.localhost
```

**Your `/etc/hosts` file should look like:**

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

2. Access organizations:

- Main site: `http://localhost:9614`
- Test organizations:
  - `http://ethertech.localhost:9614`
  - `http://acme.localhost:9614`
  - `http://webable.localhost:9614`

## API Usage

### GraphQL Queries

All queries automatically use the subdomain context when available:

```graphql
query {
  me {
    id
    email
    organization {
      id
      name
      domain
    }
  }
}
```

### REST API

The subdomain middleware automatically extracts organization context from the `Host` header.

## Organization Management

### Creating Organizations with Subdomains

When creating an organization, you can:

1. **Auto-generate subdomain** from organization name
2. **Use custom subdomain** by specifying it

```graphql
mutation CreateOrganization($input: CreateOrganizationInput!) {
  createOrganization(input: $input) {
    id
    name
    slug
    domain
  }
}
```

**Input** (Example for Ethertech):

```json
{
  "input": {
    "name": "Ethertech",
    "slug": "ethertech",
    "customSubdomain": "ethertech",
    "autoGenerateSubdomain": false
  }
}
```

Similar for Acme Corp and Webable with their respective subdomains.

### Email Domain Matching

When users register, their email domain is checked against the organization subdomain:

- ✅ Match: `user@ethertech.localhost` for organization `ethertech` (testing)
- ✅ Match: `user@acme.xyz.com` for organization `acme` (production)
- ⚠️ Mismatch: `user@gmail.com` for any organization (warning shown, not enforced)

## Testing

See [SUBDOMAIN_TESTING.md](./SUBDOMAIN_TESTING.md) for detailed testing instructions.

## Troubleshooting

### Subdomain Not Working

1. Check DNS resolution: `nslookup acme.xyz.com`
2. Verify environment variables
3. Check subdomain middleware is loaded

### CORS Errors

1. Verify `BASE_DOMAIN` is set correctly
2. Check CORS configuration in `main.ts`
3. Ensure development mode allows wildcard subdomains

### Organization Not Resolving

1. Verify organization has `domain` field set
2. Check database: `SELECT domain FROM organizations;`
3. Ensure subdomain matches exactly (case-sensitive)

## Security Considerations

### Reserved Subdomains

These subdomains are reserved and cannot be used by organizations:

- System subdomains: `www`, `api`, `admin`
- Infrastructure: `mail`, `ftp`, `cdn`, `static`
- Development: `dev`, `staging`, `test`

Add more in environment variables.

### Organization Isolation

Each subdomain provides complete organization isolation:

- Users can only access their organization's data
- API requests are automatically scoped to the organization
- Database queries include organization filtering

## Performance

- Subdomain resolution is cached for better performance
- Middleware runs before request processing for minimal overhead
- Organization context is attached once per request

## Migration Guide

### Existing Organizations

For existing organizations without subdomains:

```sql
-- Add domain to existing organizations
UPDATE organizations
SET domain = slug
WHERE domain IS NULL;
```

This automatically generates subdomains from slugs.

## Best Practices

1. **Subdomain Naming**: Use clear, brandable subdomains
2. **Consistency**: Match subdomain to organization slug
3. **SEO**: Use descriptive subdomains that reflect organization purpose
4. **Monitoring**: Monitor subdomain usage and performance
5. **Documentation**: Document any custom subdomain patterns

## Support

For issues or questions:

1. Check [SUBDOMAIN_TESTING.md](./SUBDOMAIN_TESTING.md)
2. Review this documentation
3. Check GitHub issues
4. Contact support team
