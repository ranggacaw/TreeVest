# Authentication Documentation

This document provides an overview of the authentication system in the Treevest application.

## Overview

The Treevest platform supports multiple authentication methods:

- **Email-based Authentication**: Traditional email/password login
- **Phone-based Authentication**: Registration and login using phone number with SMS OTP verification
- **Social OAuth**: Login via Google, Facebook, and Apple
- **Two-Factor Authentication (2FA)**: Optional TOTP (app-based) or SMS OTP 2FA

## Email Authentication

### Registration

1. Navigate to `/register`
2. Fill in name and email
3. Set a password
4. Click "Register"
5. Verify email via link sent to the provided email address

### Login

1. Navigate to `/login`
2. Enter email and password
3. Click "Login"
4. If 2FA is enabled, complete the 2FA challenge

### Password Reset

1. Navigate to `/forgot-password`
2. Enter email address
3. Click "Send Password Reset Link"
4. Check email for reset link
5. Set new password via the link

## Phone Authentication

### Registration with Phone

1. Navigate to `/register/phone`
2. Select country code
3. Enter phone number
4. Click "Send OTP"
5. Enter the 6-digit OTP code received via SMS
6. Create a name for your account
7. Complete registration

### Login with Phone

1. Navigate to `/login/phone`
2. Enter phone number
3. Click "Send OTP"
4. Enter the 6-digit OTP code received via SMS
5. Complete login

### OTP Rules

- OTP codes are 6 digits
- OTP codes expire after 10 minutes
- OTP codes are single-use
- Maximum 5 OTP send attempts per hour per phone number

## Social OAuth

### Google OAuth

1. Navigate to `/login` or `/register`
2. Click "Sign in with Google"
3. Authorize the application on Google's consent screen
4. Complete registration/login

### Facebook OAuth

1. Navigate to `/login` or `/register`
2. Click "Sign in with Facebook"
3. Authorize the application on Facebook's consent screen
4. Complete registration/login

### Apple OAuth

1. Navigate to `/login` or `/register`
2. Click "Sign in with Apple"
3. Sign in with Apple ID
4. Complete registration/login

### Linking OAuth Providers

1. Navigate to `/profile`
2. Scroll to "Connected Accounts" section
3. Click "Connect" next to desired provider (Google, Facebook, or Apple)
4. Authorize the provider
5. Confirm with your password

### Unlinking OAuth Providers

1. Navigate to `/profile`
2. Scroll to "Connected Accounts" section
3. Click "Disconnect" next to the provider you want to unlink
4. Confirm the action

## Two-Factor Authentication (2FA)

### Enabling 2FA (TOTP)

1. Navigate to `/profile/2fa`
2. Select "Authenticator App (TOTP)"
3. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
4. Enter the 6-digit code from your authenticator app
5. Download and save your recovery codes
6. Click "Enable 2FA"

### Enabling 2FA (SMS)

1. Navigate to `/profile/2fa`
2. Select "SMS OTP"
3. Verify your phone number
4. Click "Enable 2FA"

### Using 2FA During Login

1. Enter your email/password or phone number
2. Click "Login"
3. Enter the 6-digit code from your authenticator app or SMS
4. Complete login

### Using Recovery Codes

1. If you lose access to your 2FA device, click "Lost your device?" during login
2. Enter one of your 8 recovery codes
3. Each recovery code is single-use
4. After using a recovery code, consider re-enabling 2FA with new recovery codes

### Regenerating Recovery Codes

1. Navigate to `/profile/2fa`
2. Scroll to "Recovery Codes" section
3. Click "Regenerate Recovery Codes"
4. Download and save the new codes

### Disabling 2FA

1. Navigate to `/profile/2fa`
2. Scroll to "Disable 2FA" section
3. Confirm with your password
4. 2FA will be disabled for your account

## Session Management

### Viewing Active Sessions

1. Navigate to `/profile/sessions`
2. View all active sessions including:
   - Device type (Desktop, Mobile, Tablet)
   - Browser and platform
   - IP address
   - Last activity time

### Revoking a Specific Session

1. Navigate to `/profile/sessions`
2. Find the session you want to revoke
3. Click "Revoke" next to that session
4. The session will be immediately terminated

### Logging Out All Other Devices

1. Navigate to `/profile/sessions`
2. Click "Log out all other devices"
3. Confirm the action
4. All sessions except the current one will be terminated

## Profile Management

### Updating Profile Information

1. Navigate to `/profile`
2. Edit name, email, or phone number
3. Click "Save"
4. If email or phone is changed, you'll need to verify the new contact method

### Adding a Phone Number

1. Navigate to `/profile`
2. Enter phone number
3. Click "Add Phone Number"
4. Verify via OTP sent to your phone

### Uploading an Avatar

1. Navigate to `/profile`
2. Click "Upload Avatar"
3. Select an image file (JPEG, PNG, or WebP, max 2MB)
4. The image will be automatically resized to 512x512 pixels
5. Click "Save"

### Deleting an Avatar

1. Navigate to `/profile`
2. Click "Remove Avatar"
3. Confirm the action

## Account Deactivation

### Deactivating Your Account

1. Navigate to `/profile/settings`
2. Scroll to "Account Deactivation" section
3. Click "Deactivate Account"
4. Confirm the action
5. Your account will be soft-deleted and you'll be logged out

### Requesting Full Deletion (GDPR)

1. Navigate to `/profile/settings`
2. Scroll to "Account Deletion" section
3. Click "Request Account Deletion"
4. Submit your deletion request
5. An admin will review your request
6. Once approved, your data will be permanently deleted (subject to legal retention requirements)

## Security Best Practices

1. **Use a strong password**: At least 12 characters with a mix of letters, numbers, and symbols
2. **Enable 2FA**: Always use two-factor authentication for enhanced security
3. **Keep recovery codes safe**: Store your recovery codes in a secure location
4. **Review active sessions**: Regularly check your active sessions and revoke suspicious ones
5. **Use a password manager**: Use a password manager to generate and store strong passwords
6. **Be cautious of phishing**: Never enter your credentials on suspicious websites
7. **Keep software updated**: Ensure your browser and authenticator app are up to date

## Troubleshooting

### Not Receiving OTP Codes

- Check that your phone number is correct
- Ensure your SMS inbox is not full
- Contact support if the issue persists

### Can't Access 2FA Codes

- Use one of your recovery codes
- Contact support for account recovery
- Be prepared to verify your identity

### OAuth Callback Fails

- Clear your browser cookies
- Try a different browser
- Ensure you're not using an incognito/private window with strict settings

### Account Locked

- If locked due to too many failed login attempts, wait 15 minutes before retrying
- Contact support if you believe your account was locked in error

## Support

For authentication-related issues, contact support at support@treevest.com.
