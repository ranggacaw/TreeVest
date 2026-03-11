<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set up available locales for testing
        config(['app.available_locales' => ['en' => 'English', 'id' => 'Bahasa Indonesia']]);
        config(['app.locale' => 'en']);
        config(['app.fallback_locale' => 'en']);
    }

    public function test_authenticated_user_with_indonesian_locale_gets_content_language_header()
    {
        $user = User::factory()->create(['locale' => 'id']);

        $response = $this->actingAs($user)->get('/');

        $response->assertHeader('Content-Language', 'id');
    }

    public function test_guest_with_accept_language_id_gets_indonesian_content_language_header()
    {
        $response = $this->withHeaders([
            'Accept-Language' => 'id-ID,id;q=0.9,en;q=0.8',
        ])->get('/');

        $response->assertHeader('Content-Language', 'id');
    }

    public function test_unsupported_locale_falls_back_to_english()
    {
        $response = $this->withHeaders([
            'Accept-Language' => 'fr-FR,fr;q=0.9,en;q=0.8',
        ])->get('/');

        $response->assertHeader('Content-Language', 'en');
    }

    public function test_authenticated_user_locale_overrides_accept_language()
    {
        $user = User::factory()->create(['locale' => 'en']);

        $response = $this->actingAs($user)
            ->withHeaders([
                'Accept-Language' => 'id-ID,id;q=0.9,en;q=0.8',
            ])
            ->get('/');

        $response->assertHeader('Content-Language', 'en');
    }
}
