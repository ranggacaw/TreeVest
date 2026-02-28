# OAuth Provider Setup Guide

This document explains how to set up OAuth applications for Google, Facebook, and Apple for the Treevest authentication system.

## Overview

The Treevest application uses Laravel Socialite to authenticate users via OAuth providers. Users can register and log in using their existing accounts from Google, Facebook, and Apple.

## Google OAuth Setup

### Creating a Google Cloud Project

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Treevest")
4. Click "Create"

### Enabling Google+ API

1. Navigate to "APIs & Services" → "Library"
2. Search for "Google+ API" or "People API"
3. Click on the API
4. Click "Enable"

### Creating OAuth 2.0 Credentials

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen:
   - Choose "External" for user type
   - Click "Create"
   - Fill in required fields:
     - App name: Treevest
     - User support email: your-email@example.com
     - Developer contact information: your-email@example.com
   - Click "Save and Continue"
4. Add scopes:
   - Add `email` (for user's email address)
   - Add `profile` (for user's name)
   - Click "Save and Continue"
5. Test users (for production):
   - Skip or add test users if in development mode
   - Click "Save and Continue"
6. Create OAuth client ID:
   - Application type: Web application
   - Name: Treevest Web
   - Authorized redirect URIs:
     - Production: `https://yourdomain.com/auth/google/callback`
     - Development: `http://localhost:8000/auth/google/callback`
   - Click "Create"
7. Copy the **Client ID** and **Client Secret**

### Environment Configuration

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### Production Considerations

- **Complete verification**: Google requires app verification for production use
- **Privacy Policy**: Add a privacy policy URL to your OAuth consent screen
- **Terms of Service**: Add terms of service if required
- **Domain verification**: Verify your domain in Google Search Console

## Facebook OAuth Setup

### Creating a Facebook App

1. Go to [https://developers.facebook.com/](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Click "Create App"
4. Choose "Authentication and Account Creation" or "Consumer"
5. Enter app name (e.g., "Treevest")
6. Click "Create App"

### Configuring App Settings

1. Navigate to "App Settings" → "Basic"
2. Fill in required information:
   - App Display Name: Treevest
   - App Contact Email: your-email@example.com
   - Privacy Policy URL: https://yourdomain.com/privacy
   - User Data Deletion URL: https://yourdomain.com/privacy/delete
3. Click "Save Changes"

### Adding Facebook Login

1. Navigate to "Add a Product" → "Facebook Login"
2. Click "Set Up"
3. Configure Facebook Login:
   - Select "Web"
   - Site URL: `https://yourdomain.com/`
   - Click "Save"
4. Valid OAuth Redirect URIs:
   - Production: `https://yourdomain.com/auth/facebook/callback`
   - Development: `http://localhost:8000/auth/facebook/callback`
   - Click "Save"

### Getting Client ID and Secret

1. Navigate to "App Settings" → "Basic"
2. Copy the **App ID** (Client ID)
3. Click "Show" next to **App Secret** to reveal the secret

### Environment Configuration

Add to your `.env` file:

```env
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/facebook/callback
```

### Production Considerations

- **App Review**: Facebook requires app review for public access
- **Permissions**: Request minimal permissions (email, public_profile)
- **App Mode**: Switch from "Development" to "Live" in App Settings when ready

## Apple OAuth Setup

### Prerequisites

- Apple Developer Program membership ($99/year)
- **Required for production**: App Review and live distribution

### Creating an App ID

1. Go to [https://developer.apple.com/account/](https://developer.apple.com/account/)
2. Navigate to "Identifiers" → "App IDs"
3. Click "+" to create a new App ID
4. Select type: "App IDs" (not Services ID)
5. Fill in:
   - Description: Treevest
   - Bundle ID: com.yourcompany.treevest (or a reverse-domain style ID)
   - Capabilities: Check "Sign In with Apple"
6. Click "Continue" → "Register"

### Creating a Services ID

1. Navigate to "Identifiers" → "Services IDs"
2. Click "+" to create a new Services ID
3. Fill in:
   - Description: Treevest Web
   - Bundle ID: com.yourcompany.treevest.web
4. Click "Continue" → "Register"
5. Configure the Service ID:
   - Enable "Sign In with Apple"
   - Primary App ID: Select the App ID created earlier
   - Return URLs:
     - Production: `https://yourdomain.com/auth/apple/callback`
     - Development: `http://localhost:8000/auth/apple/callback`
   - Click "Save"

### Creating a Private Key

1. Navigate to "Certificates, Identifiers & Profiles" → "Keys"
2. Click "+" to create a new key
3. Name the key: "Treevest Sign In"
4. Enable "Sign In with Apple"
5. Click "Configure" and select your App ID
6. Click "Continue" → "Register"
7. Download the `.p8` key file (you can only download it once!)
8. Copy the **Key ID** (10-character alphanumeric string)

### Environment Configuration

Add to your `.env` file:

```env
APPLE_CLIENT_ID=com.yourcompany.treevest.web
APPLE_CLIENT_SECRET=your_generated_jwt_token
APPLE_REDIRECT_URI=http://localhost:8000/auth/apple/callback
```

### Generating Apple Client Secret

Apple requires a JWT token for client secret. Generate it using:

```php
// php artisan tinker
$teamId = 'YOUR_TEAM_ID'; // Found in Apple Developer membership
$keyId = 'YOUR_KEY_ID'; // The 10-character key ID
$clientId = 'com.yourcompany.treevest.web'; // Your Services ID
$privateKey = file_get_contents('/path/to/your/AuthKey_ABC123.p8');

$payload = [
    'iss' => $teamId,
    'iat' => time(),
    'exp' => time() + (180 * 24 * 60 * 60), // 6 months
    'aud' => 'https://appleid.apple.com',
    'sub' => $clientId,
];

$jwt = \Firebase\JWT\JWT::encode($payload, $privateKey, 'ES256');
echo $jwt;
```

**Note**: The JWT token expires after 6 months. You'll need to regenerate it periodically.

### Production Considerations

- **Team ID**: Found in Apple Developer membership details
- **Bundle ID**: Must match your actual app bundle ID
- **Key Rotation**: You can have multiple keys; rotate them for security

## Configuration File

The configuration is already defined in `config/services.php`:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
'facebook' => [
    'client_id' => env('FACEBOOK_CLIENT_ID'),
    'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
    'redirect' => env('FACEBOOK_REDIRECT_URI'),
],
'apple' => [
    'client_id' => env('APPLE_CLIENT_ID'),
    'client_secret' => env('APPLE_CLIENT_SECRET'),
    'redirect' => env('APPLE_REDIRECT_URI'),
],
```

## Testing OAuth Flow

### Local Development

1. Start your local server: `php artisan serve`
2. Ensure your redirect URIs in each provider match `http://localhost:8000/auth/{provider}/callback`
3. Test registration/login flow for each provider

### Testing Checklist

For each OAuth provider:

- [ ] Redirect to provider's consent screen
- [ ] User approves authorization
- [ ] Callback receives user data
- [ ] New user is created or existing user is logged in
- [ ] OAuth provider is linked to user account
- [ ] Email from provider matches user's email

### Debugging OAuth Issues

Enable Laravel's logging to view OAuth errors:

```php
// routes/web.php
Route::get('/auth/{provider}/callback', function ($provider) {
    $user = Socialite::driver($provider)->stateless()->user();
    logger('OAuth user data', ['provider' => $provider, 'user' => $user]);
    // ... rest of callback logic
});
```

## Security Best Practices

1. **Never commit credentials**: Never add client secrets to version control
2. **Use HTTPS**: Always use HTTPS in production for redirect URIs
3. **State parameter**: Socialite automatically includes a state parameter for CSRF protection
4. **Minimal scopes**: Request only the permissions you need (email, profile)
5. **Validate emails**: Always verify the user's email after OAuth login
6. **Secure client secrets**: Rotate client secrets periodically

## Troubleshooting

### "Invalid Client" Error

- Check Client ID and Client Secret in `.env`
- Ensure redirect URI matches exactly (including trailing slashes)
- Verify the app is not in maintenance mode

### "Redirect URI Mismatch" Error

- Ensure redirect URI in provider console matches your application
- Check for typos in the URL
- Verify HTTP vs HTTPS

### Apple OAuth Issues

- Ensure you have an active Apple Developer membership
- Verify your JWT token is not expired
- Check that the Key ID and Team ID are correct
- Remember that JWT tokens expire after 6 months

### Email Mismatch

- When linking OAuth to existing accounts, ensure emails match
- Provide users with options to link accounts manually
- Handle the case where OAuth email is already in use

## Production Deployment

1. **Update redirect URIs** in each provider's console to production URLs
2. **Generate new secrets** for production (don't use development secrets)
3. **Complete verification** for Google and Facebook apps
4. **Add privacy policy** and terms of service URLs
5. **Test OAuth flow** in production environment
6. **Set up monitoring** for OAuth callback failures
7. **Configure rate limiting** to prevent abuse

## References

- [Laravel Socialite Documentation](https://laravel.com/docs/socialite)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)

## Support

For OAuth provider-specific issues:
- Google: [https://support.google.com/cloud](https://support.google.com/cloud)
- Facebook: [https://developers.facebook.com/support/](https://developers.facebook.com/support/)
- Apple: [https://developer.apple.com/support/](https://developer.apple.com/support/)

For application-related issues:
- Treevest Support: [support@treevest.com](mailto:support@treevest.com)
