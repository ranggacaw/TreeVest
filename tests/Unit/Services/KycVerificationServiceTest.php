<?php

namespace Tests\Unit\Services;

use App\Enums\KycDocumentType;
use App\Enums\KycStatus;
use App\Models\KycDocument;
use App\Models\KycVerification;
use App\Models\User;
use App\Services\KycVerificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KycVerificationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected KycVerificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(KycVerificationService::class);
        Storage::fake('kyc_documents');
    }

    public function test_create_verification_creates_new_kyc_verification()
    {
        $user = User::factory()->create();

        $verification = $this->service->createVerification($user, 'MY');

        $this->assertDatabaseHas('kyc_verifications', [
            'id' => $verification->id,
            'user_id' => $user->id,
            'jurisdiction_code' => 'MY',
            'status' => KycStatus::PENDING,
        ]);
    }

    public function test_create_verification_returns_kyc_verification_instance()
    {
        $user = User::factory()->create();

        $verification = $this->service->createVerification($user);

        $this->assertInstanceOf(KycVerification::class, $verification);
    }

    public function test_upload_document_creates_kyc_document()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::PENDING,
        ]);

        $fileContent = base64_encode('test document content');
        $document = $this->service->uploadDocument(
            $verification,
            KycDocumentType::PASSPORT,
            $fileContent,
            'passport.pdf',
            'application/pdf',
            strlen($fileContent)
        );

        $this->assertInstanceOf(KycDocument::class, $document);
        $this->assertDatabaseHas('kyc_documents', [
            'id' => $document->id,
            'kyc_verification_id' => $verification->id,
            'document_type' => KycDocumentType::PASSPORT,
            'original_filename' => 'passport.pdf',
        ]);
    }

    public function test_submit_for_review_requires_required_documents()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::PENDING,
        ]);

        $result = $this->service->submitForReview($verification);

        $this->assertFalse($result);
    }

    public function test_submit_for_review_succeeds_with_required_documents()
    {
        Notification::fake();

        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::PENDING,
        ]);

        KycDocument::factory()->create([
            'kyc_verification_id' => $verification->id,
            'document_type' => KycDocumentType::PASSPORT,
        ]);
        KycDocument::factory()->create([
            'kyc_verification_id' => $verification->id,
            'document_type' => KycDocumentType::PROOF_OF_ADDRESS,
        ]);

        $result = $this->service->submitForReview($verification);

        $this->assertTrue($result);
        $this->assertEquals(KycStatus::SUBMITTED, $verification->refresh()->status);
        $this->assertNotNull($verification->submitted_at);
    }

    public function test_approve_verification_sets_verified_status()
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::SUBMITTED,
            'submitted_at' => now(),
        ]);

        $result = $this->service->approveVerification($verification, $admin);

        $this->assertTrue($result);
        $this->assertEquals(KycStatus::VERIFIED, $verification->refresh()->status);
        $this->assertNotNull($verification->verified_at);
        $this->assertNotNull($verification->expires_at);
    }

    public function test_approve_verification_updates_user_kyc_status()
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['kyc_status' => 'submitted']);
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::SUBMITTED,
            'submitted_at' => now(),
        ]);

        $this->service->approveVerification($verification, $admin);

        $this->assertEquals('verified', $user->refresh()->kyc_status);
        $this->assertNotNull($user->kyc_verified_at);
    }

    public function test_reject_verification_sets_rejected_status()
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::SUBMITTED,
            'submitted_at' => now(),
        ]);

        $reason = 'Documents are unclear';
        $result = $this->service->rejectVerification($verification, $admin, $reason);

        $this->assertTrue($result);
        $this->assertEquals(KycStatus::REJECTED, $verification->refresh()->status);
        $this->assertEquals($reason, $verification->rejection_reason);
    }

    public function test_check_expiry_returns_false_for_unverified()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::PENDING,
        ]);

        $result = $this->service->checkExpiry($verification);

        $this->assertFalse($result);
    }

    public function test_check_expiry_returns_true_for_expired()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::VERIFIED,
            'verified_at' => now()->subYear()->subDay(),
            'expires_at' => now()->subDay(),
        ]);

        $result = $this->service->checkExpiry($verification);

        $this->assertTrue($result);
    }

    public function test_check_expiry_returns_false_for_valid()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::VERIFIED,
            'verified_at' => now(),
            'expires_at' => now()->addYear(),
        ]);

        $result = $this->service->checkExpiry($verification);

        $this->assertFalse($result);
    }

    public function test_get_latest_verification_returns_latest()
    {
        $user = User::factory()->create();
        $oldVerification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDay(),
        ]);
        $newVerification = KycVerification::factory()->create([
            'user_id' => $user->id,
        ]);

        $result = $this->service->getLatestVerification($user);

        $this->assertEquals($newVerification->id, $result->id);
    }

    public function test_create_or_update_creates_new_when_no_pending()
    {
        $user = User::factory()->create();

        $verification = $this->service->createOrUpdateVerification($user);

        $this->assertInstanceOf(KycVerification::class, $verification);
    }

    public function test_create_or_update_returns_existing_pending()
    {
        $user = User::factory()->create();
        $existingVerification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::PENDING,
        ]);

        $verification = $this->service->createOrUpdateVerification($user);

        $this->assertEquals($existingVerification->id, $verification->id);
    }
}
