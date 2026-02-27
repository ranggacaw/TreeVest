<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    /**
     * Test that security headers are present in the response.
     */
    public function test_security_headers_are_present(): void
    {
        $response = $this->get('/');

        $headers = [
            'X-Frame-Options' => 'SAMEORIGIN',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Content-Security-Policy',
        ];

        foreach ($headers as $key => $value) {
            if (is_int($key)) {
                $response->assertHeader($value);
            } else {
                $response->assertHeader($key, $value);
            }
        }
    }
}
