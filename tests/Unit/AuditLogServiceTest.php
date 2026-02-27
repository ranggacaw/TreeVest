<?php

namespace Tests\Unit;

use App\Enums\AuditEventType;
use App\Models\AuditLog;
use App\Services\AuditLogService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_log_a_generic_event()
    {
        $user = \App\Models\User::factory()->create();

        $service = new AuditLogService;
        $service->logEvent(AuditEventType::ADMIN_ACTION, $user->id, ['action' => 'test']);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'event_type' => AuditEventType::ADMIN_ACTION->value,
            'event_data' => json_encode(['action' => 'test']),
        ]);
    }

    public function test_it_can_log_authentication_success()
    {
        $user = \App\Models\User::factory()->create();

        $service = new AuditLogService;
        $service->logAuthentication($user->id, true);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'event_type' => AuditEventType::LOGIN->value,
            'event_data' => json_encode(['success' => true]),
        ]);
    }

    public function test_it_can_log_authentication_failure()
    {
        $service = new AuditLogService;
        $service->logAuthentication(null, false);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => null,
            'event_type' => AuditEventType::FAILED_LOGIN->value,
            'event_data' => json_encode(['success' => false]),
        ]);
    }

    public function test_audit_logs_are_immutable()
    {
        $log = AuditLog::create([
            'event_type' => AuditEventType::LOGIN,
            'event_data' => [],
        ]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Audit logs are immutable');

        $log->update(['user_id' => 1]);
    }

    public function test_audit_logs_cannot_be_deleted()
    {
        $log = AuditLog::create([
            'event_type' => AuditEventType::LOGIN,
            'event_data' => [],
        ]);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Audit logs are immutable');

        $log->delete();
    }
}
