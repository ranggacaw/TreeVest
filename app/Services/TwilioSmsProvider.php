<?php

namespace App\Services;

use App\Contracts\SmsServiceInterface;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class TwilioSmsProvider implements SmsServiceInterface
{
    protected Client $client;

    public function __construct()
    {
        $this->client = new Client(
            config('services.sms.twilio.sid'),
            config('services.sms.twilio.token')
        );
    }

    public function sendOtp(string $phone, string $code): bool
    {
        try {
            $message = $this->client->messages->create(
                $phone,
                [
                    'from' => config('services.sms.twilio.from'),
                    'body' => "Your verification code is: {$code}. Valid for 10 minutes.",
                ]
            );

            return $message->sid !== null;
        } catch (\Exception $e) {
            Log::error('Failed to send SMS OTP', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
