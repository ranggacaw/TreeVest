<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileLocaleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set up available locales for testing
        config(['app.available_locales' => ['en' => 'English', 'id' => 'Bahasa Indonesia']]);
    }

    public function test_authenticated_user_can_update_locale_to_valid_value()
    {
        $user = User::factory()->create(['locale' => 'en']);
        
        $response = $this->actingAs($user)
            ->patch('/profile/locale', [
                'locale' => 'id'
            ]);
        
        $response->assertRedirect();
        $this->assertEquals('id', $user->fresh()->locale);
    }

    public function test_submitting_unsupported_locale_returns_validation_error()
    {
        $user = User::factory()->create(['locale' => 'en']);
        
        $response = $this->actingAs($user)
            ->patch('/profile/locale', [
                'locale' => 'fr'
            ]);
        
        $response->assertSessionHasErrors('locale');
        $this->assertEquals('en', $user->fresh()->locale);
    }

    public function test_unauthenticated_request_redirects_to_login()
    {
        $response = $this->patch('/profile/locale', [
            'locale' => 'id'
        ]);
        
        $response->assertRedirect('/login');
    }

    public function test_user_can_update_locale_to_english()
    {
        $user = User::factory()->create(['locale' => 'id']);
        
        $response = $this->actingAs($user)
            ->patch('/profile/locale', [
                'locale' => 'en'
            ]);
        
        $response->assertRedirect();
        $this->assertEquals('en', $user->fresh()->locale);
    }
}