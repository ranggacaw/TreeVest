# KYC Provider Integration

This document describes how to integrate third-party KYC (Know Your Customer) verification providers into Treevest.

## Supported Providers

Currently, Treevest supports the following KYC providers:
- **Manual** (default): Admin-based manual review of uploaded documents
- **Future providers**: Stripe Identity, Jumio, Onfido (to be integrated)

## Provider Architecture

The KYC system uses a provider-agnostic architecture via the `KycProviderInterface`. All KYC providers must implement this interface.

### Interface Definition

```php
namespace App\Contracts;

interface KycProviderInterface
{
    public function submitForVerification(KycVerification $verification): string;
    public function checkVerificationStatus(string $referenceId): array;
    public function cancelVerification(string $referenceId): bool;
}
```

### Methods

1. **submitForVerification**
   - Submits verification documents to the provider
   - Returns a provider-specific reference ID
   - Parameters: `KycVerification $verification`
   - Returns: `string` - Reference ID for tracking

2. **checkVerificationStatus**
   - Checks the current status of a verification
   - Parameters: `string $referenceId`
   - Returns: `array` - Status information
     ```php
     [
         'status' => 'pending|verified|rejected|failed',
         'message' => 'Human-readable status message',
         'verified_at' => 'ISO8601 datetime or null',
         'rejected_at' => 'ISO8601 datetime or null',
         'details' => [], // Provider-specific details
     ]
     ```

3. **cancelVerification**
   - Cancels an in-progress verification
   - Parameters: `string $referenceId`
   - Returns: `bool` - Success status

## Creating a New Provider

### Step 1: Create the Provider Class

Create a new class in `app/Services/KycProviders/`:

```php
<?php

namespace App\Services\KycProviders;

use App\Contracts\KycProviderInterface;
use App\Models\KycVerification;

class YourProvider implements KycProviderInterface
{
    public function submitForVerification(KycVerification $verification): string
    {
        // Submit documents to provider API
        // Return provider reference ID
    }

    public function checkVerificationStatus(string $referenceId): array
    {
        // Check status from provider API
        // Return status array
    }

    public function cancelVerification(string $referenceId): bool
    {
        // Cancel verification with provider
        // Return success status
    }
}
```

### Step 2: Register the Provider

Update `config/treevest.php` to add your provider configuration:

```php
return [
    'kyc' => [
        'provider' => env('KYC_PROVIDER', 'manual'),
        'providers' => [
            'your_provider' => [
                'api_key' => env('YOUR_PROVIDER_API_KEY'),
                'api_secret' => env('YOUR_PROVIDER_API_SECRET'),
                'webhook_secret' => env('YOUR_PROVIDER_WEBHOOK_SECRET'),
                'base_url' => 'https://api.yourprovider.com',
            ],
        ],
    ],
];
```

### Step 3: Update Service Provider Binding

In `app/Providers/AppServiceProvider.php`, add the provider binding:

```php
$this->app->bind(
    \App\Contracts\KycProviderInterface::class,
    fn () => match(config('treevest.kyc.provider')) {
        'manual' => new \App\Services\KycProviders\ManualKycProvider(),
        'your_provider' => new \App\Services\KycProviders\YourProvider(),
        default => new \App\Services\KycProviders\ManualKycProvider(),
    }
);
```

### Step 4: Configure Webhooks (if needed)

If your provider uses webhooks, create a webhook controller:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KycVerification;
use App\Services\KycVerificationService;

class YourProviderWebhookController extends Controller
{
    public function __construct(
        protected KycVerificationService $kycService
    ) {}

    public function handle(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('X-Your-Provider-Signature');
        // Validate signature...

        // Parse webhook payload
        $payload = $request->json()->all();
        $referenceId = $payload['reference_id'];
        $status = $payload['status'];

        // Find verification and update status
        $verification = KycVerification::where('provider_reference_id', $referenceId)->first();
        if ($verification) {
            // Update verification based on provider status
        }

        return response()->json(['status' => 'received']);
    }
}
```

Add webhook route to `routes/web.php`:

```php
Route::post('/webhooks/kyc/your-provider', [YourProviderWebhookController::class, 'handle'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('webhooks.kyc.your-provider');
```

## Configuration

Add the following environment variables to `.env`:

```bash
KYC_PROVIDER=your_provider
YOUR_PROVIDER_API_KEY=your_api_key
YOUR_PROVIDER_API_SECRET=your_api_secret
YOUR_PROVIDER_WEBHOOK_SECRET=webhook_secret_for_signature_verification
```

## Testing

### Unit Tests

Create unit tests for your provider in `tests/Unit/Services/YourProviderTest.php`:

```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\KycProviders\YourProvider;
use App\Models\KycVerification;

class YourProviderTest extends TestCase
{
    public function test_submit_for_verification()
    {
        // Test submission logic
    }

    public function test_check_verification_status()
    {
        // Test status checking
    }

    public function test_cancel_verification()
    {
        // Test cancellation
    }
}
```

### Integration Tests

Test the provider integration in `tests/Feature/KycVerificationTest.php` by mocking the provider responses.

## Security Considerations

1. **API Credentials**: Store API keys in environment variables, never commit to version control
2. **Webhook Verification**: Always verify webhook signatures to prevent forged requests
3. **Data Privacy**: Ensure provider is GDPR/privacy-compliant for user data
4. **Error Handling**: Handle provider errors gracefully without exposing sensitive information
5. **Rate Limiting**: Respect provider API rate limits

## Migration Guide

To switch from Manual to a new provider:

1. Install and configure the new provider
2. Test in staging environment
3. Gradually roll out to production
4. Monitor for issues
5. Manual verifications in progress can continue; new verifications will use the new provider

## Common Provider Integrations

### Stripe Identity

- API: https://stripe.com/docs/api/identity
- Webhooks: Supported via Stripe Connect
- Document types: ID cards, passports

### Jumio

- API: https://developer.jumio.com/
- Webhooks: Supported
- Document types: ID cards, passports, driver's licenses

### Onfido

- API: https://developers.onfido.com/
- Webhooks: Supported
- Document types: ID cards, passports, driver's licenses, residence permits

## Troubleshooting

### Common Issues

1. **Webhook not receiving**: Check webhook URL is reachable and correct
2. **Signature verification failing**: Ensure secrets match between provider and app
3. **Timeout errors**: Provider API may be slow; consider increasing timeouts
4. **Missing documents**: Ensure document types match provider requirements

### Debugging

Enable debug logging for KYC operations:

```bash
LOG_LEVEL=debug
```

Check logs:

```bash
tail -f storage/logs/laravel.log | grep KYC
```

## Support

For issues specific to a provider, consult:
- Provider documentation
- Provider support channels
- Treevest internal documentation (if available)
