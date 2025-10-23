# 📧 Email Setup Guide

## Issue Detected

Port 1025 appears to have a system SMTP server that requires authentication. We've moved Mailpit to port 1026.

## ✅ Quick Setup

### 1. Update `.env` file

Change SMTP_PORT from 1025 to 1026:

```env
SMTP_HOST=localhost
SMTP_PORT=1026
SMTP_FROM=noreply@mave-cms.local
SMTP_SECURE=false
APP_URL=http://localhost:3000
```

### 2. Mailpit is Now Running On:

- **SMTP Server**: localhost:1026
- **Web UI**: http://localhost:8026

### 3. Restart Your Server

```bash
cd /directory/mave-2-engine
lsof -ti:7845 | xargs kill -9
pnpm start:dev
```

### 4. Test Email

```bash
curl -X POST http://localhost:7845/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  --data '{"query":"mutation { sendTestEmail(email: \"test@example.com\") }"}'
```

### 5. View Emails

Open: **http://localhost:8026**

---

## 🧪 Test 2FA with Email

Once emails are working, test the complete 2FA flow:

### Step 1: Generate 2FA Secret

```graphql
mutation {
  generate2FASecret {
    secret
    qrCode
    otpauthUrl
  }
}
```

**Returns**: QR code as base64 image

### Step 2: Scan QR Code

- Use Google Authenticator or Authy app
- Scan the QR code from the response

### Step 3: Enable 2FA

```graphql
mutation Enable2FA($input: Enable2FAInput!) {
  enable2FA(input: $input) {
    enabled
    backupCodes
  }
}
```

**Variables**:

```json
{
  "input": {
    "token": "123456"
  }
}
```

(Use the 6-digit code from your authenticator app)

**Check email**: You'll receive "2FA Enabled" notification at http://localhost:8026

### Step 4: Login with 2FA

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    requiresTwoFactor
    twoFactorToken
    user {
      id
      email
    }
  }
}
```

**Variables**:

```json
{
  "input": {
    "organizationId": "YOUR_ORG_ID",
    "emailOrUsername": "your_email",
    "password": "secure_password",
    "twoFactorCode": "123456"
  }
}
```

---

## 🔧 Troubleshooting

### Mailpit Not Working?

```bash
# Check if running
docker ps | grep mailpit

# View logs
docker logs mailpit

# Restart
docker restart mailpit

# Stop and remove
docker stop mailpit && docker rm mailpit

# Start fresh
docker run -d --name mailpit -p 1026:1025 -p 8026:8025 axllent/mailpit
```

### Can't Connect to Mailpit?

Make sure:

- ✅ Docker is running
- ✅ Ports 1026 and 8026 are available
- ✅ `.env` has `SMTP_PORT=1026`
- ✅ Server is restarted after `.env` changes

### Still Getting Auth Errors?

There might be another SMTP server on your system. Try different ports:

```bash
# Use port 2525
docker run -d --name mailpit -p 2525:1025 -p 8026:8025 axllent/mailpit
```

Then update `.env`:

```env
SMTP_PORT=2525
```

---

## 📊 What Emails to Expect

### Registration Flow:

1. User registers → **Welcome email** sent

### Password Reset:

1. Request reset → **Password reset link** sent
2. Password changed → **Password changed notification** sent

### 2FA Flow:

1. Enable 2FA → **2FA enabled notification** sent
2. Disable 2FA → **2FA disabled warning** sent

### Login Events (when implemented):

1. New login detected → **New login notification** sent

---

## 🚀 Production Setup

For production, replace Mailpit with a real service in `.env`:

```env
# SendGrid Example
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
APP_URL=https://yourdomain.com
```

No code changes needed - just update environment variables!

---

## ✨ Features Implemented

- ✅ Nodemailer integration
- ✅ Handlebars email templates
- ✅ Welcome emails
- ✅ Password reset emails
- ✅ 2FA notification emails
- ✅ Beautiful HTML templates
- ✅ Test email endpoint
- ✅ Automatic email sending on auth events

**Current Status**: Email system fully integrated with authentication flows! 🎉
