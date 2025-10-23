# 📧 Mailing Service Toggle Implementation

## Overview

The mailing service can now be toggled on/off using the `MAILING_SERVICE` environment variable. When disabled, all email sending operations will be skipped gracefully without causing errors.

## Configuration

### Environment Variable

Add the following to your `.env` file:

```env
# Enable/disable mailing service (enabled/disabled)
MAILING_SERVICE=enabled
```

**Values:**
- `enabled` (default): All emails will be sent normally
- `disabled`: All emails will be skipped with log messages

## Implementation Details

### 1. EmailService Updates

All email methods in `EmailService` now check the mailing service status before sending:

```typescript
async sendWelcomeEmail(to: string, firstName: string) {
  if (!this.isMailingServiceEnabled()) {
    this.logSkippedEmail('Welcome Email', to);
    return;
  }
  // ... send email
}
```

### 2. EmailModule Configuration

The `EmailModule` now uses a mock configuration when mailing service is disabled:

```typescript
if (mailingService.toLowerCase() !== 'enabled') {
  console.log('Mailing service is disabled - using mock configuration');
  return {
    transport: {
      host: 'localhost',
      port: 1025,
      secure: false,
      ignoreTLS: true,
      auth: false,
    },
    // ... minimal config
  };
}
```

### 3. Graceful Error Handling

All authentication flows already have proper try-catch blocks around email sending, so disabling the mailing service won't break any functionality:

```typescript
try {
  await this.emailService.sendNewLoginNotification(/* ... */);
} catch (error) {
  // Don't fail login if email fails
  console.error('Failed to send new login email:', error);
}
```

## Affected Email Types

The following email types are controlled by the `MAILING_SERVICE` setting:

1. **Welcome Email** - Sent during user registration
2. **Email Verification** - Sent for email verification
3. **Password Reset** - Sent when requesting password reset
4. **2FA Enabled Notification** - Sent when 2FA is enabled
5. **2FA Disabled Notification** - Sent when 2FA is disabled
6. **New Login Notification** - Sent on successful login
7. **Password Changed Notification** - Sent when password is changed
8. **Test Email** - Sent via GraphQL test endpoint

## Usage Examples

### Development Environment

```env
# Disable emails for local development
MAILING_SERVICE=disabled
```

### Production Environment

```env
# Enable emails for production
MAILING_SERVICE=enabled
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Testing

Run the test script to verify the functionality:

```bash
node test-mailing-service.js
```

This will test both enabled and disabled states and show the expected behavior.

## Log Messages

When mailing service is disabled, you'll see log messages like:

```
Email sending skipped - Mailing service disabled. Type: Welcome Email, To: user@example.com
Email sending skipped - Mailing service disabled. Type: Password Reset, To: user@example.com
```

## Benefits

1. **Development**: Skip emails during local development
2. **Testing**: Test authentication flows without sending real emails
3. **Staging**: Test with disabled emails before production
4. **Debugging**: Isolate email-related issues
5. **Compliance**: Meet requirements for environments where emails shouldn't be sent
