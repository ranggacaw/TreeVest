<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

class EncryptionService
{
    /**
     * Encrypt a string value.
     */
    public function encrypt(string $value): string
    {
        return Crypt::encryptString($value);
    }

    /**
     * Decrypt an encrypted string.
     */
    public function decrypt(string $payload): string
    {
        return Crypt::decryptString($payload);
    }

    /**
     * Encrypt an array or object.
     */
    public function encryptData(mixed $data): string
    {
        return Crypt::encrypt($data);
    }

    /**
     * Decrypt into an array or object.
     */
    public function decryptData(string $payload): mixed
    {
        return Crypt::decrypt($payload);
    }
}
