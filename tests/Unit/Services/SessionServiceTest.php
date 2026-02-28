<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\SessionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Tests\TestCase;

class SessionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected SessionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SessionService;
        Session::shouldReceive('getId')->andReturn('current-session-id');
    }

    public function test_get_active_sessions_for_user()
    {
        $user = User::factory()->create();

        DB::table('sessions')->insert([
            'id' => 'session-1',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        DB::table('sessions')->insert([
            'id' => 'session-2',
            'user_id' => $user->id,
            'ip_address' => '192.168.1.1',
            'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
            'payload' => 'test',
            'last_activity' => time() - 3600,
        ]);

        $sessions = $this->service->getActiveSessions($user);

        $this->assertCount(2, $sessions);
        $this->assertEquals('session-1', $sessions[0]['id']);
        $this->assertEquals('Desktop', $sessions[0]['device']);
        $this->assertEquals('127.0.0.1', $sessions[0]['ip_address']);
        $this->assertEquals('iPhone', $sessions[1]['device']);
    }

    public function test_revoke_session_by_id()
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

        $result = $this->service->revokeSession('session-to-revoke');

        $this->assertTrue($result);

        $this->assertDatabaseMissing('sessions', [
            'id' => 'session-to-revoke',
        ]);
    }

    public function test_revoke_session_fails_for_current_session()
    {
        $result = $this->service->revokeSession('current-session-id');

        $this->assertFalse($result);
    }

    public function test_revoke_all_other_sessions()
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

        DB::table('sessions')->insert([
            'id' => 'current-session-id',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $deleted = $this->service->revokeAllOtherSessions($user);

        $this->assertEquals(2, $deleted);

        $this->assertDatabaseHas('sessions', ['id' => 'current-session-id']);
        $this->assertDatabaseMissing('sessions', ['id' => 'other-session-1']);
        $this->assertDatabaseMissing('sessions', ['id' => 'other-session-2']);
    }

    public function test_update_last_login()
    {
        $user = User::factory()->create([
            'last_login_at' => null,
            'last_login_ip' => null,
        ]);

        $request = \Illuminate\Http\Request::create('/login', 'POST', [], [], [], [
            'REMOTE_ADDR' => '192.168.1.100',
        ]);

        $this->service->updateLastLogin($user, $request);

        $user->refresh();

        $this->assertNotNull($user->last_login_at);
        $this->assertEquals('192.168.1.100', $user->last_login_ip);
    }

    public function test_get_device_name_desktop()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('getDeviceName');
        $method->setAccessible(true);

        $device = $method->invoke($this->service, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        $this->assertEquals('Desktop', $device);
    }

    public function test_get_device_name_mobile()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('getDeviceName');
        $method->setAccessible(true);

        $device = $method->invoke($this->service, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');

        $this->assertEquals('iPhone', $device);
    }

    public function test_get_device_name_tablet()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('getDeviceName');
        $method->setAccessible(true);

        $device = $method->invoke($this->service, 'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X)');

        $this->assertEquals('Tablet', $device);
    }

    public function test_get_device_name_unknown()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('getDeviceName');
        $method->setAccessible(true);

        $device = $method->invoke($this->service, 'Unknown User Agent');

        $this->assertEquals('Unknown', $device);
    }

    public function test_format_last_activity()
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('formatLastActivity');
        $method->setAccessible(true);

        $timestamp = time() - 3600;
        $formatted = $method->invoke($this->service, $timestamp);

        $this->assertStringContainsString('ago', $formatted);
    }
}
