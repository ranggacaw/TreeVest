<?php

namespace Tests\Unit;

use App\Services\EncryptionService;
use Tests\TestCase;

class EncryptionServiceTest extends TestCase
{
    public function test_it_can_encrypt_and_decrypt_a_string(): void
    {
        $service = new EncryptionService;
        $original = 'sensitive-data';

        $encrypted = $service->encrypt($original);
        $this->assertNotEquals($original, $encrypted);

        $decrypted = $service->decrypt($encrypted);
        $this->assertEquals($original, $decrypted);
    }

    public function test_it_can_encrypt_and_decrypt_data_structures(): void
    {
        $service = new EncryptionService;
        $original = ['phone' => '+1234567890', 'amount' => 5000];

        $encrypted = $service->encryptData($original);
        $this->assertIsString($encrypted);

        $decrypted = $service->decryptData($encrypted);
        $this->assertEquals($original, $decrypted);
    }
}
