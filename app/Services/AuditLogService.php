<?php

namespace App\Services;

use App\Enums\AuditEventType;
use App\Jobs\LogAuditEvent;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Log a generic event asynchronously.
     */
    public function logEvent(AuditEventType $eventType, ?int $userId = null, array $data = []): void
    {
        $auditData = [
            'user_id' => $userId,
            'event_type' => $eventType->value,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'event_data' => $data,
            'created_at' => now(),
        ];

        LogAuditEvent::dispatch($auditData);
    }

    /**
     * Log an authentication event.
     */
    public function logAuthentication(?int $userId, bool $success): void
    {
        $eventType = $success ? AuditEventType::LOGIN : AuditEventType::FAILED_LOGIN;

        $this->logEvent($eventType, $userId, [
            'success' => $success,
        ]);
    }

    /**
     * Log email login event.
     */
    public function logEmailLogin(int $userId): void
    {
        $this->logEvent(AuditEventType::LOGIN_EMAIL, $userId);
    }

    /**
     * Log phone login event.
     */
    public function logPhoneLogin(int $userId): void
    {
        $this->logEvent(AuditEventType::LOGIN_PHONE, $userId);
    }

    /**
     * Log OAuth login event.
     */
    public function logOAuthLogin(int $userId, string $provider): void
    {
        $this->logEvent(AuditEventType::LOGIN_OAUTH, $userId, [
            'provider' => $provider,
        ]);
    }

    /**
     * Log registration event.
     */
    public function logRegistration(int $userId, string $method): void
    {
        $eventType = match ($method) {
            'email' => AuditEventType::REGISTERED_EMAIL,
            'phone' => AuditEventType::REGISTERED_PHONE,
            'oauth' => AuditEventType::REGISTERED_OAUTH,
            default => AuditEventType::REGISTERED_EMAIL,
        };

        $this->logEvent($eventType, $userId, [
            'method' => $method,
        ]);
    }

    /**
     * Log password changed event.
     */
    public function logPasswordChanged(int $userId): void
    {
        $this->logEvent(AuditEventType::PASSWORD_CHANGED, $userId);
    }

    /**
     * Log email changed event.
     */
    public function logEmailChanged(int $userId, string $oldEmail, string $newEmail): void
    {
        $this->logEvent(AuditEventType::EMAIL_CHANGED, $userId, [
            'old_email' => $oldEmail,
            'new_email' => $newEmail,
        ]);
    }

    /**
     * Log phone added event.
     */
    public function logPhoneAdded(int $userId, string $phone): void
    {
        $this->logEvent(AuditEventType::PHONE_ADDED, $userId, [
            'phone' => $phone,
        ]);
    }

    /**
     * Log phone changed event.
     */
    public function logPhoneChanged(int $userId, string $oldPhone, string $newPhone): void
    {
        $this->logEvent(AuditEventType::PHONE_CHANGED, $userId, [
            'old_phone' => $oldPhone,
            'new_phone' => $newPhone,
        ]);
    }

    /**
     * Log phone verified event.
     */
    public function logPhoneVerified(int $userId): void
    {
        $this->logEvent(AuditEventType::PHONE_VERIFIED, $userId);
    }

    /**
     * Log 2FA enabled event.
     */
    public function logTwoFactorEnabled(int $userId, string $type): void
    {
        $this->logEvent(AuditEventType::TWO_FACTOR_ENABLED, $userId, [
            'type' => $type,
        ]);
    }

    /**
     * Log 2FA disabled event.
     */
    public function logTwoFactorDisabled(int $userId): void
    {
        $this->logEvent(AuditEventType::TWO_FACTOR_DISABLED, $userId);
    }

    /**
     * Log recovery code used event.
     */
    public function logRecoveryCodeUsed(int $userId): void
    {
        $this->logEvent(AuditEventType::TWO_FACTOR_RECOVERY_CODE_USED, $userId);
    }

    /**
     * Log OAuth linked event.
     */
    public function logOAuthLinked(int $userId, string $provider): void
    {
        $this->logEvent(AuditEventType::OAUTH_LINKED, $userId, [
            'provider' => $provider,
        ]);
    }

    /**
     * Log OAuth unlinked event.
     */
    public function logOAuthUnlinked(int $userId, string $provider): void
    {
        $this->logEvent(AuditEventType::OAUTH_UNLINKED, $userId, [
            'provider' => $provider,
        ]);
    }

    /**
     * Log avatar uploaded event.
     */
    public function logAvatarUploaded(int $userId, string $avatarUrl): void
    {
        $this->logEvent(AuditEventType::AVATAR_UPLOADED, $userId, [
            'avatar_url' => $avatarUrl,
        ]);
    }

    /**
     * Log avatar deleted event.
     */
    public function logAvatarDeleted(int $userId): void
    {
        $this->logEvent(AuditEventType::AVATAR_DELETED, $userId);
    }

    /**
     * Log session revoked event.
     */
    public function logSessionRevoked(int $userId, string $sessionId): void
    {
        $this->logEvent(AuditEventType::SESSION_REVOKED, $userId, [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Log account deactivated event.
     */
    public function logAccountDeactivated(int $userId): void
    {
        $this->logEvent(AuditEventType::ACCOUNT_DEACTIVATED, $userId);
    }

    /**
     * Log account deletion requested event.
     */
    public function logAccountDeletionRequested(int $userId, ?string $reason = null): void
    {
        $this->logEvent(AuditEventType::ACCOUNT_DELETION_REQUESTED, $userId, [
            'reason' => $reason,
        ]);
    }

    /**
     * Log a transaction event.
     */
    public function logTransaction(int $transactionId, array $details, ?int $userId = null): void
    {
        $this->logEvent(AuditEventType::INVESTMENT_PURCHASED, $userId, [
            'transaction_id' => $transactionId,
            'details' => $details,
        ]);
    }

    /**
     * Log a user-related audit event.
     */
    public static function log(\App\Models\User $user, AuditEventType $eventType, array $data = []): void
    {
        (new self)->logEvent($eventType, $user->id, $data);
    }

    /**
     * Log a system event (no user context).
     */
    public static function logSystemEvent(AuditEventType $eventType, array $data = []): void
    {
        (new self)->logEvent($eventType, null, $data);
    }
}
