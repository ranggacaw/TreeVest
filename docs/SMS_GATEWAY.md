# SMS Gateway Setup (Twilio)

This document explains how to set up Twilio as the SMS gateway for OTP verification in the Treevest application.

## Prerequisites

- A Twilio account (free trial or paid)
- Twilio Account SID and Auth Token
- A Twilio phone number (or verified phone number for trial)

## Creating a Twilio Account

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Click "Sign Up"
3. Fill in your details
4. Verify your email address
5. Choose a plan (Free Trial is sufficient for development)

## Getting Your Twilio Credentials

### Account SID and Auth Token

1. Log in to your Twilio Console at [https://console.twilio.com](https://console.twilio.com)
2. Navigate to "Home" dashboard
3. Copy the "Account SID"
4. Copy the "Auth Token" (click the eye icon to reveal)

### Twilio Phone Number

1. Navigate to "Phone Numbers" → "Manage" → "Active Numbers"
2. If you don't have a number, click "Get a trial phone number"
3. Choose a number from the available list
4. Copy the phone number (format: +1XXXXXXXXXX)

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
SMS_DRIVER=twilio
TWILIO_SID=your_account_sid_here
TWILIO_TOKEN=your_auth_token_here
TWILIO_FROM=+1234567890
```

### Configuration File

The configuration is already defined in `config/services.php`:

```php
'sms' => [
    'driver' => env('SMS_DRIVER', 'twilio'),
    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'from' => env('TWILIO_FROM'),
    ],
],
```

## Twilio Sandbox (Free Trial)

### Trial Limitations

- You can only send SMS to **verified phone numbers**
- SMS messages include a footer: "Sent from your Twilio trial account"
- Outbound calls are limited

### Verifying Phone Numbers (Trial)

1. Navigate to "Phone Numbers" → "Verified Caller IDs"
2. Click "Add Verified Caller IDs"
3. Enter a phone number
4. Click "Send Verification"
5. Enter the verification code received via SMS or phone call
6. The number is now verified and can receive OTP codes

### Upgrading to Paid Account

When you're ready for production:

1. Navigate to "Billing" → "Upgrade your project"
2. Choose a plan based on your expected usage
3. Add payment information
4. Your account will be upgraded within minutes

## Testing OTP Delivery

### Manual Testing

1. Create a test user registration
2. Enter your verified phone number
3. Request OTP
4. Check your SMS for the 6-digit code
5. Verify the code

### Automated Testing

Use the `TwilioSmsProvider` mock in your tests:

```php
$smsService = Mockery::mock(SmsServiceInterface::class);
$smsService->shouldReceive('sendOtp')
    ->with('+60123456789', '123456')
    ->andReturn(true);
```

## Cost Considerations

### Twilio Pricing (as of 2025)

- **SMS to US/Canada**: $0.0079 per segment (160 characters)
- **SMS to Malaysia**: $0.0462 per segment
- **SMS to UK**: $0.0420 per segment
- **SMS to Australia**: $0.0575 per segment

### Estimating Your Costs

- OTP codes are typically 6-8 characters
- Each OTP is 1 SMS segment
- If you have 1,000 users with 5 OTP sends per month:
  - 5,000 SMS × $0.0079 = $39.50 per month (US)

### Volume Discounts

Twilio offers volume discounts for high-volume usage. Contact their sales team for custom pricing.

## Security Best Practices

1. **Never commit credentials**: Never add TWILIO_SID or TWILIO_TOKEN to version control
2. **Use environment variables**: Always use `.env` for sensitive configuration
3. **Rotate tokens regularly**: Change your Auth Token periodically
3. **Monitor usage**: Set up alerts for unusual SMS usage patterns
4. **Rate limiting**: Implement rate limiting to prevent abuse
5. **Validate phone numbers**: Use Twilio's Lookup API to validate phone numbers before sending SMS

## Troubleshooting

### SMS Not Delivered

- Check if the phone number is in E.164 format
- Verify the phone number is not on a carrier blocklist
- Check your Twilio account balance
- Review Twilio error logs in the Console

### "Forbidden" Error

- Verify your Account SID and Auth Token are correct
- Ensure your trial account has verified the recipient phone number
- Check if you've exceeded your trial limits

### Invalid Phone Number Format

Ensure phone numbers are in E.164 format:
- `+60123456789` (Malaysia)
- `+1234567890` (USA)
- `+441234567890` (UK)

The application automatically normalizes phone numbers to E.164 format.

### High Costs

- Review your SMS logs for duplicate sends
- Implement retry logic with exponential backoff
- Consider using a different SMS provider for international coverage
- Set up budget alerts in Twilio Console

## Alternative SMS Providers

If Twilio doesn't meet your needs, you can switch to another provider:

### Vonage (Nexmo)

```env
SMS_DRIVER=vonage
VONAGE_KEY=your_api_key
VONAGE_SECRET=your_api_secret
VONAGE_FROM=your_phone_number
```

### AWS SNS

```env
SMS_DRIVER=aws_sns
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
```

## Monitoring and Alerts

### Twilio Console

1. Navigate to "Monitor" → "Messaging Logs"
2. View all SMS delivery attempts
3. Filter by date, status, or phone number
4. Export logs for analysis

### Custom Alerts

Set up webhooks to receive real-time SMS delivery status:

```php
// routes/web.php
Route::post('/sms/delivery-status', [SmsDeliveryController::class, 'handle']);
```

## References

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio PHP SDK](https://www.twilio.com/docs/libraries/php)
- [E.164 Format](https://www.twilio.com/docs/glossary/what-e164)
- [SMS Pricing](https://www.twilio.com/sms/pricing)

## Support

For Twilio-related issues:
- Twilio Support: [help@twilio.com](mailto:help@twilio.com)
- Twilio Documentation: [https://www.twilio.com/docs](https://www.twilio.com/docs)

For application-related issues:
- Treevest Support: [support@treevest.com](mailto:support@treevest.com)
