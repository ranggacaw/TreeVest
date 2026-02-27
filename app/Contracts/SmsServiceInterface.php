<?php

namespace App\Contracts;

interface SmsServiceInterface
{
    public function sendOtp(string $phone, string $code): bool;
}
