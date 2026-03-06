<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminTranslationUITest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_view_translations_index()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.translations.index'));
        $response->assertStatus(200);
    }

    public function test_admin_can_view_translations_queue()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.translations.queue'));
        $response->assertStatus(200);
    }
}
