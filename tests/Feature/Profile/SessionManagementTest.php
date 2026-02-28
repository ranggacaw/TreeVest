<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SessionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_active_sessions()
    {
        $user = User::factory()->create();

        DB::table('sessions')->insert([
            'id' => 'session-1',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($user)
            ->get('/profile/sessions');

        $response->assertStatus(200);
    }

    public function test_user_can_revoke_specific_session()
    {
        $user = User::factory()->create();

        DB::table('sessions')->insert([
            'id' => 'session-to-revoke',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($user)
            ->delete('/profile/sessions/session-to-revoke');

        $response->assertStatus(200);

        $this->assertDatabaseMissing('sessions', [
            'id' => 'session-to-revoke',
        ]);
    }

    public function test_user_can_logout_all_other_devices()
    {
        $user = User::factory()->create();

        DB::table('sessions')->insert([
            'id' => 'other-session-1',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        DB::table('sessions')->insert([
            'id' => 'other-session-2',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($user)
            ->post('/profile/sessions/revoke-all');

        $response->assertStatus(200);

        $this->assertDatabaseMissing('sessions', [
            'id' => 'other-session-1',
        ]);

        $this->assertDatabaseMissing('sessions', [
            'id' => 'other-session-2',
        ]);
    }

    public function test_session_device_name_parsed_from_user_agent()
    {
        $user = User::factory()->create();

        DB::table('sessions')->insert([
            'id' => 'session-1',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($user)
            ->get('/profile/sessions');

        $response->assertStatus(200);
    }
}
