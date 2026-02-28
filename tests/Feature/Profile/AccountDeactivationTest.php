<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountDeactivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_deactivate_account()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile/deactivate');

        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertGuest();
    }

    public function test_deactivated_user_cannot_login()
    {
        $user = User::factory()->create();
        $user->delete();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors();
        $this->assertGuest();
    }

    public function test_deactivated_user_profile_hidden()
    {
        $user = User::factory()->create();
        $user->delete();

        $response = $this->get('/profile');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_restore_deactivated_account()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $user->delete();

        $response = $this->actingAs($admin)
            ->post('/admin/users/'.$user->id.'/restore');

        $response->assertStatus(200);

        $user = User::withTrashed()->find($user->id);
        $this->assertNull($user->deleted_at);
    }

    public function test_user_can_request_full_account_deletion()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile/delete-request');

        $response->assertStatus(200);

        $this->assertDatabaseHas('gdpr_deletion_requests', [
            'user_id' => $user->id,
        ]);
    }

    public function test_user_must_be_authenticated_to_view_account_settings()
    {
        $response = $this->get('/profile/settings');

        $response->assertRedirect('/login');
    }
}
